import { isAxiosError, isCancel } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MMAFightLog } from "types/mma/fightLog";
import { apiClient } from "utils/apiClient";

type Result = { key: string; data: MMAFightLog | null; error: string | null };

export function useFighterFightLog(fighterId: number | string) {
  const id = String(fighterId ?? "").trim();
  const validId = /^\d+$/.test(id) && Number(id) > 0 && Number(id) <= 2147483647;
  const requestKey = validId ? String(Number(id)) : null;
  const [result, setResult] = useState<Result | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchFightLog = useCallback(async () => {
    controllerRef.current?.abort();
    if (!requestKey) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setResult(null);
    try {
      const response = await apiClient.get<MMAFightLog>(
        `/api/player/fightlog/ufc/${requestKey}`,
        { signal: controller.signal },
      );
      if (!controller.signal.aborted) {
        setResult({ key: requestKey, data: response.data, error: null });
      }
    } catch (error: unknown) {
      if (controller.signal.aborted || isCancel(error)) return;
      setResult({
        key: requestKey,
        data: null,
        error: isAxiosError<{ error?: string }>(error)
          ? error.response?.data?.error || "Unable to load fight log"
          : "Unable to load fight log",
      });
    }
  }, [requestKey]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return fetchFightLog();
    });
    return () => {
      active = false;
      controllerRef.current?.abort();
    };
  }, [fetchFightLog]);

  const currentResult = result?.key === requestKey ? result : null;
  return {
    data: currentResult?.data ?? null,
    loading: requestKey !== null && currentResult === null,
    error: validId ? currentResult?.error ?? null : "Invalid fighter ID",
    refetch: fetchFightLog,
  };
}
