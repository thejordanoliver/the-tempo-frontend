import { useEffect, useMemo, useState } from "react";

export type TeamRecord = {
  overall: string | null;
};

export type League =
  | "nba"
  | "cbb"
  | "wcbb"; // 👈 NEW (women's college basketball)

/**
 * useTeamRecord (memoized)
 */
export function useTeamRecord(
  teamId?: string | number,
  league: League = "nba"
) {
  const [record, setRecord] = useState<TeamRecord>({ overall: null });
  const [loading, setLoading] = useState(false);

  // --- Memoize validity check ---
  const isValidTeamId = useMemo(() => {
    if (teamId === undefined || teamId === null) return false;
    if (typeof teamId !== "string" && typeof teamId !== "number") return false;

    const s = String(teamId).trim();
    return s !== "" && !isNaN(Number(s));
  }, [teamId]);

  // --- Date helper (stable) ---
  const getLocalDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  };

  // --- Memoize day window ---
  const [dayWindow, setDayWindow] = useState(() => ({
    prev: getLocalDate(-1),
    current: getLocalDate(0),
    next: getLocalDate(1),
  }));

  // Updates automatically every hour
  useEffect(() => {
    const interval = setInterval(() => {
      setDayWindow({
        prev: getLocalDate(-1),
        current: getLocalDate(0),
        next: getLocalDate(1),
      });
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Memoize ESPN URL ---
  const teamUrl = useMemo(() => {
    if (!isValidTeamId) return null;

    switch (league) {
      case "nba":
        return `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}`;

      case "cbb":
        return `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/${teamId}`;

      case "wcbb":
        return `https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams/${teamId}`;

      default:
        return null;
    }
  }, [teamId, league, isValidTeamId]);

  // --- Fetch logic ---
  useEffect(() => {
    if (!teamUrl) return;

    let canceled = false;

    const fetchRecord = async () => {
      try {
        setLoading(true);

        const res = await fetch(teamUrl);
        if (!res.ok) {
          if (!canceled) setRecord({ overall: null });
          return;
        }

        const data = await res.json();
        if (canceled) return;

        let recordSummary: string | null = null;

        // Preferred structure (NBA / CBB / WCBB)
        if (data?.team?.record?.items?.length) {
          recordSummary =
            data.team.record.items.find(
              (r: any) =>
                r.type === "total" ||
                r.type === "overall" ||
                r.name === "overall"
            )?.summary ??
            data.team.record.items[0]?.summary ??
            null;
        }

        // Ultimate fallback
        if (!recordSummary && data?.team?.record?.summary) {
          recordSummary = data.team.record.summary;
        }

        setRecord({ overall: recordSummary });
      } catch (err) {
        if (!canceled) {
          console.error(
            `Error fetching record for team ${teamId} (${league}):`,
            err
          );
          setRecord({ overall: null });
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchRecord();

    return () => {
      canceled = true;
    };
  }, [teamUrl, dayWindow.current]);

  return { record, loading };
}
