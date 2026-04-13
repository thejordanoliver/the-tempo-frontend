import { useEffect, useState } from "react";
import { MMAFight } from "types/mma";
import { apiClient } from "utils/apiClient";

export function useWeeklyFights() {
  const [fights, setFights] = useState<MMAFight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFights = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const res = await apiClient.get(`api/fights/mma/weekly`);

      const rawFights: MMAFight[] = res.data?.games ?? [];
      setFights(rawFights);
    } catch (err: any) {
      console.error("[useWeeklyFights] error:", err);
      const message = err?.message || "Failed to load fights";
      setError(new Error(message));
      setFights([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshFights = () => fetchFights(true);

  useEffect(() => {
    fetchFights();
  }, []);

  return { fights, loading, refreshing, error, refreshFights };
}
