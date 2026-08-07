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

export type FootballGameDetailsResponse = {
  score: Score;
  details: Details;
};

/* ---------------------------------- */
/* Hook                               */
/* ---------------------------------- */

export const useFootballGameDetails = (
  league: string | undefined,
  gameId?: string | number | null,
) => {
  const [score, setScore] = useState<Score | undefined>();
  const [details, setDetails] = useState<Details | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const skipFetch = !league || !gameId;

  /* ---------------------------------- */
  /* Fetch from /api/basketball/details */
  /* ---------------------------------- */

  const fetchDetails = useCallback(
    async (silent = false) => {
      if (skipFetch) return;

      try {
        if (!silent) {
          setLoading(true);
        }

        setWarning(null);

        const params = {
          league,
          gameId,
        };

        const { data } = await apiClient.get<FootballGameDetailsResponse>(
          "api/football/details",
          {
            params,
          },
        );

        if (!data?.score) {
          setWarning("Game data unavailable");
          return;
        }

        setScore(data.score);
        setDetails(data.details);
        setLastRefresh(new Date());
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to refresh game data";

        console.warn(`[${league}] game details fetch failed`, error);

        setWarning(message);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [gameId, league, skipFetch],
  );

  /* ---------------------------------- */
  /* Initial fetch                      */
  /* ---------------------------------- */

  useEffect(() => {
    if (skipFetch) return;

    fetchDetails(true);
  }, [fetchDetails, skipFetch]);

  /* ---------------------------------- */
  /* Poll live games only               */
  /* ---------------------------------- */

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (score?.status?.state !== "in") {
      return;
    }

    intervalRef.current = setInterval(() => {
      fetchDetails(true);
    }, 10_000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchDetails, score?.status?.state]);

  const refresh = useCallback(() => {
    if (!skipFetch) {
      fetchDetails(false);
    }
  }, [fetchDetails, skipFetch]);

  return {
    score,
    details,
    loading,
    warning,
    refresh,
    isLive: score?.status?.state === "in",
    lastRefresh,
  };
};
