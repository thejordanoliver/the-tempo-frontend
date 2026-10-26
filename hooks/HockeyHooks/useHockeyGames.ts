import {
  useSportsRequestScope,
  type SportsRequestOptions,
} from "hooks/Sports/useSportsRequestScope";
import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import type { OnScoreboardCalendar } from "hooks/LeagueHooks/useScoreboardCalendar";
import { HockeyGame } from "@/types/hockey/hockey";
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

export function useHockeyGames(
  date?: Date,
  league: League = "nhl",
  onScoreboardCalendar?: OnScoreboardCalendar,
  options: SportsRequestOptions = {},
) {
  const [storedGames, setGames] = useState<HockeyGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const scope = useSportsRequestScope(
    JSON.stringify([league, formattedDate]),
    options,
  );
  const { enabled, begin, isCurrent, accept, finish } = scope;
  const games = useMemo(
    () => (scope.hasData ? storedGames : []),
    [scope.hasData, storedGames],
  );

  const fetchGames = useCallback(
    async ({ forceRefresh = false }: FetchGamesOptions = {}) => {
      const request = begin();
      if (!request) return;
      const endpoint =
        league === "mch" ? "api/games/hockey/mch" : "api/games/hockey";

      try {
        setError(null);

        // Keep pull-to-refresh from showing the full page loading skeleton.
        if (!forceRefresh) {
          setLoading(!request.hasData);
        }

        const { data } = await apiClient.get(endpoint, {
          params: formattedDate !== "today" ? { date: formattedDate } : {},
          signal: request.controller.signal,
        });

        const gamesData = Array.isArray(data?.games) ? data.games : [];

        if (accept(request)) {
          setGames(gamesData);
          onScoreboardCalendar?.(data);
        }
      } catch (err) {
        if (!isCurrent(request)) return;
        onScoreboardCalendar?.(null);
        console.error(err);
        setError(new Error(`Failed to fetch ${league} games`));
        if (!forceRefresh) setGames([]);
      } finally {
        if (finish(request)) {
          setLoading(false);
        }
      }
    },
    [
      formattedDate,
      league,
      onScoreboardCalendar,
      begin,
      accept,
      finish,
      isCurrent,
    ],
  );

  const refreshGames = useCallback(async () => {
    await fetchGames({ forceRefresh: true });
  }, [fetchGames]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled && enabled) void fetchGames();
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, fetchGames]);

  const hasActiveGame = useMemo(() => {
    return games.some(shouldTrackGameUpdates);
  }, [games]);

  useLiveSportsSubscription<HockeyGamesResponse>({
    enabled: enabled && scope.settled && !loading && hasActiveGame,
    kind: "scoreboard",
    payload: {
      sport: "hockey",
      league,
      date: formattedDate !== "today" ? formattedDate : undefined,
    },
    onUpdate: (payload) => {
      if (!accept()) return;
      setLoading(false);
      setGames(Array.isArray(payload?.games) ? payload.games : []);
    },
  });

  return {
    games,
    loading: enabled && !scope.hasData && (!scope.settled || loading),
    error: enabled && scope.settled ? error : null,
    refreshGames,
  };
}
