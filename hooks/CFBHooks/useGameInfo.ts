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
 * STRICT:
 * - Both team ESPN IDs must match
 * - Event date must be day-of, day-before, or day-after target date
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

  const skipFetch =
    !date || homeEspnId === undefined || awayEspnId === undefined;

  const fetchData = useCallback(async () => {
    if (skipFetch) return;

    setLoading(true);
    setError(null);

    try {
      /* ---------------- Parse target date ---------------- */
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
        return;
      }

      /* ---------------- Build YYYYMMDD ---------------- */
      const makeYMD = (d: Date): string => {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        return `${y}${m}${day}`;
      };

      /* ---------------- Allowed date window ---------------- */
      const dayOffsets = [-1, 0, 1];

      const urls = dayOffsets.map((offset) => {
        const d = new Date(targetDate!);
        d.setUTCDate(d.getUTCDate() + offset);

        return `https://site.api.espn.com/apis/site/v2/sports/football/${
          league === "cfb" ? "college-football" : "nfl"
        }/scoreboard?dates=${makeYMD(d)}`;
      });

      /* ---------------- Fetch ESPN ---------------- */
      const results = await Promise.allSettled(urls.map((u) => axios.get(u)));

      const allEvents = results
        .filter(
          (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled"
        )
        .flatMap((r) => r.value.data?.events || []);

      if (!allEvents.length) {
        setHeadlineText(undefined);
        return;
      }

      const homeId = Number(homeEspnId);
      const awayId = Number(awayEspnId);

      const targetMidnight = new Date(targetDate);
      targetMidnight.setUTCHours(0, 0, 0, 0);

      const minTs = targetMidnight.getTime() - 86400000; // -1 day
      const maxTs = targetMidnight.getTime() + 2 * 86400000; // +1 day inclusive

      /* ---------------- STRICT FILTER ---------------- */
      const candidates = allEvents.filter((event: any) => {
        const competition = event?.competitions?.[0];
        if (!competition) return false;

        const competitors = competition.competitors ?? [];
        if (competitors.length < 2) return false;

        const teamIds = competitors.map((c: any) => Number(c?.team?.id));

        // ✅ BOTH teams must match
        const teamsMatch =
          (teamIds.includes(homeId) || teamIds.includes(-1)) &&
          (teamIds.includes(awayId) || teamIds.includes(-2));

        if (!teamsMatch) return false;

        // ✅ Date must be within allowed window
        const eventTs = new Date(event.date).getTime();
        return eventTs >= minTs && eventTs <= maxTs;
      });

      /* ---------------- Pick closest in time ---------------- */
      const targetTs = targetDate.getTime();
      let best = candidates[0];
      let bestDiff = Infinity;

      for (const e of candidates) {
        const diff = Math.abs(new Date(e.date).getTime() - targetTs);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = e;
        }
      }

      const headline = best?.competitions?.[0]?.notes?.[0]?.headline;

      setHeadlineText(headline);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch headline");
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
