import { isAxiosError, isCancel } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerGameLog } from "types/playerGameLog";
import { apiClient } from "utils/apiClient";

export function usePlayerGameLog(
  playerId: number | string,
  league: string,
  season: string | null = null,
  category: string | null = null,
) {
  const [data, setData] = useState<PlayerGameLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedRequestKey, setResolvedRequestKey] = useState<string | null>(
    null,
  );
  const controllerRef = useRef<AbortController | null>(null);
  const normalizedPlayerId = String(playerId ?? "").trim();
  const isValidPlayerId =
    /^\d+$/.test(normalizedPlayerId) && Number(normalizedPlayerId) > 0;
  const requestKey = isValidPlayerId
    ? `${league}:${normalizedPlayerId}:${season ?? "latest"}:${category ?? "default"}`
    : null;

  const fetchGameLog = useCallback(async () => {
    controllerRef.current?.abort();
    if (!requestKey) return;

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      setData(null);
      setResolvedRequestKey(null);

      const response = await apiClient.get<PlayerGameLog>(
        `/api/player/gamelog/${league}/${normalizedPlayerId}`,
        {
          params: { ...(season ? { season } : {}), ...(category ? { category } : {}) },
          signal: controller.signal,
        },
      );
      if (controller.signal.aborted) return;

      setData(response.data);
      setResolvedRequestKey(requestKey);
    } catch (err: unknown) {
      if (controller.signal.aborted || isCancel(err)) return;

      setData(null);
      setError(
        isAxiosError<{ error?: string }>(err)
          ? err.response?.data?.error || "Unable to load game log"
          : "Unable to load game log",
      );
      setResolvedRequestKey(requestKey);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [league, normalizedPlayerId, season, category, requestKey]);

  useEffect(() => {
    let active = true;
    
    void Promise.resolve().then(() => {
      if (active) return fetchGameLog();
    });
    return () => {
      active = false;
      controllerRef.current?.abort();
    };
  }, [fetchGameLog]);

  const hasCurrentResult =
    requestKey !== null && resolvedRequestKey === requestKey;
  return {
    data: hasCurrentResult ? data : null,
    loading: requestKey !== null && (loading || !hasCurrentResult),
    error: !isValidPlayerId
      ? "Invalid player ID"
      : hasCurrentResult
        ? error
        : null,
    refetch: fetchGameLog,
  };
}
