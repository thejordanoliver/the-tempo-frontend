import { isAxiosError, isCancel } from "axios";
import { useEffect, useMemo, useState } from "react";
import type { PlayerGameLog, PlayerGameLogSport } from "types/playerGameLog";
import { apiClient } from "utils/apiClient";
import { getLatestPlayerGame } from "utils/playerGameLog";

export function usePlayerLatestGame<Game extends { id: string | number | null }>(
  gameLog: PlayerGameLog | null,
  sport: PlayerGameLogSport,
  league: string,
) {
  const latestEntry = useMemo(
    () => getLatestPlayerGame(gameLog?.games ?? []),
    [gameLog],
  );
  const requestKey = latestEntry?.date
    ? `${sport}:${league}:${latestEntry.eventId}:${latestEntry.date}`
    : null;
  const eventId = latestEntry?.eventId;
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(null);

  useEffect(() => {
    if (!requestKey || !eventId) return;
    const controller = new AbortController();
    apiClient.get<{ game: Game }>(`/api/games/${sport}/game/${league}/${eventId}`, {
      signal: controller.signal,
    }).then(response => {
      if (controller.signal.aborted) return;
      const latestGame = String(response.data.game?.id) === eventId ? response.data.game : null;
      setGame(latestGame);
      setError(latestGame ? null : "Latest player game is unavailable");
      setResolvedRequestKey(requestKey);
    }).catch((err: unknown) => {
      if (controller.signal.aborted || isCancel(err)) return;
      setGame(null);
      setError(isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error || "Unable to load latest player game"
        : "Unable to load latest player game");
      setResolvedRequestKey(requestKey);
    });
    return () => controller.abort();
  }, [sport, league, requestKey, eventId]);

  const hasCurrentResult = requestKey !== null && resolvedRequestKey === requestKey;
  return {
    game: hasCurrentResult ? game : null,
    loading: requestKey !== null && !hasCurrentResult,
    error: hasCurrentResult ? error : null,
  };
}
