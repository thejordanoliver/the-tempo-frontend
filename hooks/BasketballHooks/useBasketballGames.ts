import { BasketballGame } from "@/types/basketball/basketball";
import { isGameLive } from "@/utils/games";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

type FetchGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

type BasketballGamesResponse = {
  games?: BasketballGame[];
};

function getBasketballEndpoint(league: string) {
  switch (league) {
    case "cbb":
      return "api/games/basketball/cbb";
    case "wcbb":
      return "api/games/basketball/wcbb";
    case "wnba":
      return "api/games/basketball/wnba";
    case "summervegas":
      return "api/games/basketball/summervegas";
    case "summerutah":
      return "api/games/basketball/summerutah";
    case "summercalifornia":
      return "api/games/basketball/summercalifornia";
    default:
      return "api/games/basketball/nba";
  }
}

export function useBasketballGames(date?: Date, league: string = "nba") {
  const [games, setGames] = useState<BasketballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const endpoint = useMemo(() => getBasketballEndpoint(league), [league]);

  const fetchGames = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchGamesOptions = {}) => {
      try {
        setError(null);

        // Keep pull-to-refresh and live updates from showing the full skeleton.
        if (!forceRefresh && !silent) {
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
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [endpoint, formattedDate, league],
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

  useLiveSportsSubscription<BasketballGamesResponse>({
    enabled: hasLiveGame,
    kind: "scoreboard",
    payload: {
      sport: "basketball",
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
