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

type NewsState = {
  key: string;
  articles: NewsArticle[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
};

type Options = {
  url: string | null;
  limit: number;
  enabled: boolean;
  invalidMessage: string;
};

export function usePaginatedNews({
  url,
  limit,
  enabled,
  invalidMessage,
}: Options) {
  const key = JSON.stringify([url, limit, enabled, invalidMessage]);
  const initialState: NewsState = {
    key,
    articles: [],
    loading: enabled && url !== null,
    refreshing: false,
    loadingMore: false,
    hasMore: enabled && url !== null,
    error: enabled && url === null ? invalidMessage : null,
  };
  const [state, setState] = useState(initialState);
  const requestRef = useRef<AbortController | null>(null);

  if (state.key !== key) {
    setState(initialState);
  }

  const cancelRequest = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  const fetchNews = useCallback(
    async (mode: FetchMode, offset = 0) => {
      if (!enabled || url === null) return;
      if (mode === "loadMore" && requestRef.current) return;

      cancelRequest();
      const request = new AbortController();
      requestRef.current = request;

      try {
        const { data } = await apiClient.get<NewsResponse>(url, {
          params: { limit, offset },
          signal: request.signal,
        });
        if (request.signal.aborted) return;

        const nextArticles = data.articles ?? [];
        setState((previous) => {
          if (previous.key !== key) return previous;
          if (!data.success) {
            return {
              ...previous,
              articles: offset === 0 ? [] : previous.articles,
              error: "Failed to fetch news.",
            };
          }
          return {
            ...previous,
            articles:
              mode === "loadMore"
                ? [...previous.articles, ...nextArticles]
                : nextArticles,
            hasMore: data.hasMore ?? nextArticles.length === limit,
            error: null,
          };
        });
      } catch (error: unknown) {
        if (request.signal.aborted) return;

        const notFound = isAxiosError(error) && error.response?.status === 404;
        setState((previous) =>
          previous.key !== key
            ? previous
            : {
                ...previous,
                articles: offset === 0 ? [] : previous.articles,
                hasMore: notFound ? false : previous.hasMore,
                error: notFound
                  ? null
                  : error instanceof Error
                    ? error.message
                    : "An error occurred while fetching news.",
              },
        );
      } finally {
        if (!request.signal.aborted) {
          requestRef.current = null;
          setState((previous) =>
            previous.key !== key
              ? previous
              : {
                  ...previous,
                  loading: false,
                  refreshing: false,
                  loadingMore: false,
                },
          );
        }
      }
    },
    [cancelRequest, enabled, key, limit, url],
  );

  useEffect(() => {
    void fetchNews("initial");
    return cancelRequest;
  }, [cancelRequest, fetchNews]);

  const refresh = useCallback(
    async (mode?: "loadMore") => {
      if (!enabled || url === null) return;
      if (
        mode === "loadMore" &&
        (state.loading ||
          state.refreshing ||
          state.loadingMore ||
          !state.hasMore ||
          requestRef.current)
      )
        return;

      setState((previous) => ({
        ...previous,
        loading: false,
        refreshing: mode !== "loadMore",
        loadingMore: mode === "loadMore",
        error: null,
      }));
      await fetchNews(
        mode === "loadMore" ? "loadMore" : "refresh",
        mode === "loadMore" ? state.articles.length : 0,
      );
    },
    [
      enabled,
      fetchNews,
      state.articles.length,
      state.hasMore,
      state.loading,
      state.loadingMore,
      state.refreshing,
      url,
    ],
  );

  const current = state.key === key ? state : initialState;
  return {
    articles: current.articles,
    loading: current.loading,
    refreshing: current.refreshing,
    loadingMore: current.loadingMore,
    hasMore: current.hasMore,
    error: current.error,
    refresh,
  };
}
