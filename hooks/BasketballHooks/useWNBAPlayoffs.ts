import { useScreenActivity } from "hooks/useScreenActivity";
import { shouldTrackGameUpdates } from "utils/games/gameStatus";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WNBAPlayoffBracketData } from "types/basketball/wnbaPlayoffs";
import { apiClient } from "utils/apiClient";

const LIVE_POLL_INTERVAL_MS = 30_000;
const LOAD_ERROR = "Couldn’t load the WNBA playoffs.";

type LoadOptions = { silent?: boolean };

function hasActiveGames(data: WNBAPlayoffBracketData | null) {
  return (
    data?.rounds.some((round) =>
      round.series.some((series) => series.games.some(shouldTrackGameUpdates)),
    ) ?? false
  );
}

export function useWNBAPlayoffs(
  season: number,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { active: screenActive, activeRef } = useScreenActivity();
  const active = screenActive && enabled;
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  const [data, setData] = useState<WNBAPlayoffBracketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const loadedSeason = useRef<number | null>(null);

  const load = useCallback(
    async ({ silent = false }: LoadOptions = {}) => {
      if (!activeRef.current || !enabledRef.current) return;
      requestRef.current?.abort();
      const request = new AbortController();
      requestRef.current = request;

      setLoading(!silent || loadedSeason.current !== season);
      setError(null);

      try {
        const response = await apiClient.get<WNBAPlayoffBracketData>(
          "/api/games/basketball/wnba/playoffs",
          { params: { season }, signal: request.signal },
        );
        if (
          !request.signal.aborted &&
          activeRef.current &&
          enabledRef.current
        ) {
          loadedSeason.current = season;
          setData(response.data);
        }
      } catch {
        if (!request.signal.aborted && activeRef.current && enabledRef.current)
          setError(LOAD_ERROR);
      } finally {
        if (!request.signal.aborted && activeRef.current && enabledRef.current)
          setLoading(false);
        if (requestRef.current === request) requestRef.current = null;
      }
    },
    [season, activeRef],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled && active) void load({ silent: true });
    });
    return () => {
      cancelled = true;
      requestRef.current?.abort();
    };
  }, [load, active]);

  const hasActiveGame = hasActiveGames(data);
  useEffect(() => {
    if (!active || !hasActiveGame) return;

    const timer = setInterval(() => {
      if (!requestRef.current) void load({ silent: true });
    }, LIVE_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [active, hasActiveGame, load]);

  const refresh = useCallback(() => load(), [load]);

  return {
    data: data?.season === season ? data : null,
    loading,
    error,
    refresh,
  };
}
