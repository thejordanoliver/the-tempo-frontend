import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";
import type { NewsArticle, NewsResponse } from "./useLeaguesNews";

type FetchMode = "initial" | "refresh" | "loadMore";

export function useTeamNews(
  league: string,
  teamId: number,
  limit: number = 10,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const activeRequestRef = useRef<FetchMode | null>(null);

  const fetchNews = useCallback(
    async (mode: FetchMode, offset = 0) => {
      if (mode === "loadMore" && activeRequestRef.current !== null) return;

      const requestId = ++requestIdRef.current;
      activeRequestRef.current = mode;

      if (!enabled) {
        activeRequestRef.current = null;
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        setHasMore(false);
        setError(null);
        return;
      }
      if (!league || !Number.isInteger(teamId) || teamId <= 0) {
        activeRequestRef.current = null;
        setArticles([]);
        setError("A valid team is required.");
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        setHasMore(false);
        return;
      }

      setLoading(mode === "initial");
      setRefreshing(mode === "refresh");
      setLoadingMore(mode === "loadMore");
      if (mode === "initial") setHasMore(true);
      setError(null);

      try {
        const { data } = await apiClient.get<NewsResponse>(
          `/api/news/team/${String(league).toLowerCase()}/${teamId}`,
          { params: { limit, offset } },
        );

        if (requestId !== requestIdRef.current) return;

        if (!data.success) {
          if (offset === 0) setArticles([]);
          setError("Failed to fetch news.");
          return;
        }

        const nextArticles = data.articles ?? [];
        setArticles((current) =>
          mode === "loadMore" ? [...current, ...nextArticles] : nextArticles,
        );
        setHasMore(data.hasMore ?? nextArticles.length === limit);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;

        if (offset === 0) setArticles([]);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching news.",
        );
      } finally {
        if (requestId !== requestIdRef.current) return;

        activeRequestRef.current = null;
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [enabled, league, limit, teamId],
  );

  useEffect(() => {
    // Entering the new team's initial state before awaiting the request is
    // intentional; deferring this call causes the empty-state loading flash.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNews("initial");

    return () => {
      requestIdRef.current += 1;
      activeRequestRef.current = null;
    };
  }, [fetchNews]);

  const refresh = useCallback(
    async (mode?: "loadMore") => {
      if (mode === "loadMore") {
        if (loading || refreshing || loadingMore || !hasMore) return;
        await fetchNews("loadMore", articles.length);
        return;
      }
      await fetchNews("refresh", 0);
    },
    [articles.length, fetchNews, hasMore, loading, loadingMore, refreshing],
  );

  return {
    articles,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    refresh,
  };
}
