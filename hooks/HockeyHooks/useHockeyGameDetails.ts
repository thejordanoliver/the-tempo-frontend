import { Venue } from "@/types/types";
import { useCallback, useEffect, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

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

export type SeriesSummary = {
  type: string;
  title: string;
  summary: string;
  completed: boolean;
  totalCompetitions: number;
  competitors: [
    {
      id: string;
      uid: string;
      wins: number;
      ties: number;
      href: string;
    },
    {
      id: string;
      uid: string;
      wins: number;
      ties: number;
      href: string;
    },
  ];
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

export type StatsTeam = {
  id: number;
  espnId: number;
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
  venueLeagueKey: string;
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

export type TeamStatsGroup = {
  team: StatsTeam;
  stats: TeamStat[];
};

export type TeamStats = TeamStatsGroup[];

/* ---------------------------------- */
/* Play participant types             */
/* ---------------------------------- */

export type PlayParticipantAthlete = {
  id: number | null;
  espnId: number | null;
  teamId: number | null;
  teamEspnId: number | null;
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
  teamId: number | null;
  teamEspnId: number | null;
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
    espnId: number;
  };
  participants?: PlayParticipant[];
  wallclock: string;
  shootingPlay: boolean;
  coordinate: {
    x: number;
    y: number;
  };
  pointsAttempted: number;
  shortDescription: string;
};

/* ---------------------------------- */
/* Leader types                       */
/* ---------------------------------- */

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
  espnId: number;
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

export type Leaders = {
  team: StatsTeam;
  leaders: PlayerLeaders[];
};

/* ---------------------------------- */
/* Score and details                  */
/* ---------------------------------- */

export type GameStatus = {
  id: string;
  name: "STATUS_SCHEDULED" | "STATUS_IN_PROGRESS" | "STATUS_FINAL";
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
  lastPlay: Play;
  teamStats: TeamStats;
  playerStats: PlayerStats;
  leaders: Leaders[];
};

export type TeamRecords = {
  overall: string | null;
  home?: string | null;
  away?: string | null;
  conference?: string | null;
};

export type GameDetails = {
  playoffRound: string;
  seriesSummary: SeriesSummary;
  isPostseason: boolean;
  seasonState: string;
  homeRank: number;
  awayRank: number;
  broadcast?: string | null;
  broadcasts?: string[];
  officials: any[];
  injuries: any[];
  highlights: any[];
  neutralSite: boolean;
  headline?: string | null;
  predictor: Predictor;
  records: {
    home: TeamRecords;
    away: TeamRecords;
  };
  venue?: Venue | null;
};

type HockeyGameDetailsResponse = {
  score: Score;
  details: GameDetails;
};

/* ---------------------------------- */
/* Hook                               */
/* ---------------------------------- */

export const useHockeyGameDetails = (
  league: string | undefined,
  gameId?: string | number | null,
) => {
  const [score, setScore] = useState<Score | undefined>();
  const [details, setDetails] = useState<GameDetails | undefined>();
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const skipFetch = !league || !gameId;

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
          gameId,
        };

        const { data } = await apiClient.get(`api/hockey/details`, {
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

  useLiveSportsSubscription<HockeyGameDetailsResponse>({
    enabled: !skipFetch && score?.status.state === "in",
    kind: "game",
    payload: {
      sport: "hockey",
      league: league || "nhl",
      gameId: gameId || "",
    },
    onUpdate: (payload) => {
      if (!payload?.score) return;

      setScore(payload.score);
      setDetails(payload.details);
      setLastRefresh(new Date());
    },
  });

  const refresh = useCallback(() => {
    if (!skipFetch) fetchDetails(false);
  }, [fetchDetails, skipFetch]);

  return {
    score,
    details,
    loading,
    warning,
    refresh,
    isLive: score?.status.state === "in",
    lastRefresh,
  };
};
