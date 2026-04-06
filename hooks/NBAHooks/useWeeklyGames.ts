import { useEffect, useState } from "react";
import { Game } from "types/types";
import { apiClient } from "utils/apiClient";

export function useWeeklyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await apiClient.get(`api/games/nba/weekly`, {
        params: { tz },
      });

      setGames(res.data.games ?? []);
    } catch (err) {
      console.error("Error fetching weekly games:", err);
      setError("Failed to fetch games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGames();
  }, []);

  return { games, loading, error, refreshGames };
}