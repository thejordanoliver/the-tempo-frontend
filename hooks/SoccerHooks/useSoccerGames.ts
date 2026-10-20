import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import type { OnScoreboardCalendar } from "hooks/LeagueHooks/useScoreboardCalendar";
import { SoccerGame } from "@/types/soccer/soccer";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

type FetchGamesOptions = {
  forceRefresh?: boolean;
  silent?: boolean;
};

type SoccerGamesResponse = {
  games?: SoccerGame[];
};

export function useSoccerGames(date?: Date, league = "epl", onScoreboardCalendar?: OnScoreboardCalendar) {
  const [games, setGames] = useState<SoccerGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const fetchGames = useCallback(
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchGamesOptions = {}) => {
      const requestId = ++requestIdRef.current;

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

        if (requestId === requestIdRef.current) {
          setGames(gamesData);
          onScoreboardCalendar?.(data);
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        onScoreboardCalendar?.(null);
        console.error(err);
        setError(new Error(`Failed to fetch ${league} games`));
        if (!forceRefresh && !silent) setGames([]);
      } finally {
        if (!silent && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [formattedDate, league, onScoreboardCalendar],
  );

  const refreshGames = useCallback(async () => {
    await fetchGames({ forceRefresh: true });
  }, [fetchGames]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchGames();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchGames]);

  const hasActiveGame = useMemo(() => {
    return games.some(shouldTrackGameUpdates);
  }, [games]);

  useLiveSportsSubscription<SoccerGamesResponse>({
    enabled: !loading && hasActiveGame,
    kind: "scoreboard",
    payload: {
      sport: "soccer",
      league,
      date: formattedDate !== "today" ? formattedDate : undefined,
    },
    onUpdate: (payload) => {
      requestIdRef.current += 1;
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
