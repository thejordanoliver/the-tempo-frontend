import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

export type Venue = {
  id: string;
  guid: string;
  fullName: string;
  address: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  grass: boolean;
  images: {
    href: string;
    rel: string[];
  }[];
};

export type SeriesSummary = {
  type: string;
  title: string;
  summary: string;
  completed: boolean;
  totalCompetitions: number;
  competitors: {
    id: string;
    uid: string;
    wins: number;
    ties: number;
    href: string;
  }[];
};

export type Predictor = {
  header: string;
  homeTeam: {
    id: string;
    gameProjection: string;
    teamChanceLoss: string;
  };
  awayTeam: {
    id: string;
    gameProjection: string;
    teamChanceLoss: string;
  };
};

type TeamFouls = {
  bonusState?: string | null;
  foulsToGive?: number | null;
  teamFouls?: number | null;
  teamFoulsCurrent?: number | null;
};

type TeamStat = {
  name: string;
  displayValue: string;
};

export type PlayerStatItem = {
  key: string;
  name: string;
  label: string;
  description: string | null;
  value: string | number | null;
};

export type PlayerStatAthlete = {
  active: boolean | null;
  starter: boolean;
  batOrder: number | null;

  athlete: any;
  id: string | null;
  uid: string | null;
  guid: string | null;
  displayName: string;
  shortName: string;
  headshot: string | null;
  position: any | null;

  atBats: any[];
  stats: string[];
  statsByKey: Record<string, string | number | null>;
  statItems: PlayerStatItem[];
};

export type PlayerStatBlock = {
  type: string | null;
  names: string[];
  keys: string[];
  labels: string[];
  descriptions: string[];
  totals: string[];

  totalsByKey: Record<string, string | number | null>;
  totalItems: PlayerStatItem[];

  athletes: PlayerStatAthlete[];
};

export type PlayerStatsByTeam = {
  team: any;
  displayOrder: number | null;

  // Backward-compatible primary block
  type: string | null;
  names: string[];
  keys: string[];
  labels: string[];
  descriptions: string[];
  totals: string[];
  totalsByKey: Record<string, string | number | null>;
  athletes: PlayerStatAthlete[];

  // New full grouped stats
  statBlocks: PlayerStatBlock[];
  statBlocksByType: Record<string, PlayerStatBlock>;

  batting: PlayerStatBlock | null;
  pitching: PlayerStatBlock | null;
  fielding: PlayerStatBlock | null;
};

export type Score = {
  gameId?: string;
  home: { total: number };
  away: { total: number };

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
  period?: number | null;
  lastUpdated?: number;

  boxScore?: any | null;

  plays: any[];
  lastPlay: any | null;

  teamStats: {
    team: any;
    stats: TeamStat[];
  }[];

  outs: number;
  resultCount?: any;

  playerStats: PlayerStatsByTeam[];

  leaders: any[];

  timeouts: {
    home: number | null;
    away: number | null;
  };

  fouls: {
    home: TeamFouls | number | null;
    away: TeamFouls | number | null;
  };

  bases: {
    onFirst: boolean;
    onSecond: boolean;
    onThird: boolean;
  };
};

export type TeamRecords = {
  overall: string | null;
  home?: string | null;
  away?: string | null;
  conference?: string | null;
};

export type GameDetails = {
  playoffRound: string | number | null;
  seriesSummary: SeriesSummary | any | null;
  series?: SeriesSummary | any | null;
  playoffSeries?: any | null;
  isPostseason: boolean;
  seasonState: string | null;

  homeRank: number | null;
  awayRank: number | null;

  broadcast?: string | null;
  broadcasts?: string[];

  officials: any[];
  injuries: any[];
  highlights: any[];
  neutralSite: boolean;
  headline?: string | null;

  predictor: Predictor | null;
  odds?: any;

  records: {
    home: TeamRecords;
    away: TeamRecords;
  };

  venue?: Venue | null;
};

/* ---------------------------------- */
/* Hook                               */
/* ---------------------------------- */

export const useBaseballGameDetails = (
  league: string | undefined,
  gameId?: string | number | null,
) => {
  const [score, setScore] = useState<Score | undefined>();
  const [details, setDetails] = useState<GameDetails | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const skipFetch = !league || !gameId;

  /* ---------------------------------- */
  /* Fetch from /api/baseball/details    */
  /* ---------------------------------- */

  const fetchDetails = useCallback(
    async (silent = false) => {
      if (skipFetch) return;

      try {
        if (!silent) setLoading(true);
        setWarning(null);

        const params: Record<string, string | number | undefined> = {
          league,
          gameId: gameId ?? undefined,
        };

        const { data } = await apiClient.get("api/baseball/details", {
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
    [league, gameId, skipFetch],
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
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [score?.status, score, fetchDetails]);

  /* ---------------------------------- */
  /* Manual refresh                     */
  /* ---------------------------------- */

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

    battingStats: score?.playerStats?.map((team) => ({
      team: team.team,
      batting: team.batting,
    })),

    pitchingStats: score?.playerStats?.map((team) => ({
      team: team.team,
      pitching: team.pitching,
    })),
  };
};
