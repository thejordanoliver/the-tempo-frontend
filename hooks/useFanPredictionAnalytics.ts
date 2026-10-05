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
  const refresh = useCallback(async () => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PredictionAnalytics>("/api/predictions/analytics", { signal: request.signal });
      if (!request.signal.aborted) setData(response.data);
    } catch {
      if (!request.signal.aborted) setError("We couldn’t load your prediction analysis.");
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => { void refresh(); return () => controller.current?.abort(); }, [refresh]);
  return { data, loading, error, refresh };
}
