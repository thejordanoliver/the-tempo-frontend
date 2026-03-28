import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "utils/apiClient";

type AggregatedStats = Record<string, number>;

export function useFootballPlayerStats(playerId: number) {
  const [aggregatedStats, setAggregatedStats] =
    useState<AggregatedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ Call your backend endpoint
        const response = await axios.get(
          `${BASE_URL}/api/players/football/${playerId}/stats`,
        );

        const data = response.data;

        if (!data || !data.aggregatedStats) {
          throw new Error("No player stats found");
        }

        setAggregatedStats(data.aggregatedStats);
      } catch (err: any) {
        console.error("❌ Error fetching football stats:", err.message || err);
        setError(err.message || "Failed to fetch football stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId]);

  return { aggregatedStats, loading, error };
}
