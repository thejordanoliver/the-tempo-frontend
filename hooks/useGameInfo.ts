import axios from "axios";
import { useCallback, useEffect, useState } from "react";

type ESPNDateInput =
  | string
  | {
      date?: string;
      utc?: string;
      timestamp?: number;
    };

interface NBAGameInfoResult {
  headlineText?: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useGameInfo = (
  homeEspnId?: number,
  awayEspnId?: number,
  date?: ESPNDateInput
): NBAGameInfoResult => {
  const [headlineText, setHeadlineText] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipFetch = !date || !homeEspnId || !awayEspnId;

  const fetchData = useCallback(async () => {
    if (skipFetch) return;
    setLoading(true);
    setError(null);

    try {
      // --- Parse date safely ---
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

      // console.log("[useGameInfo] Input:", {
      //   homeEspnId,
      //   awayEspnId,
      //   date: targetDate.toISOString(),
      // });

      // --- Format ESPN date string ---
      const makeYMD = (d: Date) => {
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return `${year}${month}${day}`;
      };

      const dateOffsets = [-1, 0, 1];
      const urls = dateOffsets.map((offset) => {
        const d = new Date(targetDate);
        d.setUTCDate(d.getUTCDate() + offset);
        return `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${makeYMD(
          d
        )}&limit=500`;
      });

      // --- Fetch all three days in parallel ---
      const results = await Promise.allSettled(urls.map((u) => axios.get(u)));
      const allEvents = results
        .filter(
          (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled"
        )
        .flatMap((r) => r.value.data?.events || []);

      if (!allEvents.length) {
        console.warn("[NBA Headline] No events found in ESPN response.");
        setHeadlineText(undefined);
        return;
      }

      // --- Date comparison helper (UTC-safe) ---
      const isSameDayUTC = (a: Date, b: Date) =>
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate();

      // --- Find matching game ---
      const game = allEvents.find((g: any) => {
        const competitors = g?.competitions?.[0]?.competitors ?? [];
        const ids = competitors.map((c: any) => Number(c.team?.id));

        if (
          !ids.includes(Number(homeEspnId)) ||
          !ids.includes(Number(awayEspnId))
        )
          return false;

        const gameDate = new Date(g.date);

        // Allow a little flexibility (±1 day in UTC)
        const diffMs = Math.abs(gameDate.getTime() - targetDate.getTime());
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours <= 30 || isSameDayUTC(gameDate, targetDate);
      });

      if (!game) {
        console.warn(
          `[NBA Headline] No exact match found for teams ${homeEspnId} vs ${awayEspnId}`
        );
        setHeadlineText(undefined);
        return;
      }

      const competition = game.competitions?.[0];
      const noteHeadline = competition?.notes?.[0]?.headline;

      setHeadlineText(noteHeadline);
    } catch (err: any) {
      console.error("[NBA Headline] Error fetching headline:", err.message);
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
