import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  FootballLeague,
  FootballRosterApiPlayer,
  FootballRosterStatsPlayer,
  FootballRosterStatsResponse,
  FootballSeasonStatGroups,
  FootballSeasonStats,
  FootballStatGroup,
} from "@/types/football/stats";
import { apiClient } from "utils/apiClient";

export type FootballRosterLeague = FootballLeague;
export type Player = FootballRosterStatsPlayer;
export type RosterStats = FootballRosterStatsResponse;

type TeamIdInput = string | number | null | undefined;

type UseRosterStatsResult = {
  teamRoster: RosterStats | null;
  rosterStats: FootballRosterStatsPlayer[];
  players: FootballRosterStatsPlayer[];
  count: number;
  loading: boolean;
  refreshingStats: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  onRefresh: () => Promise<void>;
};

const STAT_GROUP_KEYS = [
  "passing",
  "rushing",
  "receiving",
  "defensive",
  "scoring",
  "returning",
  "kicking",
  "punting",
] as const;

const EMPTY_ROSTER_STATS = (teamId: string): RosterStats => ({
  teamId,
  count: 0,
  players: [],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const normalizeLeague = (value: unknown): FootballRosterLeague | "" => {
  if (typeof value !== "string") return "";

  const upperLeague = value.trim().toUpperCase();

  return upperLeague === "NFL" || upperLeague === "CFB" ? upperLeague : "";
};

const resolveHookArgs = (
  first: TeamIdInput | FootballRosterLeague,
  second: TeamIdInput | FootballRosterLeague,
) => {
  const firstLeague = normalizeLeague(first);

  if (firstLeague) {
    return {
      teamId: second as TeamIdInput,
      league: firstLeague,
    };
  }

  return {
    teamId: first as TeamIdInput,
    league: normalizeLeague(second),
  };
};

const normalizeTeamId = (teamId: TeamIdInput) => {
  if (teamId === null || teamId === undefined) return "";

  return String(teamId).trim();
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const parsed = Number(value.trim().replace(/,/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
};

const toIdValue = (value: unknown): string | number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed ? trimmed : null;
  }

  return null;
};

const toNullableString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
};

const toDisplayString = (value: unknown) => toNullableString(value) ?? "";

const isStatValue = (value: unknown): value is string | number | null =>
  value === null || typeof value === "string" || typeof value === "number";

const normalizeStatGroup = (value: unknown): FootballStatGroup | undefined => {
  if (!isRecord(value)) return undefined;

  return Object.entries(value).reduce<FootballStatGroup>(
    (group, [key, statValue]) => {
      if (isStatValue(statValue)) {
        group[key] = statValue;
      }

      return group;
    },
    {},
  );
};

const normalizeSeasonStatGroups = (value: unknown): FootballSeasonStatGroups => {
  if (!isRecord(value)) return {};

  const groups: FootballSeasonStatGroups = {};

  STAT_GROUP_KEYS.forEach((key) => {
    const group = normalizeStatGroup(value[key]);

    if (group) {
      groups[key] = group as FootballSeasonStatGroups[typeof key];
    }
  });

  return groups;
};

const normalizeSeasonStats = (
  seasonStats: unknown,
): FootballSeasonStats | null => {
  if (!isRecord(seasonStats)) return null;

  return {
    ...seasonStats,
    id: parseNumber(seasonStats.id) ?? 0,
    stats: normalizeSeasonStatGroups(seasonStats.stats),
    season: parseNumber(seasonStats.season ?? seasonStats.year) ?? 0,
    team_id: toIdValue(seasonStats.team_id ?? seasonStats.teamId),
    position: toNullableString(seasonStats.position),
    player_id: parseNumber(seasonStats.player_id ?? seasonStats.playerId) ?? 0,
    team_slug: toNullableString(seasonStats.team_slug ?? seasonStats.teamSlug),
    created_at: toNullableString(seasonStats.created_at),
    updated_at: toNullableString(seasonStats.updated_at),
    player_name: toDisplayString(
      seasonStats.player_name ?? seasonStats.playerName,
    ),
    season_type: toNullableString(
      seasonStats.season_type ?? seasonStats.seasonType,
    ),
    display_season: toNullableString(
      seasonStats.display_season ?? seasonStats.displaySeason,
    ),
    season_type_label: toNullableString(
      seasonStats.season_type_label ?? seasonStats.seasonTypeLabel,
    ),
    season_type_value: toIdValue(
      seasonStats.season_type_value ?? seasonStats.seasonTypeValue,
    ),
  };
};

const normalizeSeasonStatsList = (value: unknown): FootballSeasonStats[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map(normalizeSeasonStats)
    .filter((season): season is FootballSeasonStats => Boolean(season));
};

const getLatestSeasonStats = (
  seasonStats: FootballSeasonStats[],
): FootballSeasonStats | null => {
  if (!seasonStats.length) return null;

  return seasonStats.reduce((latest, season) =>
    season.season > latest.season ? season : latest,
  );
};

const splitName = (fullName: string) => {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" "),
  };
};

const formatShortName = (
  shortName: string | null,
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
  const fullName = toDisplayString(player.full_name ?? player.name);
  const nameParts = splitName(fullName);
  const firstName = toDisplayString(player.first_name ?? player.firstName) ||
    nameParts.firstName;
  const lastName = toDisplayString(player.last_name ?? player.lastName) ||
    nameParts.lastName;
  const id = toIdValue(player.id ?? player.playerId ?? player.player_id) ?? "";
  const playerId =
    toIdValue(player.playerId ?? player.player_id ?? player.id) ?? id;
  const seasonStats = normalizeSeasonStatsList(
    player.seasonStats ?? player.season_stats,
  );
  const latestSeasonStats =
    normalizeSeasonStats(
      player.latestSeasonStats ?? player.latest_season_stats,
    ) ?? getLatestSeasonStats(seasonStats);
  const team = toNullableString(player.team);
  const teamCode = toNullableString(player.teamCode);

  return {
    id,
    playerId,
    player_id: toIdValue(player.player_id ?? player.playerId ?? player.id),
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
    team_id: toIdValue(player.team_id ?? player.teamId),
    position: toNullableString(player.position),
    jersey_number: toIdValue(player.jersey_number ?? player.jerseyNumber),
    headshot_url: toNullableString(player.headshot_url ?? player.headshotUrl),
    active: typeof player.active === "boolean" ? player.active : true,
    short_name: formatShortName(
      toNullableString(player.short_name ?? player.shortName),
      firstName,
      lastName,
      fullName,
    ),
    ...(team ? { team } : {}),
    ...(teamCode ? { teamCode } : {}),
    seasonStats,
    latestSeasonStats,
  };
};

const normalizeCount = (value: unknown, fallback: number) =>
  parseNumber(value) ?? fallback;

const normalizeRosterStatsResponse = (
  data: Partial<RosterStats> | null | undefined,
  teamId: string,
): RosterStats => {
  const response = isRecord(data) ? data : {};
  const players = Array.isArray(response.players)
    ? response.players
        .filter(isRecord)
        .map((player) => normalizePlayer(player as FootballRosterApiPlayer))
    : [];

  return {
    teamId: String(response.teamId ?? teamId),
    count: normalizeCount(response.count, players.length),
    players,
  };
};

const getErrorObject = (err: unknown) => {
  if (err instanceof Error) return err;

  return new Error("Failed to fetch roster stats");
};

export function useRosterStats(
  teamId: TeamIdInput,
  league: FootballRosterLeague,
): UseRosterStatsResult;
export function useRosterStats(
  league: FootballRosterLeague,
  teamId: TeamIdInput,
): UseRosterStatsResult;
export function useRosterStats(
  first: TeamIdInput | FootballRosterLeague,
  second: TeamIdInput | FootballRosterLeague,
): UseRosterStatsResult {
  const { normalizedTeamId, normalizedLeague } = useMemo(() => {
    const resolved = resolveHookArgs(first, second);

    return {
      normalizedTeamId: normalizeTeamId(resolved.teamId),
      normalizedLeague: resolved.league,
    };
  }, [first, second]);

  const [teamRoster, setTeamRoster] = useState<RosterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoster = useCallback(
    async (isRefresh = false) => {
      if (!normalizedTeamId || !normalizedLeague) {
        setTeamRoster(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const url = `/api/team/stats/${normalizedLeague.toLowerCase()}/roster/${normalizedTeamId}`;

        const response = await apiClient.get<Partial<RosterStats>>(url);
        const normalizedRoster = normalizeRosterStatsResponse(
          response.data,
          normalizedTeamId,
        );

        setTeamRoster(normalizedRoster);
      } catch (err: unknown) {
        const errorObject = getErrorObject(err);

        console.error("Error fetching roster stats:", errorObject.message);
        setError(errorObject);
        setTeamRoster(EMPTY_ROSTER_STATS(normalizedTeamId));
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [normalizedLeague, normalizedTeamId],
  );

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const refresh = useCallback(() => fetchRoster(true), [fetchRoster]);
  const players = teamRoster?.players ?? [];

  return {
    teamRoster,
    rosterStats: players,
    players,
    count: teamRoster?.count ?? 0,
    loading,
    refreshingStats,
    error,
    refetch: refresh,
    onRefresh: refresh,
  };
}
