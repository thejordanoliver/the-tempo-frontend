import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export function useRosterStats(teamId: number) {
  const [teamRoster, setTeamRoster] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoster = useCallback(async (isRefresh = false) => {
    if (!teamId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const url = `/api/team/stats/nba/roster/${teamId}`;

      const response = await apiClient.get(url);
      setTeamRoster(response.data.players);
    } catch (err: any) {
      console.error("❌ Error fetching roster:", err.message);
      setError(err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [teamId]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  return {
    teamRoster,
    loading,
    refreshingStats,
    error,
    refetch: () => fetchRoster(true),
  };
}
