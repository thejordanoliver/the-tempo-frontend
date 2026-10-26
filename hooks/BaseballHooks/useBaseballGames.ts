import {
  useSportsRequestScope,
  type SportsRequestOptions,
} from "hooks/Sports/useSportsRequestScope";
import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import type { OnScoreboardCalendar } from "hooks/LeagueHooks/useScoreboardCalendar";
import { BaseballGame } from "@/types/baseball/baseball";
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

export function useBaseballGames(
  date?: Date,
  league: League = "mlb",
  onScoreboardCalendar?: OnScoreboardCalendar,
  options: SportsRequestOptions = {},
) {
  const [storedGames, setGames] = useState<BaseballGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const formattedDate = useMemo(() => {
    return date ? dayjs(date).format("YYYYMMDD") : "today";
  }, [date]);

  const endpoint = getBaseballEndpoint(league);

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
    async ({
      forceRefresh = false,
      silent = false,
    }: FetchGamesOptions = {}) => {
      const request = begin();
      if (!request) return;

      try {
        setError(null);

        // Keep pull-to-refresh and live updates from showing the full skeleton.
        if (!forceRefresh && !silent) {
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
        if (!forceRefresh && !silent) setGames([]);
      } finally {
        if (finish(request)) {
          setLoading(false);
        }
      }
    },
    [
      endpoint,
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

  useLiveSportsSubscription<BaseballGamesResponse>({
    enabled: enabled && scope.settled && !loading && hasActiveGame,
    kind: "scoreboard",
    payload: {
      sport: "baseball",
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
