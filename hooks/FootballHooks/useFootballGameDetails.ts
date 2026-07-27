import { useCallback, useEffect, useRef, useState } from "react";
import { Highlight, Venue } from "types/types";
import { apiClient } from "utils/apiClient";
import { Predictor } from "../BasketballHooks/useBasketballGameDetails";

export type Athlete = {
  id: string | number;
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

export type Team = {
  id: string;
  espnId: string;
  guid: string;
  uid: string;
  location: string;
  name: string;
  fullName: string;
  shortName: string;
  code: string;
  homeAway: string;
  score: number;
  winner: boolean;
  record: string;
  records: [
    {
      type: "total";
      summary: string;
      displayValue: string;
    },
    {
      type: "points";
      summary: string;
      displayValue: string;
    },
  ];
  possession: boolean;
  rank: number | null;
  timeouts: number | null;
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
  displayValue?: string;
  value?: string | number | null;
  athlete: Athlete;
  mainStat?: LeaderMainStat;
  summary?: string;
};

export type LeaderCategory = {
  name: string;
  displayName?: string;
  leaders: LeaderEntry[];
};

export type TeamLeaders = {
  team?: Team;
  leaders: LeaderCategory[];
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

export type Score = {
  gameId: string;
  uid: string;
  date: string;
  lastUpdated?: number;
  status: {
    id: string;
    name: "STATUS_SCHEDULED" | "STATUS_FINAL";
    state: "pre" | "in" | "post";
    completed: boolean;
    gameStatusDescription: string;
    gameStatusDetail: string;
    shortDetail: string;
    clock: number | null;
    displayClock: string | null;
    period: number | null;
  };
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
  homeRank: number | null;
  awayRank: number | null;

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

  records?: {
    home?: TeamRecords;
    away?: TeamRecords;
  };
};

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

  const skipFetch = !league || !gameId;

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
          score: Score;
          details: Details;
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

        setScore(data.score);
        setDetails(data.details ?? null);
        setLastRefresh(new Date());
      } catch (error: any) {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
          return;
        }

        console.warn(`[${league}] details fetch failed`, error);

        setScore(null);
        setDetails(null);

        setWarning(error?.message ?? "Unable to refresh game data");
      } finally {
        if (!silent) {
          setLoading(false);
        }
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

    fetchDetails();

    return () => {
      abortRef.current?.abort();
    };
  }, [skipFetch, fetchDetails, clearPolling]);

  useEffect(() => {
    clearPolling();

    if (skipFetch || score?.status.state !== "in") {
      return;
    }

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
