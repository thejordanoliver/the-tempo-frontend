import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type FootballLeague = "CFB" | "NFL";
export type FootballStatValue = string | number | null | undefined;

export type FootballStatGroup = {
  [key: string]: FootballStatValue;
};

export interface FootballPassingStats extends FootballStatGroup {
  completions?: FootballStatValue;
  passingAttempts?: FootballStatValue;
  completionPct?: FootballStatValue;
  passingYards?: FootballStatValue;
  passingTouchdowns?: FootballStatValue;
  interceptions?: FootballStatValue;
  yardsPerPassAttempt?: FootballStatValue;
  longPassing?: FootballStatValue;
  sacks?: FootballStatValue;
  QBRating?: FootballStatValue;
}

export interface FootballRushingStats extends FootballStatGroup {
  rushingAttempts?: FootballStatValue;
  rushingYards?: FootballStatValue;
  yardsPerRushAttempt?: FootballStatValue;
  rushingTouchdowns?: FootballStatValue;
  longRushing?: FootballStatValue;
}

export interface FootballReceivingStats extends FootballStatGroup {
  receptions?: FootballStatValue;
  receivingYards?: FootballStatValue;
  yardsPerReception?: FootballStatValue;
  receivingTouchdowns?: FootballStatValue;
  longReception?: FootballStatValue;
}

export interface FootballDefensiveStats extends FootballStatGroup {
  totalTackles?: FootballStatValue;
  soloTackles?: FootballStatValue;
  assistTackles?: FootballStatValue;
  sacks?: FootballStatValue;
  interceptions?: FootballStatValue;
  passesDefended?: FootballStatValue;
  fumblesForced?: FootballStatValue;
  interceptionYards?: FootballStatValue;
  interceptionTouchdowns?: FootballStatValue;
}

export interface FootballReturningStats extends FootballStatGroup {
  kickReturns?: FootballStatValue;
  kickReturnYards?: FootballStatValue;
  longKickReturn?: FootballStatValue;
  kickReturnTouchdowns?: FootballStatValue;
  puntReturns?: FootballStatValue;
  puntReturnYards?: FootballStatValue;
  longPuntReturn?: FootballStatValue;
  puntReturnTouchdowns?: FootballStatValue;
}

export interface FootballKickingStats extends FootballStatGroup {
  fieldGoals?: FootballStatValue;
  kickExtraPoints?: FootballStatValue;
}

export interface FootballPuntingStats extends FootballStatGroup {
  punts?: FootballStatValue;
  puntYards?: FootballStatValue;
  longPunt?: FootballStatValue;
}

export interface FootballScoringStats extends FootballStatGroup {
  fieldGoals?: FootballStatValue;
  kickExtraPoints?: FootballStatValue;
}

export interface FootballSeasonStats {
  season?: string | number | null;
  year?: string | number | null;
  displaySeason?: string;
  passing?: FootballPassingStats;
  rushing?: FootballRushingStats;
  receiving?: FootballReceivingStats;
  defensive?: FootballDefensiveStats;
  returning?: FootballReturningStats;
  kicking?: FootballKickingStats;
  punting?: FootballPuntingStats;
  scoring?: FootballScoringStats;
  totals?: FootballStatGroup;
  averages?: FootballStatGroup;
  [key: string]: unknown;
}

type FootballRosterApiPlayer = {
  id?: string | number | null;
  player_id?: string | number | null;
  playerId?: string | number | null;
  name?: string | null;
  full_name?: string | null;
  short_name?: string | null;
  shortName?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  jersey_number?: string | number | null;
  jerseyNumber?: string | number | null;
  position?: string | null;
  headshot_url?: string | null;
  headshotUrl?: string | null;
  team_id?: string | number | null;
  teamId?: string | number | null;
  teamCode?: string | null;
  seasonStats?: FootballSeasonStats[] | null;
  season_stats?: FootballSeasonStats[] | null;
  latestSeasonStats?: FootballSeasonStats | null;
  latest_season_stats?: FootballSeasonStats | null;
};

export interface FootballRosterStatsPlayer {
  id: string | number;
  player_id: string | number | null;
  playerId: string | number;
  full_name: string;
  short_name: string;
  first_name: string;
  last_name: string;
  jersey_number: string | number;
  position: string;
  headshot_url: string;
  team_id: string | number | null;
  teamCode: string;
  seasonStats: FootballSeasonStats[];
  latestSeasonStats: FootballSeasonStats | null;
}

export type Player = FootballRosterStatsPlayer;

const getSeasonNumber = (season: FootballSeasonStats) => {
  const rawSeason = season.season ?? season.year;
  const numericSeason =
    typeof rawSeason === "string"
      ? Number(rawSeason.replace(/,/g, ""))
      : Number(rawSeason);

  return Number.isFinite(numericSeason) ? numericSeason : 0;
};

const getLatestSeasonStats = (
  seasonStats: FootballSeasonStats[],
): FootballSeasonStats | null => {
  if (!seasonStats.length) return null;

  return seasonStats.reduce((latest, season) =>
    getSeasonNumber(season) > getSeasonNumber(latest) ? season : latest,
  );
};

const splitName = (fullName: string) => {
  const [first = "", ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName: first,
    lastName: rest.join(" "),
  };
};

const formatShortName = (
  shortName: string | null | undefined,
  firstName: string,
  lastName: string,
  fullName: string,
) => {
  if (shortName) return shortName;
  if (firstName && lastName) return `${firstName[0]}. ${lastName}`;

  return fullName;
};

const normalizePlayer = (
  player: FootballRosterApiPlayer,
): FootballRosterStatsPlayer => {
  const seasonStats = Array.isArray(player.seasonStats)
    ? player.seasonStats
    : Array.isArray(player.season_stats)
      ? player.season_stats
      : [];
  const latestSeasonStats =
    player.latestSeasonStats ??
    player.latest_season_stats ??
    getLatestSeasonStats(seasonStats);
  const fullName = player.full_name ?? player.name ?? "";
  const nameParts = splitName(fullName);
  const firstName = player.first_name ?? player.firstName ?? nameParts.firstName;
  const lastName = player.last_name ?? player.lastName ?? nameParts.lastName;
  const playerId = player.playerId ?? player.player_id ?? player.id ?? "";

  return {
    id: player.id ?? playerId,
    player_id: player.player_id ?? player.playerId ?? player.id ?? null,
    playerId,
    full_name: fullName,
    short_name: formatShortName(
      player.short_name ?? player.shortName,
      firstName,
      lastName,
      fullName,
    ),
    first_name: firstName,
    last_name: lastName,
    jersey_number: player.jersey_number ?? player.jerseyNumber ?? "",
    position: player.position ?? "",
    headshot_url: player.headshot_url ?? player.headshotUrl ?? "",
    team_id: player.team_id ?? player.teamId ?? null,
    teamCode: player.teamCode ?? "",
    seasonStats,
    latestSeasonStats,
  };
};

export const useRosterStats = (league: FootballLeague, teamId: number) => {
  const [rosterStats, setRosterStats] = useState<FootballRosterStatsPlayer[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoster = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await apiClient.get<FootballRosterApiPlayer[]>(
          `/api/team/stats/${league}/roster/${teamId}`,
        );

        const players = Array.isArray(response.data) ? response.data : [];

        setRosterStats(players.map(normalizePlayer));
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err : new Error("Failed to load roster stats"),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, teamId],
  );

  useEffect(() => {
    if (!league || !teamId) return;
    fetchRoster();
  }, [fetchRoster, teamId, league]);

  const onRefresh = () => fetchRoster(true);

  return {
    rosterStats,
    loading,
    refreshingStats,
    error,
    onRefresh,
  };
};
