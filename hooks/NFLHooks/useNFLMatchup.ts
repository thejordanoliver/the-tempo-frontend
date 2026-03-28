import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { BASE_URL } from "utils/apiClient";

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

  const fetchMatchup = useCallback(async () => {
    if (!team1 || !team2) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        team1: String(team1),
        team2: String(team2),
      };

      if (options?.year) params.year = options.year;
      if (options?.week) params.week = options.week;

      const res = await axios.get(`${BASE_URL}/api/pfr/matchup`, {
        params,
      });

      setData(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch matchup.");
    } finally {
      setLoading(false);
    }
  }, [team1, team2, options?.year, options?.week]);

  useEffect(() => {
    fetchMatchup();
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
