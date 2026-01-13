import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

export type NBAScore = {
  home: { total: number };
  away: { total: number };
  periodScores?: { period: number; home: number; away: number }[];
  homeTeam: string;
  awayTeam: string;
  status: "canceled" | "scheduled" | "in_play" | "final";
  gameStatusDescription: string;
  gameStatusDetail: string;
  statusText?: string;
  displayClock?: string;
  period?: number;
  lastUpdated?: number;
};

export type TeamRecords = {
  overall: string | null;
  home?: string | null;
  away?: string | null;
  conference?: string | null;
};

export type GameDetails = {
  officials: any[];
  injuries: any[];
  highlights: any[];
  plays: any[];
  boxScore: any | null;

  teamStats: {
    team: any;
    stats: any[];
  }[];

  playerStats: {
    team: any;
    names: string[];
    keys: string[];
    labels: string[];
    athletes: any[];
  }[];

  leaders: any[];

  neutralSite: boolean;
  venue: any | null;

  timeouts: {
    home: number | null;
    away: number | null;
  };

  fouls: {
    home: any | null;
    away: any | null;
  };

  /* ✅ NEW */
  records: {
    home: TeamRecords;
    away: TeamRecords;
  };
};

type DateParam = string | { date?: string; utc?: string; timestamp?: number };

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/* ---------------------------------- */
/* Hook                               */
/* ---------------------------------- */

export const useGameDetails = (
  league: string,
  homeIdOrName?: string | null,
  awayIdOrName?: string | null,
  date?: DateParam
) => {
  const [score, setScore] = useState<NBAScore | undefined>();
  const [details, setDetails] = useState<GameDetails | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const skipFetch =
    !league || !homeIdOrName || !awayIdOrName || homeIdOrName === awayIdOrName;

  /* ---------------------------------- */
  /* Fetch from /api/details             */
  /* ---------------------------------- */
  const fetchDetails = useCallback(
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

        const { data } = await axios.get(`${BASE_URL}/api/details`, { params });

        if (data?.score) {
          setScore(data.score);
          setDetails(data.details);
          setLastRefresh(new Date());
        } else {
          setWarning("Game data unavailable");
        }
      } catch (err: any) {
        console.warn(`[${league}] game details fetch failed`, err);
        setWarning(err?.message ?? "Unable to refresh game data");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [league, homeIdOrName, awayIdOrName, date, skipFetch]
  );

  /* ---------------------------------- */
  /* Initial fetch                      */
  /* ---------------------------------- */
  useEffect(() => {
    if (skipFetch) return;
    fetchDetails(true);
  }, [skipFetch, fetchDetails]);

  /* ---------------------------------- */
  /* Poll LIVE games only               */
  /* ---------------------------------- */
  useEffect(() => {
    if (!score) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (score.status !== "in_play") return;

    intervalRef.current = setInterval(() => {
      fetchDetails(true);
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [score?.status, fetchDetails]);

  const refresh = useCallback(() => {
    if (!skipFetch) fetchDetails(false);
  }, [fetchDetails, skipFetch]);

  return {
    score,
    details,
    loading,
    warning,
    refresh,
    isLive: score?.status === "in_play",
    lastRefresh,
  };
};
