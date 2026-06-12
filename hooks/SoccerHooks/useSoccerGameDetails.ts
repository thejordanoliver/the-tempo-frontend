import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export type SoccerTeamStat = {
  name: string;
  displayValue: string;
  [key: string]: any;
};

export type SoccerAthlete = {
  athlete: {
    id?: string;
    playerId?: number;
    displayName?: string;
    teamId?: number;
    shortName?: string;
    jersey?: string;
    position?: { abbreviation?: string };
    headshot?: { href?: string; alt?: string };
    [key: string]: any;
  };
  stats?: string[];
  starter?: boolean;
  didNotPlay?: boolean;
  reason?: string;
  ejected?: boolean;
  [key: string]: any;
};

export type SoccerPlayEvent = {
  id?: string | number | null;
  text?: string | null;
  period?: number | null;
  clock?: string | number | null;
  team?: any;
  athlete?: any;
  type?: any;
  raw?: any;
  [key: string]: any;
};

export type SoccerScore = {
  gameId: string;
  lastUpdated?: number;

  home: {
    total: number;
    shootout?: number | null;
    aggregate?: number | null;
  };

  away: {
    total: number;
    shootout?: number | null;
    aggregate?: number | null;
  };

  periodScores?: {
    period: number;
    home: number;
    away: number;
  }[];

  homeTeam: string;
  awayTeam: string;

  status: "canceled" | "scheduled" | "in_play" | "final";
  gameStatusDescription: string;
  gameStatusDetail: string;
  statusText?: string;
  displayClock?: string | null;
  clock?: string | null;
  period?: number | null;

  possession?: any;

  plays: any[];
  lastPlay: any | null;

  boxScore: any | null;

  teamStats: {
    team: any;
    stats: SoccerTeamStat[];
  }[];

  playerStats: {
    team: any;
    statistics?: any[];
    groups?: {
      name?: string | null;
      names: string[];
      keys: string[];
      labels: string[];
      athletes: SoccerAthlete[];
    }[];

    // kept for compatibility with existing stat-table components
    names?: string[];
    keys?: string[];
    labels?: string[];
    athletes?: SoccerAthlete[];
  }[];

  leaders: any[];

  scorers?: SoccerPlayEvent[];
  cards?: SoccerPlayEvent[];
  substitutions?: SoccerPlayEvent[];
  penaltyShootout?: any[];

  timeouts: {
    home: number | null;
    away: number | null;
  };

  fouls: {
    home: number | null;
    away: number | null;
  };

  // safe compatibility fields for shared game-detail components
  outs?: null;
  bases?: {
    onFirst: boolean;
    onSecond: boolean;
    onThird: boolean;
  };
  resultCount?: null;
};

export type SoccerTeamRecord = {
  overall: string | null;
  home?: string | null;
  away?: string | null;
  conference?: string | null;
};

export type SoccerTeamDetails = {
  id?: string | number | null;
  uid?: string | null;
  name?: string | null;
  shortName?: string | null;
  code?: string | null;
  location?: string | null;
  logo?: string | null;
  color?: string | null;
  alternateColor?: string | null;
  score?: number;
  winner?: boolean | null;
  record?: string | null;
};

export type SoccerGameDetails = {
  homeRank: number | null;
  awayRank: number | null;

  broadcast?: string | null;
  broadcasts?: string[];

  headline?: string | null;
  officials: any[];
  predictor: any[];
  injuries: any[];
  highlights: any[];
  plays: any[];

  seasonState?: string | null;

  neutralSite: boolean;
  venue: any | null;
  attendance?: number | null;

  records: {
    home: SoccerTeamRecord;
    away: SoccerTeamRecord;
  };

  aggregate?: any;
  series?: any;
  isPostseason?: boolean;

  homeTeam?: SoccerTeamDetails;
  awayTeam?: SoccerTeamDetails;
};

type UseSoccerGameDetailsOptions = {
  enabled?: boolean;
  pollLiveGames?: boolean;
  pollIntervalMs?: number;
};

type FetchDetailsOptions = {
  silent?: boolean;
};

function isLiveSoccerScore(score?: SoccerScore) {
  return score?.status === "in_play";
}

export const useSoccerGameDetails = (
  league: string | undefined,
  gameId?: string | number | null,
  options: UseSoccerGameDetailsOptions = {},
) => {
  const {
    enabled = true,
    pollLiveGames = true,
    pollIntervalMs = 10000,
  } = options;

  const [score, setScore] = useState<SoccerScore | undefined>();
  const [details, setDetails] = useState<SoccerGameDetails | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const skipFetch = !enabled || !league || !gameId;

  const fetchDetails = useCallback(
    async ({ silent = false }: FetchDetailsOptions = {}) => {
      if (skipFetch) return;

      try {
        if (!silent) setLoading(true);

        setWarning(null);

        const { data } = await apiClient.get("api/games/soccer/details", {
          params: {
            league,
            gameId,
          },
        });

        if (data?.score) {
          setScore(data.score);
          setDetails(data.details);
          setLastRefresh(new Date());
        } else {
          setWarning("Game data unavailable");
        }
      } catch (err: any) {
        console.warn(`[${league}] soccer game details fetch failed`, err);

        setWarning(
          err?.response?.data?.error ||
            err?.message ||
            "Unable to refresh soccer game data",
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [league, gameId, skipFetch],
  );

  useEffect(() => {
    if (skipFetch) return;

    fetchDetails({ silent: false });
  }, [skipFetch, fetchDetails]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!pollLiveGames || !isLiveSoccerScore(score)) return;

    intervalRef.current = setInterval(() => {
      fetchDetails({ silent: true });
    }, pollIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [score, score?.status, pollLiveGames, pollIntervalMs, fetchDetails]);

  const refresh = useCallback(() => {
    if (!skipFetch) {
      fetchDetails({ silent: false });
    }
  }, [fetchDetails, skipFetch]);

  return {
    score,
    details,
    loading,
    warning,
    refresh,
    isLive: isLiveSoccerScore(score),
    lastRefresh,
  };
};