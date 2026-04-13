import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { apiClient, BASE_URL } from "utils/apiClient";

type PlayerSeasons = {
  playerId: number;
  name: string;
  position: string;
  positions: string[];
  careerStats: Record<string, any>;
  lastUpdated?: string;
};

type UseFootballPlayerStatsReturn = {
  data: PlayerSeasons | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useFootballPlayerStats(
  playerId: number,
): UseFootballPlayerStatsReturn {
  const [data, setData] = useState<PlayerSeasons | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get<PlayerSeasons>(
        `api/players/cfb/${playerId}/seasons`,
      );

      setData(res.data);
    } catch (err: any) {
      console.error("Failed to fetch player seasons:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch player seasons",
      );
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!playerId) return;

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get<PlayerSeasons>(
          `${BASE_URL}api/players/cfb/${playerId}/seasons`,
        );
        if (isMounted) {
          setData(res.data);
        }
        console.log("API RESPONSE:", res.data); // 👈 IMPORTANT
      } catch (err: any) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to fetch player seasons",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [playerId]);

  return { data, loading, error, refetch: fetchData };
}
