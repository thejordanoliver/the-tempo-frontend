import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { MLBGame, MLBScoreSide, MLBTeam } from "types/mlb";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export function useMLBSeasonGames(season: string | number) {
  const [games, setGames] = useState<MLBGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    if (!season) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${BASE_URL}/api/gamesMLB/season/${season}`
      );

      setGames(res.data.games || []);
    } catch (err: any) {
      setError(err.message || "Failed to load MLB games");
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    refetch: fetchGames,
  };
}
