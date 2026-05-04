import { useCallback, useEffect, useState } from "react";
import type { BracketApiResponse } from "types/football";
import { apiClient } from "utils/apiClient";

type UseNFLBracketResult = {
  playoffData: BracketApiResponse["bracket"] | null;
  playoffLoading: boolean;
  playoffError: string | null;
  playoffRefreshing: boolean;
  onRefresh: () => Promise<void>;
};

export const useNFLBracket = (season: number): UseNFLBracketResult => {
  const [playoffData, setPlayoffData] = useState<
    BracketApiResponse["bracket"] | null
  >(null);
  const [playoffLoading, setPlayoffLoading] = useState(false);
  const [playoffError, setPlayoffError] = useState<string | null>(null);
  const [playoffRefreshing, setPlayoffRefreshing] = useState<boolean>(false);

  const fetchPlayoffs = useCallback(async () => {
    try {
      setPlayoffLoading(true);
      setPlayoffError(null);

      const res = await apiClient.get<BracketApiResponse>(
        `api/games/football/playoffs/${season}`,
      );

      setPlayoffData(res.data.bracket);
    } catch (err: any) {
      setPlayoffError(err?.message ?? "Failed to load bracket");
    } finally {
      setPlayoffLoading(false);
    }
  }, [season]);

  useEffect(() => {
    fetchPlayoffs();
  }, [fetchPlayoffs]);

  /* pull to refresh handler */
  const onRefresh = useCallback(async () => {
    setPlayoffRefreshing(true);
    await fetchPlayoffs();
    setPlayoffRefreshing(false);
  }, [fetchPlayoffs]);

  return {
    playoffData,
    playoffLoading,
    playoffError,
    playoffRefreshing,
    onRefresh,
  };
};
