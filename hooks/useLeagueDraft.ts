import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { BASE_URL } from "utils/apiClient";

type League = "nba" | "nfl";

export function useDraft(league: League, year: number | string | undefined) {
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDraft = useCallback(async () => {
    if (!year || !league) return;

    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(
        `${BASE_URL}/api/draft/${league}/${year}`,
      );

      setDraft(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Draft fetch failed:", message);
      setError("Failed to load Draft data");
    } finally {
      setLoading(false);
    }
  }, [league, year]);

  useEffect(() => {
    fetchDraft();
  }, [fetchDraft]);

  return {
    draft,
    loading,
    error,
    refresh: fetchDraft,
  };
}
