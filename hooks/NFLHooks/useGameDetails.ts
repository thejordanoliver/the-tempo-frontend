import axios from "axios";
import { Predictor } from "hooks/NBAHooks/useGameDetails";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient, BASE_URL } from "utils/apiClient";

/* ---------------------------------- */
/* TYPES                              */
/* ---------------------------------- */

export type Venue = {
  id: string;
  fullName: string;
  address: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  grass: boolean;
  images: [
    {
      href: string;
      rel: ["full", "day"];
    },
    {
      href: string;
      rel: ["full", "day", "interior"];
    },
  ];
  attendance?: number
};

export type Athlete = {
  id: string;
  fullName: string;
  displayName: string;
  shortName: string;
  headshot?: string;
  jersey?: string;
  position?: string;
};

export type PlayObject = {
  id: string;
  text: string;
  type?: { text?: string; abbreviation?: string };
  team: {
    id: string;
  };
  scoreValue?: number;
  description?: string;
  timeElapsed?: { displayValue?: string };
  statYardage?: number;
  athletesInvolved?: Athlete[];
  start: {
    period: {
      type: "quarter";
      number: number;
    };
    clock: {
      displayValue: string;
    };
    yardLine: number;
    text: string;
  };
  end: {
    period: {
      type: "quarter";
      number: number;
    };
    clock: {
      displayValue: string;
    };
    yardLine: number;
    text: string;
  };
  result: string;
  shortDisplayResult: string;
  displayResult: string;
  yards: number;
  isScore: boolean;
  offensivePlays: number;
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

export type Score = {
  gameId: string;
  lastUpdated: number;

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
  scoringPlays: ScoringPlays;
  /* ✅ merged possession */
  possession: {
    teamId: number | null;
    shortDownDistanceText: string | null;
    downDistanceText: string | null;
    yardLine: number | null;
    distance: number | null;
    possessionText: string | null;
    isRedZone: boolean;
    homeTimeouts: number | null;
    awayTimeouts: number | null;
  };

  lastPlay: any;
  drives: {
    previous: PlayObject[];
    current: PlayObject[];
  };
};

export type TeamRecords = {
  total: {
    name: "overall";
    summary: string;
    abbreviation: "total";
  };
  home: {
    name: "Home";
    summary: string;
    abbreviation: "home";
  };
  road: {
    name: "Road";
    summary: string;
    abbreviation: "road";
  };
  vsconf: {
    name: "vs. Conf.";
    summary: string;
    abbreviation: "vsconf";
  };
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
  predictor: Predictor;
  records: {
    home: TeamRecords;
    away: TeamRecords;
  };
};

type DateParam = string | { date?: string; utc?: string; timestamp?: number };

/* ---------------------------------- */
/* HOOK                               */
/* ---------------------------------- */

export const useGameDetails = (
  league: "cfb" | "nfl",
  homeId?: number | null,
  awayId?: number | null,
  date?: DateParam,
) => {
  const [score, setScore] = useState<Score | undefined>();
  const [details, setDetails] = useState<GameDetails | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const skipFetch = !league || !homeId || !awayId || !date;

  /* ---------------------------------- */
  /* FETCH                              */
  /* ---------------------------------- */

  const fetchDetails = useCallback(
    async (silent = false) => {
      if (skipFetch) return;

      try {
        if (!silent) setLoading(true);
        setWarning(null);

        const params: Record<string, any> = {
          league,
          homeId,
          awayId,
        };

        if (date) {
          if (typeof date === "string") params.date = date;
          else if (date.timestamp) params.date = date.timestamp;
          else if (date.utc) params.date = date.utc;
          else if (date.date) params.date = date.date;
        }

        const { data } = await apiClient.get(`api/football/details`, {
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
        console.warn(`[${league}] football details fetch failed`, err);
        setWarning(err?.message ?? "Unable to refresh game data");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [league, homeId, awayId, date, skipFetch],
  );

  /* ---------------------------------- */
  /* INITIAL FETCH                      */
  /* ---------------------------------- */

  useEffect(() => {
    if (skipFetch) return;
    fetchDetails(true);
  }, [fetchDetails, skipFetch]);

  /* ---------------------------------- */
  /* POLLING (LIVE ONLY)                */
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

  /* ---------------------------------- */
  /* REFRESH                            */
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
  };
};
