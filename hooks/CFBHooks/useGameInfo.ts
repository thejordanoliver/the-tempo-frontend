import axios from "axios";
import { useCallback, useEffect, useState } from "react";

type ESPNDateInput =
  | string
  | {
      date?: string;
      utc?: string;
      timestamp?: number;
    };

interface CFBGameInfoResult {
  headlineText?: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches ESPN CFB game headline from competition.notes[0].headline only.
 * Handles both regular matchups and bowl/championship games with TBD teams.
 */
export const useCFBGameInfo = (
  homeEspnId?: number,
  awayEspnId?: number,
  date?: ESPNDateInput
): CFBGameInfoResult => {
  const [headlineText, setHeadlineText] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skipFetch = !date;

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
        const d = new Date(targetDate);
        d.setUTCDate(d.getUTCDate() + offset);
        return `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${makeYMD(
          d
        )}`;
      });

      // 🔄 Fetch all days in parallel
      const results = await Promise.allSettled(urls.map((u) => axios.get(u)));
      const allEvents = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .flatMap((r) => r.value.data?.events || []);

      if (!allEvents.length) {
        console.warn("[CFB Headline] No events found in ESPN response.");
        setHeadlineText(undefined);
        return;
      }

      // 🎯 Try to match exact team IDs first
      let game = null;
      if (homeEspnId && awayEspnId) {
        game = allEvents.find((g: any) => {
          const competitors = g?.competitions?.[0]?.competitors ?? [];
          const ids = competitors.map((c: any) => Number(c.team?.id));
          return ids.includes(Number(homeEspnId)) && ids.includes(Number(awayEspnId));
        });
      }

      // 🏆 Fallback — detect championship/bowl by name or headline
      if (!game) {
        const targetTs = targetDate.getTime();
        let bestMatch: any = null;
        let bestDiff = Infinity;

        for (const g of allEvents) {
          const comp = g?.competitions?.[0];
          const note = comp?.notes?.[0]?.headline?.toLowerCase() ?? "";
          const name = g?.name?.toLowerCase() ?? "";
          const eventTs = new Date(g.date).getTime();
          const diff = Math.abs(eventTs - targetTs);

          if (
            note.includes("bowl") ||
            note.includes("championship") ||
            name.includes("bowl") ||
            name.includes("championship")
          ) {
            if (diff < bestDiff) {
              bestDiff = diff;
              bestMatch = g;
            }
          }
        }

        game = bestMatch;
      }

      if (!game) {
        setHeadlineText(undefined);
        return;
      }

      const competition = game.competitions?.[0];
      const noteHeadline =
        competition?.notes?.[0]?.headline 

      setHeadlineText(noteHeadline);
    } catch (err: any) {
      console.error("[CFB Headline] Error fetching headline:", err.message);
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
