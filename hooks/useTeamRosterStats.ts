import axios from "axios";
import { useEffect, useState } from "react";
import { apiClient, BASE_URL } from "utils/apiClient";

export function useTeamRosterStats(teamId: number) {
  const [teamRoster, setTeamRoster] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoster = async (isRefresh = false) => {
    if (!teamId) return;

    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const url = `api/players/nba/teams/${teamId}/players`;
      console.log("🌐 Fetching roster:", url);

      const response = await apiClient.get(url);

      // Just set the raw response
      setTeamRoster(response.data.players);
    } catch (err: any) {
      console.error("❌ Error fetching roster:", err.message);
      setError(err);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [teamId]);

  return {
    teamRoster,
    loading,
    refreshingStats,
    error,
    refetch: () => fetchRoster(true),
  };
}
