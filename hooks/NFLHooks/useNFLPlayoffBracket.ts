import { useCallback, useEffect, useState } from "react";
import type { BracketApiResponse } from "types/football";
import { apiClient } from "utils/apiClient";

type UseNFLBracketResult = {
  playoffData: BracketApiResponse["bracket"] | null;
  playoffsLoading: boolean;
  playoffError: string | null;
  refetch: () => Promise<void>;
};

export const useNFLBracket = (season: number): UseNFLBracketResult => {
  const [playoffData, setPlayoffData] = useState<
    BracketApiResponse["bracket"] | null
  >(null);
  const [playoffsLoading, setPlayoffsLoading] = useState(false);
  const [playoffError, setPlayoffError] = useState<string | null>(null);

  const fetchBracket = useCallback(async () => {
    try {
      setPlayoffsLoading(true);
      setPlayoffError(null);

      const res = await apiClient.get<BracketApiResponse>(
        `api/games/football/playoffs/${season}`,
      );

      setPlayoffData(res.data.bracket);
    } catch (err: any) {
      setPlayoffError(err?.message ?? "Failed to load bracket");
    } finally {
      setPlayoffsLoading(false);
    }
  }, [season]);

  useEffect(() => {
    fetchBracket();
  }, [fetchBracket]);

  return {
    playoffData,
    playoffsLoading,
    playoffError,
    refetch: fetchBracket,
  };
};
