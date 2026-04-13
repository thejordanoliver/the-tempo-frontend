import axios from "axios";
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

type Options = {
  league: "CFB" | "CBB" | "WCBB" |  "NBA" | "NFL";
  enabled?: boolean;
  refreshToken?: number;
};

export function useChampionTeams({
  league,
  enabled = true,
  refreshToken,
}: Options) {
  const [data, setData] = useState<ChampionTeam[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    const res = await apiClient.get(
      `api/champions/${league}/teams`,
      {
        params: { _refresh: refreshToken ?? Date.now() },
      }
    );
    setData(res.data ?? []);
    setLoading(false);
  }, [league, enabled, refreshToken]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading };
}
