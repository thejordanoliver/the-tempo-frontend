import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import { useSportsRequestScope } from "hooks/Sports/useSportsRequestScope";
import { useScreenActivity } from "hooks/useScreenActivity";
import type { BasketballWinProbability } from "types/basketball/visualizations";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameVenueInfo } from "types/gameVenue";
import { Highlight, Venue } from "types/types";
import { apiClient } from "utils/apiClient";
import { Official, TeamInjury } from "../FootballHooks/useFootballGameDetails";

export type StatsByKey = {
  minutes: string;
  points: string;
  "fieldGoalsMade-fieldGoalsAttempted": string;
  "threePointFieldGoalsMade-threePointFieldGoalsAttempted": string;
  "freeThrowsMade-freeThrowsAttempted": string;
  rebounds: string;
  assists: string;
  turnovers: string;
  steals: string;
  blocks: string;
  offensiveRebounds: string;
  defensiveRebounds: string;
  fouls: string;
  plusMinus: string;
};

export type StatItem = {
  key: string;
  name: string;
  label: string;
  description: string;
  value: string;
};

export type TeamRecord = {
  type: string;
  summary: string;
  displayValue: string;
};

export type Team = {
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
  records: TeamRecord[];
  timeouts: number | null;
  fouls: {
    teamFouls: number;
    teamFoulsCurrent: number;
    foulsToGive: number;
    bonusState: string;
  };
  rank: number | null;
};

export type Athlete = {
  id: number;
  active: boolean;
  starter: boolean;
  didNotPlay: boolean;
  reason: string | null;
  ejected: boolean;
  uid: string | null;
  guid: string | null;
  shortName: string | null;
  headshot: string | null;
  jersey: string | null;
  position: string | null;
  stats: string[];
  statsByKey: StatsByKey;
  statItems: StatItem[];
};

export type StatsTeam = {
  id: number;
  name: string;
  fullName: string;
  code: string;
  location: string;
  city: string;
  state: string;
  primaryColor: string;
  secondaryColor: string;
  established: number;
  venueId: string;
  league: string | null;
};

export type PlayerStatsGroup = {
  team: StatsTeam;
  names: string[];
  keys: string[];
  labels: string[];
  athletes: Athlete[];
};

export type PlayerStats = PlayerStatsGroup[];

export type TeamStat = {
  name: string;
  displayValue: string;
};

export type teamStatsGroup = {
  team: StatsTeam;
  stats: TeamStat[];
};

export type teamStats = teamStatsGroup[];

export type FoulTroubleTeam = {
  id: number;
  name: string;
  fullName: string;
  shortName: string;
};

export type FoulTroublePlayer = {
  id: number;
  displayName: string;
  shortName: string;
  headshot: string | null;
  jersey: string | null;
  position: string | null;
  fouls: number;
  threshold: number;
  starter: boolean;
  active: boolean;
  athlete: null;
};

export type FoulTrouble = {
  team: FoulTroubleTeam;
  players: FoulTroublePlayer[];
};

export type TeamRecords = {
  overall: string | null;
  home?: string | null;
  away?: string | null;
  conference?: string | null;
};

export type PredictorTeam = {
  id: string;
  gameProjection: string;
  teamChanceLoss: string;
};

export type Predictor = {
  header: string;
  homeTeam: PredictorTeam;
  awayTeam: PredictorTeam;
};

export type PlayParticipantAthlete = {
  id: number | null;
  teamId: number | null;
  name: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  shortName: string | null;
  headshot: string | null;
  jersey: string | null;
  position: string | null;
};

export type PlayParticipant = {
  type?: string | null;
  teamId: number | null;
  athlete: PlayParticipantAthlete;
};

export type Play = {
  id: string;
  sequenceNumber: string;
  type: {
    id: string;
    text: string;
  };
  text: string;
  awayScore: number;
  homeScore: number;
  period: {
    number: number;
    displayValue: string;
  };
  clock: {
    displayValue: string;
  };
  scoringPlay: boolean;
  scoreValue: number;
  team: {
    id: number;
  };
  participants?: PlayParticipant[];
  wallclock: string;
  shootingPlay: boolean;
  coordinate: {
    x: number;
    y: number;
  } | null;
  /** Backend court position in feet, independent of team or provider orientation. */
  courtPosition?: { x: number; y: number } | null;
  pointsAttempted: number;
  shortDescription: string;
};

export type Statistics = {
  name: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  abbreviation: string;
  value: number;
  displayValue: string;
};

export type LeaderAthlete = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  shortName: string;
  headshot: string | null;
  jersey: string | null;
  position: string | null;
};

export type PlayerLeader = {
  displayValue: string;
  value: number;
  athlete: LeaderAthlete;
  statistics: Statistics[];
  mainStat: {
    value: string;
    label: string;
  };
  summary: string;
};

export type PlayerLeaders = {
  name: string;
  displayName: string;
  leaders: PlayerLeader[];
};

export type LeadersType = {
  team: StatsTeam;
  leaders: PlayerLeaders[];
};

export type GameStatus = {
  id: string;
  name: string;
  state: string;
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
  uid?: string;
  date?: string;
  lastUpdated: number;
  status: GameStatus;
  periodScores: {
    period: number;
    home: number;
    away: number;
  }[];
  home: Team;
  away: Team;
  plays: Play[];
  lastPlay: Play | null;
  winProbability?: BasketballWinProbability[];
  teamStats: teamStats;
  playerStats: PlayerStats;
  leaders: LeadersType[];
  foulTrouble?: FoulTrouble[];
};

export type Details = {
  homeRank: number | null;
  awayRank: number | null;
  broadcast: string | null;
  broadcasts: string[];
  officials: Official[];
  injuries: TeamInjury[];
  highlights: Highlight[];
  neutralSite: boolean;
  venue: Venue | null;
  venueInfo?: GameVenueInfo | null;
  headline?: string | null;
  predictor: Predictor | null;
  attendance: number | null;
};

export type BasketballGameDetailsResponse = {
  score: Score;
  details: Details;
};

export type DateParam =
  | string
  | {
      date?: string;
      utc?: string;
      timestamp?: number;
    };

export const useBasketballGameDetails = (
  league: string | undefined,
  gameId?: string | number | null,
) => {
  const [score, setScore] = useState<Score | undefined>();
  const [details, setDetails] = useState<Details | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const skipFetch = !league || !gameId;
  const identity = JSON.stringify([league, String(gameId)]);
  const { active, activeRef } = useScreenActivity();
  const { begin, isCurrent, accept, finish, hasData, settled } =
    useSportsRequestScope(identity, { enabled: !skipFetch && active });
  const latestSnapshot = useRef<{ identity: string; stamp: number } | null>(
    null,
  );
  const currentScore = hasData ? score : undefined;

  /* Fetch from /api/basketball/details */

  const fetchDetails = useCallback(
    async (silent = false) => {
      const request = begin();
      if (!request) return;

      try {
        if (!silent) {
          setLoading(true);
        }

        setWarning(null);

        const params = {
          league,
          gameId,
        };

        const { data } = await apiClient.get<BasketballGameDetailsResponse>(
          "api/basketball/details",
          {
            params,
            signal: request.controller.signal,
          },
        );

        if (!isCurrent(request)) return;
        if (!data?.score || String(data.score.gameId) !== String(gameId)) {
          setWarning("Game data unavailable");
          return;
        }

        const stamp = data.score.lastUpdated;
        if (
          latestSnapshot.current?.identity === identity &&
          stamp < latestSnapshot.current.stamp
        )
          return;
        if (accept(request)) {
          latestSnapshot.current = { identity, stamp };
          setScore(data.score);
          setDetails(data.details);
          setLastRefresh(new Date());
        }
      } catch (error: unknown) {
        if (!isCurrent(request)) return;
        const message =
          error instanceof Error
            ? error.message
            : "Unable to refresh game data";

        console.warn(`[${league}] game details fetch failed`, error);

        setWarning(message);
      } finally {
        if (finish(request)) {
          setLoading(false);
        }
      }
    },
    [gameId, league, identity, begin, isCurrent, accept, finish],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled && !skipFetch && active) void fetchDetails(true);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchDetails, skipFetch, active]);

  useLiveSportsSubscription<BasketballGameDetailsResponse>({
    enabled: !skipFetch && active && shouldTrackGameUpdates(currentScore),
    kind: "game",
    payload: {
      sport: "basketball",
      league: league || "nba",
      gameId: gameId || "",
    },
    onUpdate: (payload) => {
      if (
        !payload?.score ||
        !activeRef.current ||
        String(payload.score.gameId) !== String(gameId)
      )
        return;
      const stamp = payload.score.lastUpdated;
      if (
        latestSnapshot.current?.identity === identity &&
        stamp < latestSnapshot.current.stamp
      )
        return;
      if (!accept()) return;
      latestSnapshot.current = { identity, stamp };

      setScore(payload.score);
      setDetails(payload.details);
      setLastRefresh(new Date());
      setLoading(false);
    },
  });

  const refresh = useCallback(() => {
    if (!skipFetch) {
      fetchDetails(false);
    }
  }, [fetchDetails, skipFetch]);

  return {
    score: currentScore,
    details: hasData ? details : undefined,
    loading: active && (loading || (!hasData && !settled)),
    warning: settled ? warning : null,
    refresh,
    isLive: currentScore?.status?.state === "in",
    lastRefresh: hasData ? lastRefresh : null,
  };
};
