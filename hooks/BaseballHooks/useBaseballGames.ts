import { BaseballGame } from "@/types/baseball/baseball";
import { isGameLive } from "@/utils/games";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

type League = "mlb" | "cb" | "sb";

type FetchGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

type BaseballGamesResponse = {
  games?: BaseballGame[];
};

function getBaseballEndpoint(league: League) {
  switch (league) {
    case "sb":
      return "api/games/baseball/sb";
    case "cb":
      return "api/games/baseball/cb";
    case "mlb":
    default:
      return "api/games/baseball";
  }
}

export function useBaseballGames(date?: Date, league: League = "mlb") {
  const [games, setGames] = useState<BaseballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const endpoint = useMemo(() => getBaseballEndpoint(league), [league]);

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

  useLiveSportsSubscription<BaseballGamesResponse>({
    enabled: hasLiveGame,
    kind: "scoreboard",
    payload: {
      sport: "baseball",
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
