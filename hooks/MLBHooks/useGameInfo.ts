import axios from "axios";
import { useCallback, useEffect, useState } from "react";

type ESPNDateInput =
  | string
  | {
      date?: string;
      utc?: string;
      timestamp?: number;
    };

interface GameInfoResult {
  headlineText?: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

type League = "mlb";

/**
 * MLB Headline Fetcher — Finds ESPN scoreboard game by date + teams.
 */
export const useGameInfo = (
  homeEspnId?: number,
  awayEspnId?: number,
  date?: ESPNDateInput
): GameInfoResult => {
  const [headlineText, setHeadlineText] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipFetch = !date;

  const fetchData = useCallback(async () => {
    if (skipFetch) return;

    setLoading(true);
    setError(null);

    try {
      /** -----------------------------
       *  Parse Date
       * ------------------------------ */
      let targetDate: Date | null = null;

      if (typeof date === "string") {
        targetDate = new Date(date);
      } else if (typeof date === "object") {
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

      /** Format YYYYMMDD utc */
      const makeYMD = (d: Date): string => {
        const yr = d.getUTCFullYear();
        const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
        const dy = String(d.getUTCDate()).padStart(2, "0");
        return `${yr}${mo}${dy}`;
      };

      /** Build ±2 day search */
      const dateOffsets = [-1, 0, 1, 2];
      const urls = dateOffsets.map((offset) => {
        const d = new Date(targetDate);
        d.setUTCDate(d.getUTCDate() + offset);
        return `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates=${makeYMD(
          d
        )}`;
      });

      /** Fetch in parallel */
      const results = await Promise.allSettled(urls.map((u) => axios.get(u)));

      const allEvents = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .flatMap((r) => r.value.data?.events ?? []);

      if (!allEvents.length) {
        setHeadlineText(undefined);
        return;
      }

      /** -----------------------------
       *  Try exact team match first
       * ------------------------------ */
      let game: any = null;

      if (homeEspnId && awayEspnId) {
        game = allEvents.find((ev: any) => {
          const comp = ev?.competitions?.[0]?.competitors ?? [];
          const ids = comp.map((c: any) => Number(c.team?.id));
          return (
            ids.includes(Number(homeEspnId)) &&
            ids.includes(Number(awayEspnId))
          );
        });
      }

      /** -----------------------------
       *  Fallback: closest date match
       * ------------------------------ */
      if (!game) {
        const targetTs = targetDate.getTime();
        let bestMatch: any = null;
        let bestDiff = Infinity;

        for (const ev of allEvents) {
          const eventTs = new Date(ev.date).getTime();
          const diff = Math.abs(eventTs - targetTs);

          if (diff < bestDiff) {
            bestDiff = diff;
            bestMatch = ev;
          }
        }

        game = bestMatch;
      }

      if (!game) {
        setHeadlineText(undefined);
        return;
      }

      const competition = game?.competitions?.[0];
      const headline = competition?.notes?.[0]?.headline;

      setHeadlineText(headline ?? undefined);
    } catch (err: any) {
      console.error("[MLB Headline] Error:", err.message);
      setError(err.message || "Failed to fetch headline");
    } finally {
      setLoading(false);
    }
  }, [homeEspnId, awayEspnId, date, skipFetch]);

  useEffect(() => {
    if (!skipFetch) fetchData();
  }, [fetchData, skipFetch]);

  return {
    headlineText,
    loading,
    error,
    refresh: fetchData,
  };
};
