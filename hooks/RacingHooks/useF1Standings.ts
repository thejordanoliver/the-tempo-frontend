import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RacingStandingsData } from "types/racingStandings";
import { apiClient } from "utils/apiClient";

export function useF1Standings(year?: string) {
  const [data, setData] = useState<RacingStandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const fetchStandings = useCallback(async (isRefresh = false) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(!isRefresh);
    setRefreshing(isRefresh);
    setError(null);
    try {
      const response = await apiClient.get<RacingStandingsData>("/api/standings/f1", {
        params: { ...(year ? { season: year } : {}), seasontype: "2" },
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setData(response.data);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(isAxiosError(err)
        ? err.response?.data?.error || "Unable to load F1 standings."
        : "Unable to load F1 standings.");
      if (!isRefresh) setData(null);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [year]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchStandings();
    });
    return () => {
      cancelled = true;
      requestRef.current?.abort();
    };
  }, [fetchStandings]);

  return { data, loading, refreshing, error, refresh: () => fetchStandings(true) };
}
