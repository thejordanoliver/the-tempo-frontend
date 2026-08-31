import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type BaseballRosterLeague = "mlb";

export type BaseballStatValue = string | number | null;
export type BaseballStatMap = Record<string, BaseballStatValue>;

export type BaseballSeasonStatGroups = {
  "career-batting"?: BaseballStatMap | null;
  "expanded-batting"?: BaseballStatMap | null;
  "advanced-batting"?: BaseballStatMap | null;
  pitching?: BaseballStatMap | null;
  "opponent-batting"?: BaseballStatMap | null;
  "expanded-pitching"?: BaseballStatMap | null;
};

export type BaseballSeasonStats = {
  id?: number | string | null;
  season?: number | string | null;
  stats?: BaseballSeasonStatGroups | null;
  team_id?: string | number | null;
  team_slug?: string | null;
  position?: string | null;
  player_id?: number | string | null;
  player_name?: string | null;
  season_type?: string | null;
  season_type_label?: string | null;
  season_type_value?: string | number | null;
  display_season?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BaseballRosterPlayer = {
  id: number;
  playerId?: number | string | null;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  team_id?: number | string | null;
  position?: string | null;
  jersey_number?: number | string | null;
  headshot_url?: string | null;
  active?: boolean;
  short_name?: string | null;
  team?: string | null;
  currentSeasonStats?: BaseballSeasonStats | null;
  latestSeason?: BaseballSeasonStats | null;
  latestSeasonStats?: BaseballSeasonStats | null;
  seasonStats?: BaseballSeasonStats[] | null;
  careerStats?: BaseballSeasonStats[] | null;
};

export type BaseballRosterStats = {
  teamId: string;
  count: number;
  players: BaseballRosterPlayer[];
};

const EMPTY_ROSTER_STATS = (teamId: string): BaseballRosterStats => ({
  teamId,
  count: 0,
  players: [],
});

const normalizeRosterStatsResponse = (
  data: Partial<BaseballRosterStats> | BaseballRosterPlayer[] | null | undefined,
  teamId: string,
): BaseballRosterStats => {
  const players = Array.isArray(data)
    ? data
    : Array.isArray(data?.players)
      ? data.players
      : [];

  return {
    teamId: Array.isArray(data) ? teamId : String(data?.teamId ?? teamId),
    count:
      !Array.isArray(data) && typeof data?.count === "number"
        ? data.count
        : players.length,
    players,
  };
};

const getErrorObject = (err: unknown) => {
  if (err instanceof Error) return err;

  return new Error("Failed to fetch roster stats");
};

export function useRosterStats(
  teamId: string | number | null | undefined,
  league: BaseballRosterLeague,
) {
  const normalizedTeamId = useMemo(() => {
    if (teamId === null || teamId === undefined) return "";

    return String(teamId).trim();
  }, [teamId]);

  const [teamRoster, setTeamRoster] = useState<BaseballRosterStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoster = useCallback(
    async (isRefresh = false) => {
      if (!normalizedTeamId) {
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
        const url = `/api/team/stats/${league.toLowerCase()}/roster/${normalizedTeamId}`;

        const response = await apiClient.get<
          Partial<BaseballRosterStats> | BaseballRosterPlayer[]
        >(url);
        const normalizedRoster = normalizeRosterStatsResponse(
          response.data,
          normalizedTeamId,
        );

        setTeamRoster(normalizedRoster);
      } catch (err: unknown) {
        const errorObject = getErrorObject(err);

        console.error("❌ Error fetching roster stats:", errorObject.message);
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
    [league, normalizedTeamId],
  );

  useEffect(() => {
    void fetchRoster();
  }, [fetchRoster]);

  return {
    teamRoster,
    players: teamRoster?.players ?? [],
    count: teamRoster?.count ?? 0,
    loading,
    refreshingStats,
    error,
    refetch: () => fetchRoster(true),
  };
}

export default useRosterStats;
