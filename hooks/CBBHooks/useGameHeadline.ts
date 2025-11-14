import axios from "axios";
import { useCallback, useEffect, useState } from "react";

type ESPNDateInput =
  | string
  | {
      date?: string;
      utc?: string;
      timestamp?: number;
    };

interface MBBGameInfoResult {
  headlineText?: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches ESPN Men's College Basketball game headline from competition.notes[0].headline only.
 * Handles regular games and special events (tournaments, championship games) with TBD teams.
 * Fetches data from ±1 day around target date, including all Division I groups.
 */
export const useCBBHeadline = (
  homeEspnId?: number,
  awayEspnId?: number,
  date?: ESPNDateInput
): MBBGameInfoResult => {
  const [headlineText, setHeadlineText] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipFetch = !date || !homeEspnId || !awayEspnId;

  const fetchData = useCallback(async () => {
    if (skipFetch) return;
    setLoading(true);
    setError(null);

    try {
      // Parse date
      let targetDate: Date | null = null;
      if (typeof date === "string") targetDate = new Date(date);
      else if (typeof date === "object") {
        targetDate = date.timestamp
          ? new Date(date.timestamp * 1000)
          : date.utc
          ? new Date(date.utc)
          : date.date
          ? new Date(date.date)
          : null;
      }

      if (!targetDate || isNaN(targetDate.getTime())) {
        setError("Invalid or missing date");
        setLoading(false);
        return;
      }

      // Format YYYYMMDD (UTC)
      const makeYMD = (d: Date) => {
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return `${year}${month}${day}`;
      };

      // Fetch ±1 day (day before, day of, day after)
      const dateOffsets = [-1, 0, 1];
      const urls = dateOffsets.map((offset) => {
        const d = new Date(targetDate);
        d.setUTCDate(d.getUTCDate() + offset);
        return `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${makeYMD(
          d
        )}&groups=50&limit=500`;
      });

      // Fetch all three days in parallel
      const results = await Promise.allSettled(urls.map((u) => axios.get(u)));
      const allEvents = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .flatMap((r) => r.value.data?.events || []);

      if (!allEvents.length) {
        console.warn("[MBB Headline] No events found in ESPN response.");
        setHeadlineText(undefined);
        return;
      }

      // --- Match both team IDs and flexible date (day before, same day, day after) ---
      const targetTime = targetDate.getTime();
      const game = allEvents.find((g: any) => {
        const competitors = g?.competitions?.[0]?.competitors ?? [];
        const ids = competitors.map((c: any) => Number(c.team?.id));
        if (!ids.includes(Number(homeEspnId)) || !ids.includes(Number(awayEspnId)))
          return false;

        const gameDate = new Date(g.date).getTime();
        const diffDays = Math.round((gameDate - targetTime) / (1000 * 60 * 60 * 24));
        return diffDays >= -1 && diffDays <= 1; // within ±1 day
      });

      if (!game) {
        console.warn(
          `[MBB Headline] No exact match found for teams ${homeEspnId} vs ${awayEspnId}`
        );
        setHeadlineText(undefined);
        return;
      }

      const competition = game.competitions?.[0];
      const noteHeadline = competition?.notes?.[0]?.headline;

      setHeadlineText(noteHeadline);
    } catch (err: any) {
      console.error("[MBB Headline] Error fetching headline:", err.message);
      setError(err?.message || "Failed to fetch headline");
    } finally {
      setLoading(false);
    }
  }, [homeEspnId, awayEspnId, date, skipFetch]);

  useEffect(() => {
    if (!skipFetch) fetchData();
  }, [fetchData, skipFetch]);

  const refresh = useCallback(() => fetchData(), [fetchData]);

  return { headlineText, loading, error, refresh };
};
