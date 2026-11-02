import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type ChampionSeason = {
  id: number;
  season: string | number;
  selector?: string | null;
  era?: string | null;
  league?: string | null;
  team: {
    id: number;
    code: string;
    name: string;
    shortName?: string;
    color?: string;
    logo?: string;
    logoDark?: string;
  } | null;
  notes: string;
};

type Options = {
  enabled?: boolean;
  refreshToken?: number;
  league: string;
  season?: string;
};

export function useChampions({
  league,
  enabled = true,
  refreshToken,
  season,
}: Options) {
  const [data, setData] = useState<ChampionSeason[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChampions = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const endpoint = `api/champions/${league}/seasons`;

      const res = await apiClient.get<ChampionSeason[]>(endpoint, {
        params: {
          ...(season ? { season } : {}),
          _refresh: refreshToken ?? Date.now(), // cache buster
        },
      });

      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(`❌ Failed to fetch ${league} champions`, err);
      setError(`Failed to load ${league} championships`);
    } finally {
      setLoading(false);
    }
  }, [league, enabled, refreshToken, season]);

  useEffect(() => {
    void Promise.resolve().then(() => fetchChampions());
  }, [fetchChampions]);

  return {
    data,
    loading,
    error,
    refetch: fetchChampions,
  };
}
