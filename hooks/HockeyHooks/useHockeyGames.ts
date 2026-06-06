import { HockeyGame } from "@/types/hockey";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

type League = "nhl" | "mch";

type FetchGamesOptions = {
  forceRefresh?: boolean;
};

export function useHockeyGames(date?: Date, league: League = "nhl") {
  const [games, setGames] = useState<HockeyGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGames = useCallback(
    async ({ forceRefresh = false }: FetchGamesOptions = {}) => {
      const formattedDate = date ? dayjs(date).format("YYYYMMDD") : "today";

      const endpoint =
        league === "mch" ? "api/games/hockey/mch" : "api/games/hockey";

      try {
        setError(null);

        // Keep pull-to-refresh from showing the full page loading skeleton.
        if (!forceRefresh) {
          setLoading(true);
        }

        const { data } = await apiClient.get(endpoint, {
          params: formattedDate !== "today" ? { date: formattedDate } : {},
        });

        const gamesData = Array.isArray(data?.games) ? data.games : [];

        setGames(gamesData);
      } catch (err) {
        console.error(err);
        setError(new Error(`Failed to fetch ${league} games`));
        setGames([]);
      } finally {
        setLoading(false);
      }
    },
    [date, league],
  );

  const refreshGames = useCallback(async () => {
    await fetchGames({ forceRefresh: true });
  }, [fetchGames]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    loading,
    error,
    refreshGames,
  };
}
