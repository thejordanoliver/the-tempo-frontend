import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { teams } from "constants/teamsCFB";

export type LineScore = {
  home: number[];
  away: number[];
};

// --- ESPN → internal mapping ---
const espnToInternal: Record<string, number> = {};
teams.forEach((t) => {
  if (t.espnID) espnToInternal[String(t.espnID)] = Number(t.id);
});

export const useCFBLineScore = (
  homeEspnID?: number,
  awayEspnID?: number,
  date?:
    | string
    | {
        date?: string;
        utc?: string;
        timestamp?: number | { timestamp?: number; utc?: string; date?: string };
      }
) => {
  const [lineScore, setLineScore] = useState<LineScore>({ home: [], away: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipFetch = !homeEspnID || !awayEspnID || !date;

  const fetchLineScore = useCallback(async () => {
    if (skipFetch) return;
    setLoading(true);
    setError(null);

    try {
      // --- Parse target date ---
      let targetDate: Date | null = null;

      if (typeof date === "string") {
        targetDate = new Date(date);
      } else if (typeof date === "object") {
        // Handle nested timestamp objects
        let tsObj: any =
          date.timestamp && typeof date.timestamp === "object"
            ? date.timestamp
            : date;

        if (tsObj.timestamp !== undefined) {
          // timestamp can be in seconds or ms
          targetDate =
            tsObj.timestamp < 1e12
              ? new Date(tsObj.timestamp * 1000)
              : new Date(tsObj.timestamp);
        } else if (tsObj.utc) {
          targetDate = new Date(tsObj.utc);
        } else if (tsObj.date) {
          targetDate = new Date(tsObj.date);
        }
      }

      if (!targetDate || isNaN(targetDate.getTime())) {
        console.warn("Invalid targetDate:", date);
        throw new Error("Invalid date provided to useCFBLineScore");
      }

      // --- Format date as YYYYMMDD for ESPN ---
      const makeYMD = (d: Date) => {
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const day = d.getDate().toString().padStart(2, "0");
        const year = d.getFullYear().toString();
        return `${year}${month}${day}`;
      };
      const yyyymmdd = makeYMD(targetDate);

      // --- Fetch scoreboard ---
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${yyyymmdd}`;
      const { data } = await axios.get(url);
      const games = data.events || [];

      // --- Find game by home/away ESPN IDs ---
      const game = games.find((g: any) => {
        const competitors = g.competitions?.[0]?.competitors || [];
        const ids = competitors.map((c: any) => Number(c.team.id));
        return ids.includes(homeEspnID) && ids.includes(awayEspnID);
      });

      if (!game) {
        console.warn(`[CFB LineScore] Game not found for ${homeEspnID} vs ${awayEspnID}`);
        setLineScore({ home: [], away: [] });
        return;
      }

      const competition = game.competitions?.[0];
      const competitors = competition?.competitors || [];
      const homeComp = competitors.find((c: any) => c.homeAway === "home");
      const awayComp = competitors.find((c: any) => c.homeAway === "away");

      if (!homeComp || !awayComp) {
        setLineScore({ home: [], away: [] });
        return;
      }

      const maxPeriods = Math.max(
        homeComp.linescores?.length ?? 0,
        awayComp.linescores?.length ?? 0
      );
      const homeLines = Array.from(
        { length: maxPeriods },
        (_, idx) => homeComp.linescores?.[idx]?.value ?? 0
      );
      const awayLines = Array.from(
        { length: maxPeriods },
        (_, idx) => awayComp.linescores?.[idx]?.value ?? 0
      );

      setLineScore({ home: homeLines, away: awayLines });
    } catch (err: any) {
      console.error("[CFB LineScore] Failed to fetch:", err);
      setError(err.message || "Failed to fetch line score");
    } finally {
      setLoading(false);
    }
  }, [homeEspnID, awayEspnID, date, skipFetch]);

  // Fetch once when dependencies change
  useEffect(() => {
    if (skipFetch) return;
    fetchLineScore();
  }, [fetchLineScore, skipFetch]);

  const refresh = useCallback(() => fetchLineScore(), [fetchLineScore]);

  return { lineScore, loading, error, refresh };
};
