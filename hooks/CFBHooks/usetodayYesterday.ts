import { Game } from "types/cfb";
import axios from "axios";
import { useCallback, useEffect, useState, useMemo } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export function usetodayYesterday(season = "2025", league = "2") {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/api/gamesCFB/todayYesterday`, {
        params: { season, league },
      });

      const games = res.data.response || [];
      setGames(games);
    } catch (err: any) {
      console.error("Error fetching weekly games:", err.message);
      setError(err.message || "Failed to fetch weekly games");
    } finally {
      setLoading(false);
    }
  }, [season, league]);

  useEffect(() => {
    fetchWeeklyGames();
  }, [fetchWeeklyGames]);

  // ✅ Detect live games
  const isLiveGame = (game: Game) => {
    const status = game.game?.status?.short ?? "";
    return ["Q1", "Q2", "Q3", "Q4", "OT", "HT"].includes(status);
  };

  // Sorted with live games first
  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)));
  }, [games]);

  return { games: sortedGames, loading, error, refetch: fetchWeeklyGames };
}
