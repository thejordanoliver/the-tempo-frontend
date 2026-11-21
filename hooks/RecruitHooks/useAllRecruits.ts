import { normalizeRecruit } from "utils/recruiting/recruits";
import { Recruit } from "@/types/recruiting/players";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

interface useRecruitsResult {
  data: Recruit[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAllRecruits(
  year: number,
  league: "mcbb" | "cfb",
): useRecruitsResult {
  const requestId = useRef(0);
  const [data, setData] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruits = useCallback(
    async (isRefresh = false, signal?: AbortSignal) => {
      const currentRequest = ++requestId.current;
      if (signal?.aborted) return;
      if (!year) {
        setData([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      if (!isRefresh) setData([]);

      try {
        const res = await apiClient.get<Recruit[]>(
          `api/recruits/${league}/${year}`,
          { signal },
        );

        const recruits = Array.isArray(res.data)
          ? res.data.map(normalizeRecruit)
          : [];

        if (signal?.aborted || currentRequest !== requestId.current) return;
        setData(recruits);
      } catch (err: any) {
        if (
          err?.name === "CanceledError" ||
          err?.code === "ERR_CANCELED" ||
          currentRequest !== requestId.current ||
          signal?.aborted
        ) {
          return;
        }

        if (err?.response?.status === 404) {
          setData([]);
          return;
        }
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load recruits",
        );
      } finally {
        if (!signal?.aborted && currentRequest === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [year, league],
  );

  const refresh = useCallback(() => {
    return fetchRecruits(true);
  }, [fetchRecruits]);

  const refetch = useCallback(() => {
    return fetchRecruits(false);
  }, [fetchRecruits]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => fetchRecruits(false, controller.signal));

    return () => controller.abort();
  }, [fetchRecruits]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
    refetch,
  };
}
