import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export function useFootballRecruit(id?: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchRecruit() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get(`api/recruits/football/player/${id}`);

        if (!cancelled) {
          setData(res.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
              err?.message ||
              "Failed to fetch recruit",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRecruit();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}
