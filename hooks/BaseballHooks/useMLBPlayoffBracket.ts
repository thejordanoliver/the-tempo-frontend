import { useCallback, useEffect, useState } from "react";
import type { MLBPlayoffBracketResponse } from "types/baseball/baseball";
import { apiClient } from "utils/apiClient";

export function useMLBPlayoffBracket(
  season: number,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const [data, setData] = useState<MLBPlayoffBracketResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBracket = useCallback(
    async (refresh = false) => {
      if (!enabled) return;

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await apiClient.get<MLBPlayoffBracketResponse>(
          "/api/games/baseball/mlb/playoffs",
          { params: { season, refresh: refresh ? 1 : undefined } },
        );
        setData(response.data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load the MLB playoff bracket.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [enabled, season],
  );

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return fetchBracket();
    });
    return () => {
      active = false;
    };
  }, [enabled, fetchBracket]);

  const refresh = useCallback(() => fetchBracket(true), [fetchBracket]);

  return { data, loading, refreshing, error, refresh };
}
