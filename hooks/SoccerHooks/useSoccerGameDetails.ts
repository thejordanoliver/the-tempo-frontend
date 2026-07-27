import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

type Team = {
  id: string;
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
  form: string;
  rank: number | null;
};

export type TeamStat = {
  name: string;
  displayValue: string;
  [key: string]: any;
};

export type Athlete = {
  athlete: {
    id?: string;
    playerId?: number;
    displayName?: string;
    teamId?: number;
    shortName?: string;
    jersey?: string;
    position?: {
      abbreviation?: string;
    };
    headshot?: {
      href?: string;
      alt?: string;
    };
    [key: string]: any;
  };
  stats?: string[];
  starter?: boolean;
  didNotPlay?: boolean;
  reason?: string;
  ejected?: boolean;
  [key: string]: any;
};

export type PlayEvent = {
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

export type KeyEvent = {
  id?: string | number | null;

  type?: {
    id?: string | number | null;
    text?: string | null;
    type?: string | null;
  };

  text?: string | null;
  shortText?: string | null;

  period?: {
    number?: number | null;
  };

  clock?: {
    value?: number | null;
    displayValue?: string | null;
  };

  scoringPlay?: boolean;

  team?: {
    id?: string | number | null;
    displayName?: string | null;
  };

  participants?: {
    athlete?: {
      id?: string | number | null;
      displayName?: string | null;
    };
  }[];

  wallclock?: string | null;
  shootout?: boolean;

  [key: string]: any;
};

/* -------------------------------------------------------------------------- */
/* Shot map                                                                   */
/* -------------------------------------------------------------------------- */

export type ShotOutcome =
  | "goal"
  | "saved"
  | "off-target"
  | "blocked"
  | "unknown";

export type ShotTeam = {
  id: string | number | null;
  uid: string | null;
  name: string | null;
  shortName: string | null;
  abbreviation: string | null;
  logo: string | null;
  homeAway: "home" | "away" | null;
};

export type ShotPlayer = {
  id: string | number | null;
  name: string | null;
};

export type ShotCoordinates = {
  /**
   * Position where the shot originated.
   * ESPN normally provides these values on a 0–100 scale.
   */
  x: number | null;
  y: number | null;

  /**
   * Position where the shot ended or traveled toward.
   */
  endX: number | null;
  endY: number | null;

  /**
   * Horizontal position across the goal mouth.
   */
  goalY: number | null;
};

export type Shot = {
  id: string;
  sequence: number;

  team: ShotTeam;
  player: ShotPlayer;
  assistedBy: ShotPlayer | null;

  period: number | null;
  clock: string | number | null;

  text: string | null;

  type: string | null;
  typeText: string | null;
  outcome: ShotOutcome;

  scoringPlay: boolean;
  coordinates: ShotCoordinates;
};

/* -------------------------------------------------------------------------- */
/* Score                                                                      */
/* -------------------------------------------------------------------------- */

export type Score = {
  gameId: string;
  uid: string;
  date: string;
  lastUpdated?: number;
  periodScores?: {
    period: number;
    home: number;
    away: number;
  }[];
  home: Team;
  away: Team;
  status: {
    id: string;
    name: "STATUS_SCHEDULED" | "STATUS_FULL_TIME" | "STATUS_FINAL_PEN";
    state: "pre" | "in" | "post";
    completed: boolean;
    gameStatusDescription: string;
    gameStatusDetail: string;
    shortDetail: string;
    clock: number | null;
    displayClock: string | null;
    period: number | null;
  };
  possession?: any;
  situation?: any;
  headToHeadGames?: any[];
  rosters?: any[];
  commentary?: any[];
  plays: any[];
  lastPlay: any | null;
  boxScore: any | null;
  teamStats: {
    team: any;
    stats: TeamStat[];
  }[];

  playerStats: {
    team: any;
    statistics?: any[];

    groups?: {
      name?: string | null;
      names: string[];
      keys: string[];
      labels: string[];
      athletes: Athlete[];
    }[];

    names?: string[];
    keys?: string[];
    labels?: string[];
    athletes?: Athlete[];
  }[];

  leaders: any[];

  keyEvents?: KeyEvent[];
  scorers?: PlayEvent[];
  cards?: PlayEvent[];
  substitutions?: PlayEvent[];
  penaltyShootout?: PlayEvent[];
  shotMapAvailable: boolean;
  shotMap: Shot[];
  timeouts: {
    home: number | null;
    away: number | null;
  };

  fouls: {
    home: number | null;
    away: number | null;
  };
  resultCount?: null;
};

/* -------------------------------------------------------------------------- */
/* Details                                                                    */
/* -------------------------------------------------------------------------- */

export type TeamRecord = {
  overall: string | null;
  home?: string | null;
  away?: string | null;
  conference?: string | null;
};

export type TeamDetails = {
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

export type Details = {
  broadcast?: string | null;
  broadcasts?: string[];

  headline?: string | null;

  officials: any[];
  predictor: any[];
  injuries: any[];
  highlights: any[];
  odds?: any;
  plays: any[];

  seasonState?: string | null;

  neutralSite: boolean;
  venue: any | null;
  attendance?: number | null;

  records: {
    home: TeamRecord;
    away: TeamRecord;
  };

  aggregate?: any;
  series?: any;
  isPostseason?: boolean;

  homeTeam?: TeamDetails;
  awayTeam?: TeamDetails;
};

export type GameDetailsResponse = {
  score: Score;
  details: Details;
};

/* -------------------------------------------------------------------------- */
/* Hook options                                                               */
/* -------------------------------------------------------------------------- */

type UseSoccerGameDetailsOptions = {
  enabled?: boolean;
  pollLiveGames?: boolean;
  pollIntervalMs?: number;
};

type FetchDetailsOptions = {
  silent?: boolean;
};

function isLiveScore(score?: Score) {
  return score?.status.state === "in";
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export const useSoccerGameDetails = (
  league: string | undefined,
  gameId?: string | number | null,
  options: UseSoccerGameDetailsOptions = {},
) => {
  const {
    enabled = true,
    pollLiveGames = true,
    pollIntervalMs = 10_000,
  } = options;

  const [score, setScore] = useState<Score | undefined>();
  const [details, setDetails] = useState<Details | undefined>();

  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const skipFetch = !enabled || !league || !gameId;

  const fetchDetails = useCallback(
    async ({ silent = false }: FetchDetailsOptions = {}) => {
      if (skipFetch) {
        return;
      }

      try {
        if (!silent) {
          setLoading(true);
        }

        setWarning(null);

        const { data } = await apiClient.get<GameDetailsResponse>(
          "api/games/soccer/details",
          {
            params: {
              league,
              gameId,
            },
          },
        );

        if (!data?.score) {
          setWarning("Game data unavailable");
          return;
        }

        setScore({
          ...data.score,
          shotMapAvailable: data.score.shotMapAvailable === true,
          shotMap: Array.isArray(data.score.shotMap) ? data.score.shotMap : [],
        });

        setDetails(data.details);
        setLastRefresh(new Date());
      } catch (error: any) {
        console.warn(`[${league}] soccer game details fetch failed`, error);

        setWarning(
          error?.response?.data?.error ||
            error?.message ||
            "Unable to refresh soccer game data",
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [gameId, league, skipFetch],
  );

  useEffect(() => {
    if (skipFetch) {
      setScore(undefined);
      setDetails(undefined);
      setWarning(null);
      setLastRefresh(null);
      setLoading(false);

      return;
    }

    void fetchDetails({
      silent: false,
    });
  }, [skipFetch, fetchDetails]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!pollLiveGames || !isLiveScore(score) || pollIntervalMs <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      void fetchDetails({
        silent: true,
      });
    }, pollIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [score, pollLiveGames, pollIntervalMs, fetchDetails]);

  const refresh = useCallback(() => {
    if (!skipFetch) {
      void fetchDetails({
        silent: false,
      });
    }
  }, [fetchDetails, skipFetch]);

  return {
    score,
    details,
    loading,
    warning,
    refresh,
    isLive: isLiveScore(score),
    lastRefresh,

    /**
     * Convenience values for shot-map components.
     */
    shotMapAvailable: score?.shotMapAvailable === true,
    shotMap: score?.shotMap ?? [],
  };
};
