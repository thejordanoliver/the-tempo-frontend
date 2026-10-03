import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface NewsArticle {
  id: number;
  keyId: string;
  headline: string;
  description: string;
  published: string;
  image: string;
  link: string;
  lastModified: string;
  byline: string;
}

export interface NewsResponse {
  success: boolean;
  count: number;
  articles: NewsArticle[];
  hasMore?: boolean;
}

type FetchMode = "initial" | "refresh" | "loadMore";

type UseLeaguesNewsOptions = {
  enabled?: boolean;
};

export function useLeaguesNews(
  league: string,
  limit: number = 10,
  { enabled = true }: UseLeaguesNewsOptions = {},
) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [refreshing, setRefreshing] = useState<boolean>(false);
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

      if (!league) {
        activeRequestRef.current = null;
        setArticles([]);
        setError("League is required.");
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
          `/api/news/league/${String(league).toLowerCase()}`,
          {
            params: { limit, offset },
          },
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

        if (isAxiosError(err) && err.response?.status === 404) {
          if (offset === 0) setArticles([]);
          setHasMore(false);
          setError(null);
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching news.";

        if (offset === 0) setArticles([]);
        setError(message);
      } finally {
        if (requestId !== requestIdRef.current) return;

        activeRequestRef.current = null;
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [enabled, league, limit],
  );

  useEffect(() => {
    // Entering the new league's initial state before awaiting the request is
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
