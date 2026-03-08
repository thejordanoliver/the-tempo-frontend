import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MLBGame } from "types/mlb";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function useMLBSeasonGames(season: string) {
  const [games, setGames] = useState<MLBGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/games/mlb/season/${season}`);

      if (!res.data?.success) {
        throw new Error("API returned unsuccessful response");
      }

      const gamesArray: MLBGame[] = Array.isArray(res.data.games)
        ? res.data.games
        : [];

      setGames(gamesArray);
    } catch (err: any) {
      console.error("Error fetching MLB season games:", err?.response?.data || err?.message);
      setError("Failed to load season games");
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // ✅ Live games sorted to top
  const sortedGames = useMemo(() => {
    const isLive = (game: MLBGame) => {
      const short = game.status?.short ?? "";
      const long = game.status?.long ?? "";
      return short.startsWith("IN") || short === "LIVE" || long.includes("Inning");
    };

    return [...games].sort((a, b) => Number(isLive(b)) - Number(isLive(a)));
  }, [games]);

  return {
    games: sortedGames,
    loading,
    error,
    refreshGames: fetchGames,
  };
}