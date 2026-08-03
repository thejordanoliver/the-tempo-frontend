import { useCallback, useEffect, useRef, useState } from "react";
import type { Highlight, Venue } from "types/types";
import { apiClient } from "utils/apiClient";
import type { Predictor } from "../BasketballHooks/useBasketballGameDetails";

export type Athlete = {
  id?: string | number | null;
  espnId?: string | number | null;
  uid?: string;
  guid?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  displayName?: string | null;
  shortName?: string | null;
  headshot?: string | null;
  jersey?: string | null;
  position?: string | null;
  links?: unknown[];
};

export type TeamRecord = {
  type: string;
  summary?: string;
  displayValue?: string;
};

export type Team = {
  id: string | number;
  espnId?: string | number | null;
  guid?: string;
  uid?: string;
  slug?: string;

  location?: string;
  city?: string;
  name?: string;
  fullName?: string;
  displayName?: string;
  shortName?: string;
  shortDisplayName?: string;
  code?: string;
  abbreviation?: string;

  homeAway?: string;
  score?: number;
  winner?: boolean;
  record?: string;
  records?: TeamRecord[];

  possession?: boolean;
  rank?: number | null;
  timeouts?: number | null;

  color?: string;
  alternateColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logo?: string | null;

  owner?: string | null;
  established?: number | null;
};

export type Injury = {
  status: string;
  date?: string;
  athlete: Athlete;
  type?: {
    id?: string;
    name?: string;
    description?: string;
    abbreviation?: string;
  };
  details?: {
    fantasyStatus?: {
      description?: string;
      abbreviation?: string;
      displayDescription?: string;
    };
    type?: string;
    location?: string;
    detail?: string;
    side?: string;
    returnDate?: string;
  };
};

export type TeamInjury = {
  team: Team;
  injuries: Injury[];
};

/* ---------------------------------- */
/* LEADER TYPES                       */
/* ---------------------------------- */

export type LeaderMainStat = {
  value?: string | number | null;
  label?: string | null;
};

export type LeaderEntry = {
  athlete: Athlete;
  stats?: (string | number | null)[];
  value?: string | number | null;
  displayValue?: string | null;
  mainStat?: LeaderMainStat;
  summary?: string | null;
};

export type LeaderCategory = {
  name: string;
  displayName?: string;
  shortDisplayName?: string;
  abbreviation?: string;
  leaders: LeaderEntry[];
};

export type TeamLeaders = {
  team: Team;
  leaders: LeaderCategory[];
};

type RawTeamLeaders = {
  team?: Partial<Team> | null;
  leaders?: LeaderCategory[] | null;
};

/* ---------------------------------- */
/* PLAY TYPES                         */
/* ---------------------------------- */

export type PlayObject = {
  id: string;
  text?: string;
  type?: {
    id?: string;
    text?: string;
    abbreviation?: string;
  };
  team?: {
    id: string | number;
  };
  scoreValue?: number;
  description?: string;
  timeElapsed?: {
    displayValue?: string;
  };
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

/* ---------------------------------- */
/* SCORING PLAY TYPES                 */
/* ---------------------------------- */

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
    id: string | number;
    uid?: string;
    displayName?: string;
    abbreviation?: string;
    logo?: string;
  };
  scoringType: {
    name: string;
    displayName: string;
    abbreviation: string;
  };
};

export type ScoringPlays = ScoringPlay[];

/* ---------------------------------- */
/* BOX SCORE TYPES                    */
/* ---------------------------------- */

export type TeamBoxScoreStat = {
  name: string;
  displayValue: string;
  value: number | string;
  label: string;
};

export type BoxScoreAthleteStat = {
  athlete: Athlete;
  stats: string[];
};

export type BoxScoreStatCategory = {
  name: string;
  keys?: string[];
  text?: string;
  labels?: string[];
  descriptions?: string[];
  athletes?: BoxScoreAthleteStat[];
  totals?: string[];
};

export type BoxScoreTeam = {
  team: Team;
  statistics: TeamBoxScoreStat[];
  displayOrder?: number;
  homeAway?: "home" | "away";
};

export type BoxScorePlayerTeam = {
  team: Team;
  statistics: BoxScoreStatCategory[];
  displayOrder?: number;
};

export type BoxScore = {
  teams: BoxScoreTeam[];
  players: BoxScorePlayerTeam[];
};

/* ---------------------------------- */
/* SCORE TYPES                        */
/* ---------------------------------- */

export type GameStatus = {
  id: string;
  name: string;
  state: "pre" | "in" | "post";
  completed: boolean;
  gameStatusDescription: string;
  gameStatusDetail: string;
  shortDetail: string;
  clock: number | null;
  displayClock: string | null;
  period: number | null;
};

export type Score = {
  gameId: string;
  uid: string;
  date: string;
  lastUpdated?: number;

  status: GameStatus;

  home: Team;
  away: Team;

  periodScores?: {
    period: number;
    home: number;
    away: number;
  }[];

  scoringPlays: ScoringPlays;

  possession: {
    teamId: number | string | null;
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

  boxScore?: BoxScore;

  teamStats?: {
    team: Team;
    stats: TeamBoxScoreStat[];
  }[];

  playerStats?: {
    team: Team;
    names: string[];
    keys: string[];
    labels: string[];
    athletes: BoxScoreAthleteStat[];
  }[];

  leaders?: TeamLeaders[];

  timeouts?: {
    home: number | null;
    away: number | null;
  };
};

type RawScore = Omit<Score, "leaders"> & {
  leaders?: RawTeamLeaders[] | null;
};

export type TeamRecords = {
  overall?: string;
  home?: string;
  away?: string;
  road?: string;
  conference?: string;
  vsconf?: string;
};

export type Official = {
  fullName: string;
  displayName: string;
  position: {
    name: string;
    displayName: string;
    id: string;
  };
  order: number;
};

export type Details = {
  broadcast?: string | null;
  broadcasts?: string[];
  officials: Official[];
  injuries: TeamInjury[];
  highlights: Highlight[];
  neutralSite: boolean;
  venue: Venue | null;
  attendance: number | null;
  headline?: string | null;
  predictor?: Predictor | null;
};

type RequestError = {
  code?: string;
  name?: string;
  message?: string;
};

/* ---------------------------------- */
/* NORMALIZATION HELPERS              */
/* ---------------------------------- */

function normalizeId(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();

  return normalizedValue || null;
}

function teamsMatch(
  firstTeam?: Partial<Team> | null,
  secondTeam?: Partial<Team> | null,
): boolean {
  if (!firstTeam || !secondTeam) {
    return false;
  }

  const firstTeamIds = [
    normalizeId(firstTeam.id),
    normalizeId(firstTeam.espnId),
  ].filter((id): id is string => Boolean(id));

  const secondTeamIds = [
    normalizeId(secondTeam.id),
    normalizeId(secondTeam.espnId),
  ].filter((id): id is string => Boolean(id));

  return firstTeamIds.some((id) => secondTeamIds.includes(id));
}

function normalizeLeaderEntries(entries?: LeaderEntry[] | null): LeaderEntry[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map((entry) => ({
    ...entry,
    athlete: entry.athlete ?? {},
    stats: Array.isArray(entry.stats) ? entry.stats : [],
  }));
}

function normalizeLeaderCategories(
  categories?: LeaderCategory[] | null,
): LeaderCategory[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map((category) => ({
    ...category,
    leaders: normalizeLeaderEntries(category.leaders),
  }));
}

function normalizeLeaders(score: RawScore): TeamLeaders[] {
  if (!Array.isArray(score.leaders)) {
    return [];
  }

  return score.leaders.map((teamLeaders, index) => {
    const responseTeam = teamLeaders.team;

    const matchedTeam = [score.away, score.home].find((gameTeam) =>
      teamsMatch(responseTeam, gameTeam),
    );

    /*
     * Football leader groups normally return the away team first
     * and the home team second. This fallback fills an empty team
     * object using the corresponding team from the score.
     */
    const orderedTeam = index === 0 ? score.away : score.home;
    const fallbackTeam = matchedTeam ?? orderedTeam;

    return {
      team: {
        ...fallbackTeam,
        ...responseTeam,
      },
      leaders: normalizeLeaderCategories(teamLeaders.leaders),
    };
  });
}

function normalizeDetails(details?: Partial<Details> | null): Details | null {
  if (!details) {
    return null;
  }

  return {
    ...details,
    broadcasts: Array.isArray(details.broadcasts) ? details.broadcasts : [],
    officials: Array.isArray(details.officials) ? details.officials : [],
    injuries: Array.isArray(details.injuries) ? details.injuries : [],
    highlights: Array.isArray(details.highlights) ? details.highlights : [],
    neutralSite: Boolean(details.neutralSite),
    venue: details.venue ?? null,
    attendance: details.attendance ?? null,
  };
}

/* ---------------------------------- */
/* HOOK                               */
/* ---------------------------------- */

export const useFootballGameDetails = (
  league: string,
  gameId?: string | number | null,
) => {
  const [score, setScore] = useState<Score | null>(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const skipFetch =
    !league.trim() || gameId === null || gameId === undefined || gameId === "";

  const clearPolling = useCallback(() => {
    if (!intervalRef.current) {
      return;
    }

    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const fetchDetails = useCallback(
    async (silent = false) => {
      if (skipFetch) {
        return;
      }

      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        if (!silent) {
          setLoading(true);
        }

        setWarning(null);

        const { data } = await apiClient.get<{
          score: RawScore;
          details?: Partial<Details> | null;
        }>("api/football/details", {
          params: {
            league,
            gameId,
          },
          signal: controller.signal,
        });

        if (!data?.score) {
          setScore(null);
          setDetails(null);
          setWarning("Game data unavailable");
          return;
        }

        const normalizedScore: Score = {
          ...data.score,
          leaders: normalizeLeaders(data.score),
        };

        setScore(normalizedScore);
        setDetails(normalizeDetails(data.details));
        setLastRefresh(new Date());
      } catch (error: unknown) {
        const requestError = error as RequestError;

        if (
          requestError.code === "ERR_CANCELED" ||
          requestError.name === "CanceledError"
        ) {
          return;
        }

        console.warn(`[${league}] details fetch failed`, error);

        setScore(null);
        setDetails(null);
        setWarning(requestError.message ?? "Unable to refresh game data");
      } finally {
        if (!silent) {
          setLoading(false);
        }

        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [league, gameId, skipFetch],
  );

  useEffect(() => {
    if (skipFetch) {
      clearPolling();
      abortRef.current?.abort();
      abortRef.current = null;

      setScore(null);
      setDetails(null);
      setLoading(false);
      setWarning(null);
      setLastRefresh(null);

      return;
    }

    fetchDetails();

    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [skipFetch, fetchDetails, clearPolling]);

  useEffect(() => {
    clearPolling();

    if (skipFetch || score?.status.state !== "in") {
      return;
    }

    intervalRef.current = setInterval(() => {
      fetchDetails(true);
    }, 15_000);

    return clearPolling;
  }, [skipFetch, score?.status.state, fetchDetails, clearPolling]);

  useEffect(() => {
    return () => {
      clearPolling();
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [clearPolling]);

  const refresh = useCallback(() => {
    if (!skipFetch) {
      fetchDetails();
    }
  }, [fetchDetails, skipFetch]);

  return {
    score,
    details,
    loading,
    warning,
    refresh,
    isLive: score?.status.state === "in",
    lastRefresh,
    hasData: Boolean(score),
  };
};
