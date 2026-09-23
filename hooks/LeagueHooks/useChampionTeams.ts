import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type ChampionTeam = {
  team: {
    id: number;
    code: string;
    name: string;
    full_name?: string;
    color?: string;
  };
  total_championships: number;
};

type ChampionTeamsResponse = {
  champions?: ChampionTeam[];
  top_champions?: ChampionTeam[];
};

type Options = {
  league: string;
  enabled?: boolean;
  refreshToken?: number;
};

export function useChampionTeams({
  league,
  enabled = true,
  refreshToken,
}: Options) {
  const [data, setData] = useState<ChampionTeam[]>([]);
  const [champions, setChampions] = useState<ChampionTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get<ChampionTeamsResponse>(
        `api/champions/${league}/teams`,
        {
          params: { _refresh: refreshToken ?? Date.now() },
        },
      );
      const rankedTeams = Array.isArray(res.data?.champions)
        ? res.data.champions
        : [];
      const topTeams = Array.isArray(res.data?.top_champions)
        ? res.data.top_champions
        : rankedTeams.slice(0, 3);

      setChampions(rankedTeams);
      setData(topTeams);
    } catch (err) {
      console.error(`Failed to fetch ${league} champion teams`, err);
      setChampions([]);
      setData([]);
      setError(`Failed to load ${league} champion teams`);
    } finally {
      setLoading(false);
    }
  }, [league, enabled, refreshToken]);

  useEffect(() => {
    void Promise.resolve().then(() => fetch());
  }, [fetch]);

  return { data, champions, loading, error, refetch: fetch };
}
