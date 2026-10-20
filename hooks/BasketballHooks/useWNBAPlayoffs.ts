import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WNBAPlayoffBracketData } from "types/basketball/wnbaPlayoffs";
import { apiClient } from "utils/apiClient";

const LIVE_POLL_INTERVAL_MS = 30_000;
const LOAD_ERROR = "Couldn’t load the WNBA playoffs.";

type LoadOptions = { silent?: boolean };

function hasActiveGames(data: WNBAPlayoffBracketData | null) {
  return data?.rounds.some((round) =>
    round.series.some((series) =>
      series.games.some(shouldTrackGameUpdates),
    ),
  ) ?? false;
}

export function useWNBAPlayoffs(season: number) {
  const [data, setData] = useState<WNBAPlayoffBracketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async ({ silent = false }: LoadOptions = {}) => {
      requestRef.current?.abort();
      const request = new AbortController();
      requestRef.current = request;

      if (!silent) setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<WNBAPlayoffBracketData>(
          "/api/games/basketball/wnba/playoffs",
          { params: { season }, signal: request.signal },
        );
        if (!request.signal.aborted) setData(response.data);
      } catch {
        if (!request.signal.aborted) setError(LOAD_ERROR);
      } finally {
        if (!request.signal.aborted) setLoading(false);
      }
    },
    [season],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
      requestRef.current?.abort();
    };
  }, [load]);

  const hasActiveGame = hasActiveGames(data);
  useEffect(() => {
    if (!hasActiveGame) return;

    const timer = setInterval(() => {
      void load({ silent: true });
    }, LIVE_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasActiveGame, load]);

  const refresh = useCallback(() => load(), [load]);

  return {
    data: data?.season === season ? data : null,
    loading,
    error,
    refresh,
  };
}
