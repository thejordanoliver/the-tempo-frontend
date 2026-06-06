// hooks/TeamHooks/useTeams.ts
import { apiClient } from "utils/apiClient";
import { useCallback, useEffect, useState } from "react";
import { LeagueType } from "@/types/types";

export type Team = {
  id: number;
  wid?: number | null;
  espnId?: number | null;
  shortName?: string | null;
  name?: string | null;
  fullName?: string | null;
  code?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  location?: string | null;
  city?: string | null;
  established?: number | null;
  conferenceId?: string | number | null;
  logo?: string | null;
  [key: string]: unknown;
};

type TeamsResponse = {
  success: boolean;
  league: string;
  count: number;
  teams: Team[];
};

type TeamResponse = {
  success: boolean;
  league: string;
  team: Team;
};

type UseTeamsResult = {
  teams: Team[];
  team: Team | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useTeams(
  league: LeagueType,
  teamId?: string | number | null,
): UseTeamsResult {
  const [teams, setTeams] = useState<Team[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(
    async (isRefresh = false) => {
      if (!league) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const normalizedLeague = String(league).toLowerCase();

        const endpoint = teamId
          ? `api/teams/${normalizedLeague}/${teamId}`
          : `api/teams/${normalizedLeague}`;

        const response = await apiClient.get<TeamsResponse | TeamResponse>(
          endpoint,
        );

        if (!response.data?.success) {
          throw new Error("Failed to fetch teams");
        }

        if (teamId) {
          const data = response.data as TeamResponse;
          setTeam(data.team);
          setTeams([]);
        } else {
          const data = response.data as TeamsResponse;
          setTeams(data.teams || []);
          setTeam(null);
        }
      } catch (err: any) {
        console.error("useTeams error:", err?.response?.data || err.message);

        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch teams",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, teamId],
  );

  useEffect(() => {
    fetchTeams(false);
  }, [fetchTeams]);

  const refetch = useCallback(async () => {
    await fetchTeams(true);
  }, [fetchTeams]);

  return {
    teams,
    team,
    loading,
    refreshing,
    error,
    refetch,
  };
}