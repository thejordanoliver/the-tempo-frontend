import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { MMAChampionsResponse, MMADivision } from "types/mma";
import { apiClient } from "utils/apiClient";

interface UseMMAChampionsResult {
  data: MMAChampionsResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshChampions: () => Promise<void>;
}

const useMMAChampions = (division?: MMADivision): UseMMAChampionsResult => {
  const [data, setData] = useState<MMAChampionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChampions = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await apiClient.get<{
          success: boolean;
          data: MMAChampionsResponse;
        }>(`/api/mma/champions${division ? `?division=${division}` : ""}`);

        setData(response.data.data);
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          setError(
            err.response?.data?.error ||
              err.message ||
              "Failed to fetch champions"
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch champions");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [division]
  );

  const refreshChampions = async () => {
    await fetchChampions(true);
  };

  useEffect(() => {
    fetchChampions();

  }, [fetchChampions]);

  return { data, loading, refreshing, error, refreshChampions };
};

export default useMMAChampions;
