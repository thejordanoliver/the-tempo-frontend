import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MLBGame } from "types/baseball";

import { BASE_URL } from "utils/apiClient";

export function useMLBWeeklyGames() {
  const [games, setGames] = useState<MLBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/games/mlb/weekly`);

      const gamesArray: MLBGame[] = Array.isArray(res.data?.games)
        ? res.data.games
        : [];

      setGames(gamesArray);
    } catch (err: any) {
      console.error("Error fetching MLB weekly games:", err?.message);
      setError("Failed to load weekly games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const sortedGames = useMemo(() => {
    const isLive = (game: MLBGame) => {
      const short = game.status?.short ?? "";
      const long = game.status?.long ?? "";

      return (
        short.startsWith("IN") || // IN1, IN8, etc.
        short === "LIVE" ||
        long.includes("Inning")
      );
    };

    return [...games].sort((a, b) => {
      return Number(isLive(b)) - Number(isLive(a));
    });
  }, [games]);

  return {
    games: sortedGames,
    loading,
    error,
    refreshGames: fetchGames,
  };
}
