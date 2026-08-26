import { FootballGame } from "@/types/football/football";
import { apiClient } from "@/utils/apiClient";
import { useCallback, useEffect, useState } from "react";
import { FootballGameGroup } from "./useFootballGames";

type UseFootballGamesParams = {
  date?: Date;
  week?: number | string | null;
  season?: number | string | null;
  seasontype?: number | string | null;
  league?: string;
  conferenceId?: number | string | null;
  enabled?: boolean;
};

type FootballGamesResponse = {
  league?: string;

  season?: {
    year?: number | null;
    type?: number | null;
    slug?: string | null;
  } | null;

  week?: {
    number?: number | null;
  } | null;

  date?: string | null;

  count?: number;

  games?: FootballGame[];

  groups?: FootballGameGroup[];
};

type UseCFBPlayoffsReturn = {
  data: FootballGamesResponse | null;

  games: FootballGame[];

  loading: boolean;
  refreshing: boolean;

  error: string | null;

  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const responseError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
    };

    return (
      responseError.response?.data?.message ??
      responseError.response?.data?.error ??
      "Failed to load College Football Playoff games."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load College Football Playoff games.";
}

export function useCFBPlayoffs({
  season,
  enabled = true,
}: UseFootballGamesParams): UseCFBPlayoffsReturn {
  const [data, setData] = useState<FootballGamesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayoffs = useCallback(
    async ({
      isRefresh = false,
    }: {
      isRefresh?: boolean;
    } = {}) => {
      if (!enabled) {
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await apiClient.get<FootballGamesResponse>(
          "/api/games/football/cfb/playoffs",
          {
            params: {
              season,
            },
          },
        );

        setData(response.data);
      } catch (err) {
        console.error("[useCFBPlayoffs] Failed to fetch playoffs:", err);

        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [enabled, season],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetchPlayoffs();
  }, [enabled, fetchPlayoffs]);

  const refetch = useCallback(async () => {
    await fetchPlayoffs();
  }, [fetchPlayoffs]);

  const refresh = useCallback(async () => {
    await fetchPlayoffs({
      isRefresh: true,
    });
  }, [fetchPlayoffs]);

  return {
    data,
    games: data?.games ?? [],
    loading,
    refreshing,
    error,
    refetch,
    refresh,
  };
}
