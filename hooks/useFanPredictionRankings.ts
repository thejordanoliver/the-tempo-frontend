import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPredictionRankings } from "services/fanPredictionsApi";
import type { FanPredictionRankingsResponse } from "types/fanPredictions";
export function useFanPredictionRankings() {
  const [data, setData] = useState<FanPredictionRankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    return fetchPredictionRankings(request.signal)
      .then((result) => {
        if (!request.signal.aborted) setData(result);
      })
      .catch(() => {
        if (!request.signal.aborted) setError("We couldn't load fan rankings. Try again.");
      })
      .finally(() => {
        if (!request.signal.aborted) { setLoading(false); setRefreshing(false); }
      });
  }, []);
  useEffect(() => { void load(); return () => controller.current?.abort(); }, [load]);
  const refresh = useCallback(() => {
    setError(null);
    setRefreshing(true);
    void load();
  }, [load]);
  return { data, loading, refreshing, error, refresh };
}
