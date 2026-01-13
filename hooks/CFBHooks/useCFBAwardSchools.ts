import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export type CFBAwardSchool = {
  team: {
    id: number;
    code: string
    name: string;
    conference: string;
    color?: string;
  };
  total_awards: number;
  unique_players: number;
};

type Options = {
  category?: string; // heisman, all, etc.
  enabled?: boolean;
  refreshToken?: number;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useCFBAwardSchools(options: Options = {}) {
  const {
    category = "all",
    enabled = true,
    refreshToken,
  } = options;

  const [data, setData] = useState<CFBAwardSchool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${API_URL}/api/cfb/award-seasons/schools`,
        {
          params: {
            type: category,
            _refresh: refreshToken ?? Date.now(),
          },
        }
      );

      setData(res.data ?? []);
    } catch (err) {
      console.error("❌ Failed to fetch CFB award schools", err);
      setError("Failed to load award schools");
    } finally {
      setLoading(false);
    }
  }, [category, enabled, refreshToken]);

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
