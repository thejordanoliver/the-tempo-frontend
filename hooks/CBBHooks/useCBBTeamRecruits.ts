import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export const useCBBTeamRecruits = (year: number) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!year) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const res = await apiClient.get("api/team/recruits/basketball", {
          params: { year },
        });

        setData(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            err.message ||
            "Failed to load team recruiting rankings",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [year],
  );

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
  };
};