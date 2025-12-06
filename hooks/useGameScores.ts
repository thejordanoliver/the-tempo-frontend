import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

export type NBAScore = {
  home: { total: number };
  away: { total: number };
  periodScores?: { period: number; home: number; away: number }[];
  homeTeam: string;
  awayTeam: string;
  status: "canceled" | "scheduled" | "in_play" | "final" ;
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
  const [score, setScore] = useState<NBAScore | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // 🟡 Replace "error" with "warning"
  const [warning, setWarning] = useState<string | null>(null);

  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const skipFetch =
    !league || !homeIdOrName || !awayIdOrName || homeIdOrName === awayIdOrName;

  const fetchScore = useCallback(
    async (isPolling = false) => {
      if (skipFetch) return;

      try {
        if (!isPolling) setLoading(true);
        setWarning(null);

        const params: Record<string, any> = {
          league,
          home: homeIdOrName,
          away: awayIdOrName,
        };

        if (date) {
          if (typeof date === "string") params.date = date;
          else if (typeof date === "object") {
            if (date.timestamp) params.date = date.timestamp;
            else if (date.utc) params.date = date.utc;
            else if (date.date) params.date = date.date;
          }
        }

        const { data } = await axios.get<NBAScore>(
          `${BASE_URL}/api/scores`,
          { params }
        );

        setScore(data);
        setLastRefresh(new Date());
      } catch (err: any) {
        console.warn(`[${league.toUpperCase()} Score] Warning:`, err);

        // 🟡 Don’t clear the score — keep last known good data
        setWarning(err?.message ?? "Unable to refresh score");
      } finally {
        if (!isPolling) setLoading(false);
      }
    },
    [league, homeIdOrName, awayIdOrName, date, skipFetch]
  );

  const getInterval = (status: NBAScore["status"] | undefined) => {
    if (status === "in_play") return 30000; // 30s for live games
    return 60000; // 60s for scheduled/final
  };

// 1️⃣ Base polling effect — starts once when inputs change
useEffect(() => {
  if (skipFetch) return;

  // Immediate fetch
  fetchScore(true);

  const interval = getInterval(score?.status);

  intervalRef.current = setInterval(() => {
    fetchScore(true);
  }, interval);

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [league, homeIdOrName, awayIdOrName, date]);

  useEffect(() => {
    if (score?.status === "final" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [score?.status]);

  const refresh = useCallback(() => {
    if (!skipFetch) fetchScore(false);
  }, [fetchScore, skipFetch]);
// console.log(score?.status)
  const isLive = score?.status === "in_play";

  return {
    score,
    loading,
    warning,      // 🟡 replace error with warning
    refresh,
    isLive,
    lastRefresh,
  };
};
