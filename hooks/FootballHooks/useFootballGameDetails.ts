import { Predictor } from "hooks/NBAHooks/useGameDetails";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

/* ---------------------------------- */
/* TYPES                              */
/* ---------------------------------- */

export type Venue = {
  id: string;
  fullName: string;
  address?: {
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  grass?: boolean;
  images?: {
    href: string;
    rel: string[];
  }[];
  attendance?: number;
};

export type Athlete = {
  id: string;
  uid?: string;
  guid?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  displayName?: string;
  shortName?: string;
  headshot?:
    | string
    | {
        href?: string;
        alt?: string;
      };
  jersey?: string;
  position?: string;
  links?: any[];

  // Added by backend
  teamId?: number | string | null;
  teamEspnId?: number | string | null;
};

export type PlayObject = {
  id: string;
  text?: string;
  type?: {
    id?: string;
    text?: string;
    abbreviation?: string;
  };
  team?: {
    id: string;
  };
  scoreValue?: number;
  description?: string;
  timeElapsed?: { displayValue?: string };
  statYardage?: number;
  athletesInvolved?: Athlete[];
  start?: {
    period?: {
      type?: "quarter";
      number?: number;
    };
    clock?: {
      displayValue?: string;
    };
    yardLine?: number;
    text?: string;
  };
  end?: {
    period?: {
      type?: "quarter";
      number?: number;
    };
    clock?: {
      displayValue?: string;
    };
    yardLine?: number;
    text?: string;
  };
  result?: string;
  shortDisplayResult?: string;
  displayResult?: string;
  yards?: number;
  isScore?: boolean;
  offensivePlays?: number;
};

export type ScoringPlay = {
  id: string;
  type: {
    id: string;
    text: string;
    abbreviation: string;
  };
  text: string;
  awayScore: number;
  homeScore: number;
  period: {
    number: number;
  };
  clock: {
    value: number;
    displayValue: string;
  };
  team: {
    id: string;
    uid: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
  };
  scoringType: {
    name: string;
    displayName: string;
    abbreviation: string;
  };
};

export type ScoringPlays = ScoringPlay[];

export type FootballTeam = {
  id: number | string | null;
  espnId?: number | null;
  espnIdRaw?: string | null;
  uid?: string;
  slug?: string;
  location?: string;
  name?: string;
  abbreviation?: string;
  displayName?: string;
  shortDisplayName?: string;
  color?: string;
  alternateColor?: string;
  logo?: string;
};

export type TeamBoxScoreStat = {
  name: string;
  displayValue: string;
  value: number | string;
  label: string;
};

export type BoxScoreAthleteStat = {
  athlete: Athlete;
  stats: string[];

  // Added by backend
  teamId?: number | string | null;
  teamEspnId?: number | string | null;
};

export type BoxScoreStatCategory = {
  name: string;
  keys?: string[];
  text?: string;
  labels?: string[];
  descriptions?: string[];
  athletes?: BoxScoreAthleteStat[];
  totals?: string[];

  // Added by backend
  teamId?: number | string | null;
  teamEspnId?: number | string | null;
};

export type BoxScoreTeam = {
  team: FootballTeam;
  statistics: TeamBoxScoreStat[];
  displayOrder?: number;
  homeAway?: "home" | "away";

  // Added by backend
  teamId?: number | string | null;
  teamEspnId?: number | string | null;
};

export type BoxScorePlayerTeam = {
  team: FootballTeam;
  statistics: BoxScoreStatCategory[];
  displayOrder?: number;

  // Added by backend
  teamId?: number | string | null;
  teamEspnId?: number | string | null;
};

export type BoxScore = {
  teams: BoxScoreTeam[];
  players: BoxScorePlayerTeam[];
};

export type FootballMappedStat = {
  key: string;
  label: string;
  description?: string;
  value: string;
};

export type FootballPlayerStatRow = {
  id: string;
  uid?: string;
  guid?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  displayName?: string;
  shortName?: string;
  jersey?: string;
  headshot?:
    | string
    | {
        href?: string;
        alt?: string;
      };

  teamId: number | string | null;
  teamEspnId: number | string | null;

  category: string;
  categoryLabel: string;

  labels: string[];
  keys: string[];
  descriptions: string[];
  stats: string[];

  mappedStats: FootballMappedStat[];
};

export type FootballPlayersByCategory = Record<
  string,
  {
    away: FootballPlayerStatRow[];
    home: FootballPlayerStatRow[];
  }
>;

export type FootballTopPlayersByCategory = Record<
  string,
  {
    away: FootballPlayerStatRow | null;
    home: FootballPlayerStatRow | null;
  }
>;

export type Score = {
  gameId: string;
  lastUpdated: number;

  home: { total: number };
  away: { total: number };

  periodScores?: { period: number; home: number; away: number }[];

  homeTeam: string;
  awayTeam: string;

  // Local/app IDs
  homeTeamId?: number | null;
  awayTeamId?: number | null;

  // ESPN IDs
  homeTeamEspnId?: number | null;
  awayTeamEspnId?: number | null;

  status: "canceled" | "scheduled" | "in_play" | "final";

  gameStatusDescription: string;
  gameStatusDetail: string;

  statusText: string;
  displayClock: string | null;
  period: number | null;

  scoringPlays: ScoringPlays;

  possession: {
    teamId: number | null;
    shortDownDistanceText: string | null;
    downDistanceText: string | null;
    yardLine: number | null;
    down: number | null;
    distance: number | null;
    possessionText: string | null;
    isRedZone: boolean;
    homeTimeouts: number | null;
    awayTimeouts: number | null;
  };

  plays: PlayObject[];
  lastPlay: PlayObject | null;
  currentDrives: PlayObject[];

  drives: {
    previous: PlayObject[];
    current: PlayObject[];
  };

  boxScore?: BoxScore | null;

  teamStats?: any[];
  playerStats?: any[];

  timeouts?: {
    home: number | null;
    away: number | null;
  };
};

export type TeamRecords = {
  overall?: string;
  home?: string;
  road?: string;
  vsconf?: string;
};

export type GameDetails = {
  homeRank: number | null;
  awayRank: number | null;

  broadcast?: string | null;
  broadcasts?: string[];

  officials: any[];
  injuries: any[];
  highlights: any[];

  neutralSite: boolean;
  venue: Venue | null;
  attendance: number | null;

  headline?: string | null;
  predictor?: Predictor | null;

  records?: {
    home?: TeamRecords;
    away?: TeamRecords;
  };
};

/* ---------------------------------- */
/* HELPERS                            */
/* ---------------------------------- */

const normalizeId = (value: unknown): number | string | null => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : String(value);
};

const mapAthleteStats = ({
  keys = [],
  labels = [],
  descriptions = [],
  stats = [],
}: {
  keys?: string[];
  labels?: string[];
  descriptions?: string[];
  stats?: string[];
}): FootballMappedStat[] => {
  return stats.map((value, index) => ({
    key: keys[index] ?? labels[index] ?? `stat_${index}`,
    label: labels[index] ?? keys[index] ?? `STAT ${index + 1}`,
    description: descriptions[index],
    value,
  }));
};

const normalizeBoxScorePlayerCategory = (
  playerTeam: BoxScorePlayerTeam,
  category: BoxScoreStatCategory,
): FootballPlayerStatRow[] => {
  if (!Array.isArray(category.athletes)) return [];

  return category.athletes
    .map((entry) => {
      const athlete = entry?.athlete;

      if (!athlete?.id) return null;

      const stats = Array.isArray(entry.stats) ? entry.stats : [];

      return {
        id: String(athlete.id),
        uid: athlete.uid,
        guid: athlete.guid,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        fullName: athlete.fullName,
        displayName: athlete.displayName,
        shortName: athlete.shortName,
        jersey: athlete.jersey,
        headshot: athlete.headshot,

        teamId:
          normalizeId(athlete.teamId) ??
          normalizeId(entry.teamId) ??
          normalizeId(category.teamId) ??
          normalizeId(playerTeam.teamId) ??
          normalizeId(playerTeam.team?.id),

        teamEspnId:
          normalizeId(athlete.teamEspnId) ??
          normalizeId(entry.teamEspnId) ??
          normalizeId(category.teamEspnId) ??
          normalizeId(playerTeam.teamEspnId) ??
          normalizeId(playerTeam.team?.espnId),

        category: category.name,
        categoryLabel: category.text ?? category.name,

        labels: category.labels ?? [],
        keys: category.keys ?? [],
        descriptions: category.descriptions ?? [],
        stats,

        mappedStats: mapAthleteStats({
          keys: category.keys,
          labels: category.labels,
          descriptions: category.descriptions,
          stats,
        }),
      };
    })
    .filter(Boolean) as FootballPlayerStatRow[];
};

const getPlayersByCategory = (
  boxScore: BoxScore | null | undefined,
  homeTeamId?: string | number | null,
  awayTeamId?: string | number | null,
): FootballPlayersByCategory => {
  const result: FootballPlayersByCategory = {};

  if (!boxScore?.players?.length) return result;

  boxScore.players.forEach((playerTeam) => {
    const teamId =
      normalizeId(playerTeam.teamId) ?? normalizeId(playerTeam.team?.id);

    playerTeam.statistics?.forEach((category) => {
      if (!category?.name) return;

      const rows = normalizeBoxScorePlayerCategory(playerTeam, category);

      if (!result[category.name]) {
        result[category.name] = {
          away: [],
          home: [],
        };
      }

      if (String(teamId) === String(homeTeamId)) {
        result[category.name].home.push(...rows);
      } else if (String(teamId) === String(awayTeamId)) {
        result[category.name].away.push(...rows);
      }
    });
  });

  return result;
};

const getTopPlayersByCategory = (
  playersByCategory: FootballPlayersByCategory,
): FootballTopPlayersByCategory => {
  return Object.keys(playersByCategory).reduce((acc, category) => {
    acc[category] = {
      away: playersByCategory[category]?.away?.[0] ?? null,
      home: playersByCategory[category]?.home?.[0] ?? null,
    };

    return acc;
  }, {} as FootballTopPlayersByCategory);
};

const getCategoryFallback = () => ({
  away: [],
  home: [],
});

const getTopCategoryFallback = () => ({
  away: null,
  home: null,
});

/* ---------------------------------- */
/* HOOK                               */
/* ---------------------------------- */

export const useFootballGameDetails = (
  league: string,
  gameId?: string | number | null,
) => {
  const [score, setScore] = useState<Score | null>(null);
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const skipFetch = !league || !gameId;

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchDetails = useCallback(
    async (silent = false) => {
      if (skipFetch) return;

      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        if (!silent) setLoading(true);
        setWarning(null);

        const { data } = await apiClient.get("api/football/details", {
          params: {
            league,
            gameId,
          },
          signal: controller.signal,
        });

        if (data?.score) {
          setScore(data.score);
          setDetails(data.details ?? null);
          setLastRefresh(new Date());
        } else {
          setScore(null);
          setDetails(null);
          setWarning("Game data unavailable");
        }
      } catch (err: any) {
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
          return;
        }

        console.warn(`[${league}] football details fetch failed`, err);

        setScore(null);
        setDetails(null);
        setWarning(err?.message ?? "Unable to refresh game data");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [league, gameId, skipFetch],
  );

  useEffect(() => {
    if (skipFetch) {
      clearPolling();
      abortRef.current?.abort();

      setScore(null);
      setDetails(null);
      setLoading(false);
      setWarning(null);
      setLastRefresh(null);

      return;
    }

    fetchDetails(false);

    return () => {
      abortRef.current?.abort();
    };
  }, [skipFetch, fetchDetails, clearPolling]);

  useEffect(() => {
    clearPolling();

    if (skipFetch || score?.status !== "in_play") return;

    intervalRef.current = setInterval(() => {
      fetchDetails(true);
    }, 15000);

    return clearPolling;
  }, [skipFetch, score?.status, fetchDetails, clearPolling]);

  useEffect(() => {
    return () => {
      clearPolling();
      abortRef.current?.abort();
    };
  }, [clearPolling]);

  const refresh = useCallback(() => {
    if (!skipFetch) {
      fetchDetails(false);
    }
  }, [fetchDetails, skipFetch]);

  const boxScore = score?.boxScore ?? null;

  const playersByCategory = useMemo(
    () =>
      getPlayersByCategory(boxScore, score?.homeTeamId, score?.awayTeamId),
    [boxScore, score?.homeTeamId, score?.awayTeamId],
  );

  const topPlayersByCategory = useMemo(
    () => getTopPlayersByCategory(playersByCategory),
    [playersByCategory],
  );

  return {
    score,
    details,
    loading,
    warning,
    refresh,
    isLive: score?.status === "in_play",
    lastRefresh,
    hasData: !!score,

    boxScore,

    teamStats: boxScore?.teams ?? [],
    playerStats: boxScore?.players ?? [],

    // New box score based football stats
    playersByCategory,
    topPlayersByCategory,

    passingPlayers: playersByCategory.passing ?? getCategoryFallback(),
    rushingPlayers: playersByCategory.rushing ?? getCategoryFallback(),
    receivingPlayers: playersByCategory.receiving ?? getCategoryFallback(),
    defensivePlayers:
      playersByCategory.defensive ??
      playersByCategory.totalTackles ??
      getCategoryFallback(),
    kickingPlayers: playersByCategory.kicking ?? getCategoryFallback(),
    puntingPlayers: playersByCategory.punting ?? getCategoryFallback(),

    topPassing: topPlayersByCategory.passing ?? getTopCategoryFallback(),
    topRushing: topPlayersByCategory.rushing ?? getTopCategoryFallback(),
    topReceiving: topPlayersByCategory.receiving ?? getTopCategoryFallback(),
    topDefensive:
      topPlayersByCategory.defensive ??
      topPlayersByCategory.totalTackles ??
      getTopCategoryFallback(),
    topKicking: topPlayersByCategory.kicking ?? getTopCategoryFallback(),
    topPunting: topPlayersByCategory.punting ?? getTopCategoryFallback(),
  };
};