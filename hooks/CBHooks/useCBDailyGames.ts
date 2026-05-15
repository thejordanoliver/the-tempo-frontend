import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { CollegeBaseballGame } from "types/baseball";
import { apiClient } from "utils/apiClient";

type Sport = "cb" | "sb";

export function useCBDailyGames(date?: Date, sport: Sport = "cb") {
  const [games, setGames] = useState<CollegeBaseballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef<Record<string, CollegeBaseballGame[]>>({});

  const fetchGames = useCallback(async () => {
    const formattedDate = date ? dayjs(date).format("YYYYMMDD") : "today";
    const cacheKey = `${sport}:${formattedDate}`;
    const endpoint = sport === "sb" ? "api/games/cb/softball" : "api/games/cb";

    try {
      setLoading(true);
      setError(null);

      // ✅ RETURN CACHE FIRST
      if (cache.current[cacheKey]) {
        setGames(cache.current[cacheKey]);
        setLoading(false);
        return;
      }

      const { data } = await apiClient.get(endpoint, {
        params: formattedDate !== "today" ? { date: formattedDate } : {},
      });

      const gamesData = data.games || [];

      // ✅ SAVE CACHE
      cache.current[cacheKey] = gamesData;

      setGames(gamesData);
    } catch (err) {
      console.error(err);
      setError(new Error(`Failed to fetch ${sport} games`));
    } finally {
      setLoading(false);
    }
  }, [date, sport]);

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