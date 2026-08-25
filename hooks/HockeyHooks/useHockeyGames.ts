import { HockeyGame } from "@/types/hockey/hockey";
import { isGameLive } from "@/utils/games";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

type League = "nhl" | "mch";

type FetchGamesOptions = {
  forceRefresh?: boolean;
};

type HockeyGamesResponse = {
  games?: HockeyGame[];
};

export function useHockeyGames(date?: Date, league: League = "nhl") {
  const [games, setGames] = useState<HockeyGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const fetchGames = useCallback(
    async ({ forceRefresh = false }: FetchGamesOptions = {}) => {
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
    [formattedDate, league],
  );

  const refreshGames = useCallback(async () => {
    await fetchGames({ forceRefresh: true });
  }, [fetchGames]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const hasLiveGame = useMemo(() => {
    return games.some(isGameLive);
  }, [games]);

  useLiveSportsSubscription<HockeyGamesResponse>({
    enabled: hasLiveGame,
    kind: "scoreboard",
    payload: {
      sport: "hockey",
      league,
      date: formattedDate !== "today" ? formattedDate : undefined,
    },
    onUpdate: (payload) => {
      setGames(Array.isArray(payload?.games) ? payload.games : []);
    },
  });

  return {
    games,
    loading,
    error,
    refreshGames,
  };
}
