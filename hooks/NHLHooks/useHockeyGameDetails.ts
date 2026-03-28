import axios from "axios";
import { Predictor } from "hooks/NBAHooks/useGameDetails";
import { useCallback, useEffect, useRef, useState } from "react";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

type TeamFouls = {
  bonusState: string | null;
  foulsToGive: number;
  teamFouls: number;
  teamFoulsCurrent: number;
};

type TeamStat = {
  name: string;
  displayValue: string;
};

type Venue = {
  address: { city: string; country: string; state: string };
  fullName: string;
  grass: boolean;
  id: string;
  images: [
    {
      alt: string;
      height: 1125;
      href: string;
      width: number;
    },
  ];
};
export type Score = {
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
  boxScore: any | null;
  plays: any[];
  lastPlay: string;
  teamStats: {
    team: any;
    stats: TeamStat[];
  }[];
  playerStats: {
    team: any;
    names: string[];
    keys: string[];
    labels: string[];
    athletes: any[];
  }[];
  leaders: any[];
  timeouts: {
    home: number | null;
    away: number | null;
  };
  fouls: {
    home: TeamFouls;
    away: TeamFouls;
  };
};

export type TeamRecords = {
  overall: string | null;
  home?: string | null;
  away?: string | null;
  conference?: string | null;
};

export type GameDetails = {
  isPostseason: boolean;
  seasonState: string;

  broadcast?: string | null;
  broadcasts?: string[];

  officials: any[];
  injuries: any[];
  highlights: any[];

  neutralSite: boolean;
  headline?: string | null;

  series?: any | null;
  playoffSeries?: any | null;
  playoffRound?: number | null;
  seriesSummary?: any | null;

  records: {
    home: TeamRecords;
    away: TeamRecords;
  };
  predictor: Predictor;

  venue?: Venue | null;
};

type DateParam = string | { date?: string; utc?: string; timestamp?: number };

import { BASE_URL } from "utils/apiClient";

/* ---------------------------------- */
/* Hook                               */
/* ---------------------------------- */

export const useHockeyDetails = (
  league: string,
  homeId?: string | number | null,
  awayId?: string | number | null,
  date?: DateParam,
) => {
  const [score, setScore] = useState<Score | undefined>();
  const [details, setDetails] = useState<GameDetails | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const skipFetch = !league || !homeId || !awayId || homeId === awayId;

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
          home: homeId,
          away: awayId,
        };

        if (date) {
          if (typeof date === "string") params.date = date;
          else if (date.timestamp) params.date = date.timestamp;
          else if (date.utc) params.date = date.utc;
          else if (date.date) params.date = date.date;
        }

        const { data } = await axios.get(`${BASE_URL}/api/hockey/details`, {
          params,
        });

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
    [league, homeId, awayId, date, skipFetch],
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
