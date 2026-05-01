import { useCallback, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

const LIMIT = 25;

export function useGiphySearch() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);

  const searchGifs = useCallback(async (query: string, reset = false) => {
    if (!query) return;

    try {
      setLoading(true);
      setError(null);

      if (reset) offsetRef.current = 0;
      const currentOffset = offsetRef.current;

      const res = await apiClient.get("api/giphy/search", {
        params: {
          q: query,
          limit: LIMIT,
          offset: currentOffset,
          rating: "g",
          lang: "en",
        },
      });

      const newData = res.data.data;
      const total = res.data.pagination.total_count;

      setData((prev) => {
        const merged = reset ? newData : [...prev, ...newData];
        const map = new Map(merged.map((g: any) => [g.id, g]));
        return Array.from(map.values());
      });

      const nextOffset = currentOffset + LIMIT;
      offsetRef.current = nextOffset;
      setHasMore(nextOffset < total);
    } catch (err: any) {
      setError(err.message || "Failed to fetch GIFs");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSearch = useCallback(() => {
    setData([]);
    offsetRef.current = 0;
    setHasMore(true);
  }, []);

  return { data, loading, error, hasMore, searchGifs, resetSearch };
}