import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

export type NBAScore = {
  home: { total: number };
  away: { total: number };
  periodScores?: { period: number; home: number; away: number }[];
  homeTeam: string;
  awayTeam: string;
  status: "canceled" | "scheduled" | "in_play" | "final";
  statusText?: string;
  displayClock?: string;
  period?: number;
  lastUpdated?: number;
  lastPlay?: {
    text: string;
    teamId?: string;
    homeWinPercentage?: number;
    athletes?: any[];
  };
};

type DateParam = string | { date?: string; utc?: string; timestamp?: number };
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useGameScores = (
  league: string,
  homeIdOrName?: string | null,
  awayIdOrName?: string | null,
  date?: DateParam
) => {
  const [score, setScore] = useState<NBAScore>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const skipFetch =
    !league ||
    !homeIdOrName ||
    !awayIdOrName ||
    homeIdOrName === awayIdOrName;

  // ---------------------------
  // Fetch score
  // ---------------------------
  const fetchScore = useCallback(
    async (silent = false) => {
      if (skipFetch) return;

      try {
        if (!silent) setLoading(true);
        setWarning(null);

        const params: Record<string, any> = {
          league,
          home: homeIdOrName,
          away: awayIdOrName,
        };

        if (date) {
          if (typeof date === "string") params.date = date;
          else if (date.timestamp) params.date = date.timestamp;
          else if (date.utc) params.date = date.utc;
          else if (date.date) params.date = date.date;
        }

        const { data } = await axios.get<NBAScore>(
          `${BASE_URL}/api/scores`,
          { params }
        );

        setScore(data);
        setLastRefresh(new Date());
      } catch (err: any) {
        console.warn(`[${league}] score warning`, err);
        setWarning(err?.message ?? "Unable to refresh score");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [league, homeIdOrName, awayIdOrName, date, skipFetch]
  );

  // ---------------------------
  // Polling controller
  // ---------------------------
  useEffect(() => {
    if (skipFetch) return;

    // Always clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Initial fetch
    fetchScore(true);

    // Decide polling strategy
    if (!score) return;

    // ❌ Never poll canceled or final
    if (score.status === "final" || score.status === "canceled") {
      return;
    }

    // ⏱ Poll intervals
    let intervalMs = 60000; // default

    if (score.status === "in_play") {
      intervalMs = 15000; // 🔥 live game
    }

    intervalRef.current = setInterval(() => {
      fetchScore(true);
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    skipFetch,
    fetchScore,
    score?.status, // 👈 CRITICAL
  ]);

  const refresh = useCallback(() => {
    if (!skipFetch) fetchScore(false);
  }, [fetchScore, skipFetch]);

  return {
    score,
    loading,
    warning,
    refresh,
    isLive: score?.status === "in_play",
    lastRefresh,
  };
};
