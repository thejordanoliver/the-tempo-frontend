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

type League = "cfb" | "nfl";

/**
 * Fetches ESPN game headline from competition.notes[0].headline.
 * Strictly matches games by home + away ESPN team IDs.
 */
export const useGameInfo = (
  homeEspnId?: number,
  awayEspnId?: number,
  date?: ESPNDateInput,
  league: League = "cfb"
): GameInfoResult => {
  const [headlineText, setHeadlineText] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipFetch = !date || !homeEspnId || !awayEspnId;

  const fetchData = useCallback(async () => {
    if (skipFetch) return;
    setLoading(true);
    setError(null);

    try {
      // 🕓 Parse date
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

      // 📅 Format YYYYMMDD (UTC)
      const makeYMD = (d: Date): string => {
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return `${year}${month}${day}`;
      };

      // ⏱ Generate date range (±2 days)
      const dateOffsets = [-1, 0, 1, 2];
      const urls = dateOffsets.map((offset) => {
        const d = new Date(targetDate!);
        d.setUTCDate(d.getUTCDate() + offset);
        return `https://site.api.espn.com/apis/site/v2/sports/football/${
          league === "cfb" ? "college-football" : "nfl"
        }/scoreboard?dates=${makeYMD(d)}`;
      });

      // 🔄 Fetch all days in parallel
      const results = await Promise.allSettled(urls.map((u) => axios.get(u)));
      const allEvents = results
        .filter(
          (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled"
        )
        .flatMap((r) => r.value.data?.events || []);

      if (!allEvents.length) {
        console.warn(
          `[${league.toUpperCase()} Headline] No events found in ESPN response.`
        );
        setHeadlineText(undefined);
        return;
      }

      const homeIdNum = Number(homeEspnId);
      const awayIdNum = Number(awayEspnId);

      // 🎯 Strict match by BOTH team IDs
      const candidates = allEvents.filter((g: any) => {
        const competitors = g?.competitions?.[0]?.competitors ?? [];
        const ids = competitors.map((c: any) => Number(c.team?.id));
        return ids.includes(homeIdNum) && ids.includes(awayIdNum);
      });

      if (!candidates.length) {
        console.warn(
          `[${league.toUpperCase()} Headline] No game matched home=${homeIdNum} & away=${awayIdNum}`
        );
        setHeadlineText(undefined);
        return;
      }

      // If multiple matches, pick the one closest in time to targetDate
      const targetTs = targetDate.getTime();
      let bestGame: any = candidates[0];
      let bestDiff = Infinity;

      for (const g of candidates) {
        const eventTs = new Date(g.date).getTime();
        const diff = Math.abs(eventTs - targetTs);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestGame = g;
        }
      }

      const competition = bestGame?.competitions?.[0];
      const noteHeadline = competition?.notes?.[0]?.headline;

      setHeadlineText(noteHeadline);
    } catch (err: any) {
      console.error(
        `[${league.toUpperCase()} Headline] Error fetching headline:`,
        err.message
      );
      setError(err?.message || "Failed to fetch headline");
    } finally {
      setLoading(false);
    }
  }, [homeEspnId, awayEspnId, date, league, skipFetch]);

  useEffect(() => {
    if (!skipFetch) fetchData();
  }, [fetchData, skipFetch]);

  const refresh = useCallback(() => fetchData(), [fetchData]);

  return { headlineText, loading, error, refresh };
};
