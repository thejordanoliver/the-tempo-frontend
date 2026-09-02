import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type ChampionSeason = {
  id: number;
  season: string | number;
  team_name: string;
  selector?: string | null;
  era?: string | null;
  league?: string | null;
  team: {
    id: number;
    code: string;
    name: string;
    short_name?: string;
    color?: string;
  } | null;
  notes: string;
};

type Options = {
  enabled?: boolean;
  refreshToken?: number;
  league: string;
};

export function useChampions({
  league,
  enabled = true,
  refreshToken,
}: Options) {
  const [data, setData] = useState<ChampionSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChampions = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const endpoint = `api/${league}/champion-seasons`;

      const res = await apiClient.get(`${endpoint}`, {
        params: {
          _refresh: refreshToken ?? Date.now(), // cache buster
        },
      });

      setData(res.data ?? []);
    } catch (err) {
      console.error(`❌ Failed to fetch ${league} champions`, err);
      setError(`Failed to load ${league} championships`);
    } finally {
      setLoading(false);
    }
  }, [league, enabled, refreshToken]);

  useEffect(() => {
    fetchChampions();
  }, [fetchChampions]);

  return {
    data,
    loading,
    error,
    refetch: fetchChampions,
  };
}
