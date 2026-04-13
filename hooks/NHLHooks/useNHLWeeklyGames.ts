import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NHLGame } from "types/nhl";
import { apiClient, BASE_URL } from "utils/apiClient";

export function useNHLWeeklyGames() {
  const [games, setGames] = useState<NHLGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get(`api/games/nhl/weekly`);

      const gamesArray: NHLGame[] = Array.isArray(res.data?.games)
        ? res.data.games
        : [];

      setGames(gamesArray);
    } catch (err: any) {
      console.error("Error fetching NHL weekly games:", err?.message);
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
    const isLive = (game: NHLGame) => {
      const short = game.status?.short ?? "";

      return short === "P1" || "P2" || "P3" || "OT" || "PT " || "BT";
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
