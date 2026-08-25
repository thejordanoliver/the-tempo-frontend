import { SoccerGame } from "@/types/soccer/soccer";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

type FetchGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

type SoccerGamesResponse = {
  games?: SoccerGame[];
};

const LIVE_STATES = "in";

function isLiveSoccerGame(game: any) {
  const state = String(game?.status?.state || "").toLowerCase();
  return LIVE_STATES.includes(state);
}

export function useSoccerGames(date?: Date, league = "epl") {
  const [games, setGames] = useState<SoccerGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

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

        const { data } = await apiClient.get(`api/games/soccer/${league}`, {
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
    [formattedDate, league],
  );

  const refreshGames = useCallback(async () => {
    await fetchGames({ forceRefresh: true });
  }, [fetchGames]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const hasLiveGame = useMemo(() => {
    return games.some(isLiveSoccerGame);
  }, [games]);

  useLiveSportsSubscription<SoccerGamesResponse>({
    enabled: hasLiveGame,
    kind: "scoreboard",
    payload: {
      sport: "soccer",
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
