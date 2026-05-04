import { useCallback, useEffect, useState } from "react";
import { FootballGame } from "types/football";
import { apiClient } from "utils/apiClient";

export function useFootballWeeklyGames(league?: number) {
  const [games, setGames] = useState<FootballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get(`api/games/football/weekly`, {
        params: { league },
      });

      // ✅ Handle both backend formats safely
      const rawGames: FootballGame[] =
        res.data?.games || res.data?.response || [];

      setGames(rawGames);
    } catch (err: any) {
      console.error("Error fetching football games:", err.message);
      setError(err.message || "Failed to fetch games");
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => {
    fetchWeeklyGames();
  }, [fetchWeeklyGames]);

  return {
    games, // ✅ RAW API RESPONSE
    loading,
    error,
    refetch: fetchWeeklyGames,
  };
}
