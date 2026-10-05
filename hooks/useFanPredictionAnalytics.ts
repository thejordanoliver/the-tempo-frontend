import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export type PredictionSample = { correct: number; graded: number };
export type PredictionAnalytics = {
  recent: PredictionSample;
  previous: PredictionSample;
  weekly: (PredictionSample & { week: string })[];
  leagues: (PredictionSample & { sport: string; league: string; pending: number })[];
};

export function useFanPredictionAnalytics() {
  const [data, setData] = useState<PredictionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    return apiClient.get<PredictionAnalytics>("/api/predictions/analytics", { signal: request.signal })
      .then((response) => {
        if (!request.signal.aborted) setData(response.data);
      })
      .catch(() => {
        if (!request.signal.aborted) setError("We couldn’t load your prediction analysis.");
      })
      .finally(() => {
        if (!request.signal.aborted) setLoading(false);
      });
  }, []);
  useEffect(() => { void load(); return () => controller.current?.abort(); }, [load]);
  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    return load();
  }, [load]);
  return { data, loading, error, refresh };
}
