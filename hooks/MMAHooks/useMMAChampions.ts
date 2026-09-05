import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

import type {
  MMAChampionsApiResponse,
  MMAChampionsResponse,
  MMADivision,
} from "types/mma/mma";

import { apiClient } from "utils/apiClient";

export interface UseMMAChampionsResult {
  data: MMAChampionsResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshChampions: () => Promise<void>;
}

type MMAChampionsErrorResponse = {
  error?: string;
  message?: string;
};

export default function useMMAChampions(
  division?: MMADivision,
): UseMMAChampionsResult {
  const [data, setData] = useState<MMAChampionsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchChampions = useCallback(
    async (isRefresh = false): Promise<void> => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await apiClient.get<MMAChampionsApiResponse>(
          "/api/mma/champions",
          {
            params: division
              ? {
                  division,
                }
              : undefined,
          },
        );

        setData(response.data.data);
      } catch (err: unknown) {
        if (isAxiosError<MMAChampionsErrorResponse>(err)) {
          setError(
            err.response?.data?.error ??
              err.response?.data?.message ??
              err.message ??
              "Failed to fetch MMA champions",
          );

          return;
        }

        if (err instanceof Error) {
          setError(err.message);

          return;
        }

        setError("Failed to fetch MMA champions");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [division],
  );

  const refreshChampions = useCallback(async (): Promise<void> => {
    await fetchChampions(true);
  }, [fetchChampions]);

  useEffect(() => {
    void fetchChampions();
  }, [fetchChampions]);

  return {
    data,
    loading,
    refreshing,
    error,
    refreshChampions,
  };
}
