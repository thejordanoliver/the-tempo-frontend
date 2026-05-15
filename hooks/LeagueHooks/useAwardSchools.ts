import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type AwardSchool = {
  team: {
    id: number;
    code: string;
    name: string;
    conference: string;
    color?: string;
  };
  total_awards: number;
  unique_players: number;
};
type AwardSchoolsLeague = "cfb" | "cbb" | "wcbb";

type Options = {
  league?: AwardSchoolsLeague;
  category?: string;
  enabled?: boolean;
  refreshToken?: number;
};

export function useAwardSchools(options: Options = {}) {
  const {
    league = "cfb", // default stays CFB
    category = "all",
    enabled = true,
    refreshToken,
  } = options;

  const [data, setData] = useState<AwardSchool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get(`api/${league}/award-seasons/schools`, {
        params: {
          type: category,
          _refresh: refreshToken ?? Date.now(),
        },
      });

      setData(res.data ?? []);
    } catch (err) {
      console.error(
        `❌ Failed to fetch ${league.toUpperCase()} award schools`,
        err,
      );
      setError("Failed to load award schools");
    } finally {
      setLoading(false);
    }
  }, [league, category, enabled, refreshToken]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return {
    data,
    loading,
    error,
    refetch: fetchSchools,
  };
}
