import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import type { OnScoreboardCalendar } from "hooks/LeagueHooks/useScoreboardCalendar";
import { HockeyGame } from "@/types/hockey/hockey";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveSportsSubscription } from "hooks/useLiveSportsSubscription";
import { apiClient } from "utils/apiClient";

type League = "nhl" | "mch";

type FetchGamesOptions = {
  forceRefresh?: boolean;
};

type HockeyGamesResponse = {
  games?: HockeyGame[];
};

export function useHockeyGames(date?: Date, league: League = "nhl", onScoreboardCalendar?: OnScoreboardCalendar) {
  const [games, setGames] = useState<HockeyGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const fetchGames = useCallback(
    async ({ forceRefresh = false }: FetchGamesOptions = {}) => {
      const requestId = ++requestIdRef.current;
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

        if (requestId === requestIdRef.current) {
          setGames(gamesData);
          onScoreboardCalendar?.(data);
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        onScoreboardCalendar?.(null);
        console.error(err);
        setError(new Error(`Failed to fetch ${league} games`));
        if (!forceRefresh) setGames([]);
      } finally {
        if (requestId === requestIdRef.current) {
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

  useLiveSportsSubscription<HockeyGamesResponse>({
    enabled: !loading && hasActiveGame,
    kind: "scoreboard",
    payload: {
      sport: "hockey",
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
