import { Recruit } from "@/types/recruiting/recruits";
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";
import { normalizeRecruit } from "utils/recruiting/recruits";

export function useRecruit(id: number, league: "mcbb" | "cfb") {
  const [data, setData] = useState<Recruit | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    if (!id) {
      void Promise.resolve().then(() => {
        if (controller.signal.aborted) return;
        setData(null);
        setLoading(false);
        setError(null);
      });
      return () => controller.abort();
    }

    async function fetchRecruit() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      try {
        setData(null);
        setLoading(true);
        setError(null);

        const res = await apiClient.get<Recruit>(
          `api/recruits/${league}/player/${id}`,
          {
            signal: controller.signal,
          },
        );

        if (!controller.signal.aborted) setData(normalizeRecruit(res.data));
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

    void fetchRecruit();

    return () => {
      controller.abort();
    };
  }, [id, league]);

  return { data, loading, error };
}
