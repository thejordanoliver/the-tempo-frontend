import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient } from "utils/apiClient";

export function useNFLMatchup(
  team1: string | number,
  team2: string | number,
  options?: {
    year?: string | number;
    week?: string | number;
  },
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const year = options?.year;
  const week = options?.week;

  const fetchMatchup = useCallback(async () => {
    if (!team1 || !team2) return;
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        team1: String(team1),
        team2: String(team2),
      };

      if (year) params.year = year;
      if (week) params.week = week;

      const res = await apiClient.get(`api/pfr/matchup`, {
        params,
      });

      if (requestId === requestIdRef.current) setData(res.data);
    } catch (err: any) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "Failed to fetch matchup.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [team1, team2, week, year]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchMatchup();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchMatchup]);

  return {
    data,
    teams: data?.teams,
    series: data?.series,
    games: data?.games,
    count: data?.count,
    loading,
    error,
    refresh: fetchMatchup,
  };
}
