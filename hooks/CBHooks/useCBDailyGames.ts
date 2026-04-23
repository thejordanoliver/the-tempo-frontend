import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { CollegeBaseballGame } from "types/baseball";
import { apiClient } from "utils/apiClient";

export function useCBDailyGames(date?: Date) {
  const [games, setGames] = useState<CollegeBaseballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef<Record<string, CollegeBaseballGame[]>>({});

  const fetchGames = useCallback(async () => {
    const formattedDate = date ? dayjs(date).format("YYYYMMDD") : "today";

    try {
      setLoading(true);
      setError(null);

      // ✅ RETURN CACHE FIRST
      if (cache.current[formattedDate]) {
        setGames(cache.current[formattedDate]);
        setLoading(false);
        return;
      }

      const { data } = await apiClient.get("api/games/cb", {
        params: formattedDate !== "today" ? { date: formattedDate } : {},
      });

      const gamesData = data.games || [];

      // ✅ SAVE CACHE
      cache.current[formattedDate] = gamesData;

      setGames(gamesData);
    } catch (err) {
      console.error(err);
      setError(new Error("Failed to fetch games"));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    refreshGames: fetchGames,
  };
}
