import { Recruit } from "@/types/recruiting/players";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export function useRecruit(id: number, league: "CBB"| "CFB") {
  const [data, setData] = useState<Recruit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function fetchRecruit() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get<Recruit>(
          `api/recruits/${league}/player/${id}`,
          {
            signal: controller.signal,
          },
        );

        setData(res.data);
      } catch (err: any) {
        if (
          err?.name === "CanceledError" ||
          err?.code === "ERR_CANCELED" ||
          controller.signal.aborted
        ) {
          return;
        }

        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch recruit",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchRecruit();

    return () => {
      controller.abort();
    };
  }, [id, league]);

  return { data, loading, error };
}
