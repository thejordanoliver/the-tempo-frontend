import { isAxiosError, isCancel } from "axios";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export function usePlayerById(
  playerId?: number,
  league: string = "nfl",
  enabled = true,
) {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(
    null,
  );
  const canFetch =
    enabled && Boolean(playerId) && Number.isFinite(Number(playerId));
  const requestKey = canFetch ? `${league}:${playerId}` : null;

  useEffect(() => {
    if (!requestKey || !playerId) {
      return;
    }

    const controller = new AbortController();

    async function fetchPlayer() {
      try {
        setLoading(true);
        setError(null);
        setPlayer(null);
        setResolvedRequestKey(null);

        const url =
          league === "nba"
            ? `api/roster/player/${playerId}`
            : `api/roster/${league}/player/${playerId}`;

        const res = await apiClient.get(url, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setPlayer(res.data.player ?? null);
        setResolvedRequestKey(requestKey);
      } catch (err: unknown) {
        if (isCancel(err) || controller.signal.aborted) return;

        console.error("Player fetch error:", err);
        setPlayer(null);
        setError(
          isAxiosError<{ error?: string; message?: string }>(err)
            ? err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to load player"
            : "Failed to load player",
        );
        setResolvedRequestKey(requestKey);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPlayer();

    return () => controller.abort();
  }, [league, playerId, requestKey]);

  const hasCurrentResult =
    requestKey !== null && resolvedRequestKey === requestKey;

  return {
    player: hasCurrentResult ? player : null,
    loading: canFetch ? loading || !hasCurrentResult : false,
    error: hasCurrentResult ? error : null,
  };
}
