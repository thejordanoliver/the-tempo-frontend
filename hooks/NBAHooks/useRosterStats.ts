import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "utils/apiClient";

export type BasketballRosterLeague = "NBA" | "WNBA" | "CBB" | "WCBB";

export type StatValue = string | number | null;

export type BasketballStatGroup = Record<string, StatValue>;

export type BasketballSeasonStats = {
  id: number;
  season: number;
  totals: BasketballStatGroup;
  averages: BasketballStatGroup;
  miscellaneous: BasketballStatGroup | null;
  team_id: string | number | null;
  team_slug: string | null;
  position: string | null;
  player_id: number;
  player_name: string;
  season_type: string | null;
  season_type_label: string | null;
  season_type_value: string | number | null;
  display_season: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Player = {
  id: number;
  playerId: number;
  full_name: string;
  first_name: string;
  last_name: string;
  team_id: number;
  position: string | null;
  jersey_number: number | null;
  headshot_url: string | null;
  active: boolean;
  short_name: string;
  team: string;

  currentSeasonStats: BasketballSeasonStats | null;
  latestSeason: BasketballSeasonStats | null;
  latestSeasonStats: BasketballSeasonStats | null;
  seasonStats: BasketballSeasonStats[];
  careerStats: BasketballSeasonStats[];
};

export type RosterStats = {
  teamId: string;
  count: number;
  players: Player[];
};

const EMPTY_ROSTER_STATS = (teamId: string): RosterStats => ({
  teamId,
  count: 0,
  players: [],
});

const normalizeRosterStatsResponse = (
  data: Partial<RosterStats> | null | undefined,
  teamId: string,
): RosterStats => {
  const players = Array.isArray(data?.players) ? data.players : [];

  return {
    teamId: String(data?.teamId ?? teamId),
    count:
      typeof data?.count === "number"
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
  league: BasketballRosterLeague,
) {
  const normalizedTeamId = useMemo(() => {
    if (teamId === null || teamId === undefined) return "";

    return String(teamId).trim();
  }, [teamId]);

  const [teamRoster, setTeamRoster] = useState<RosterStats | null>(null);
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

        const response = await apiClient.get<RosterStats>(url);
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
    fetchRoster();
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