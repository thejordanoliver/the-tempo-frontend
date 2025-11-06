import { useEffect, useState } from "react";

export type TeamRecord = {
  overall: string | null;
};

export type League = "nba" | "cbb";

/**
 * useTeamRecord
 * Fetches and caches a team's record from ESPN,
 * handling league-specific data differences.
 */
export function useTeamRecord(teamId?: string | number, league: League = "nba") {
  const [record, setRecord] = useState<TeamRecord>({ overall: null });
  const [loading, setLoading] = useState(false);

  const isValidTeamId =
    teamId !== undefined &&
    teamId !== null &&
    (typeof teamId === "string" || typeof teamId === "number") &&
    String(teamId).trim() !== "" &&
    !isNaN(Number(teamId));

  const getLocalDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
  };

  const [dayWindow, setDayWindow] = useState(() => ({
    prev: getLocalDate(-1),
    current: getLocalDate(0),
    next: getLocalDate(1),
  }));

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

  useEffect(() => {
    if (!isValidTeamId) return;

    const fetchRecord = async () => {
      try {
        setLoading(true);

        const url =
          league === "nba"
            ? `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}`
            : `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/${teamId}`;

        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`⚠️ Failed to fetch record for team ${teamId} (${league})`);
          setRecord({ overall: null });
          return;
        }

        const data = await res.json();

        let recordSummary: string | null = null;

        // --- Handle NBA structure ---
        if (data?.team?.record?.items) {
          recordSummary =
            data.team.record.items.find(
              (r: any) =>
                r.type === "total" ||
                r.name === "overall" ||
                r.type === "overall"
            )?.summary ?? null;
        }

        // --- Handle CBB fallback ---
        if (!recordSummary && data?.team?.record?.items?.length) {
          recordSummary = data.team.record.items[0]?.summary ?? null;
        }

        // --- Ultimate fallback ---
        if (!recordSummary && data?.team?.record?.summary) {
          recordSummary = data.team.record.summary ?? null;
        }

        setRecord({ overall: recordSummary });
      } catch (err) {
        console.error(`❌ Error fetching record for team ${teamId} (${league}):`, err);
        setRecord({ overall: null });
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [isValidTeamId, teamId, league, dayWindow.current]);

  return { record, loading };
}
