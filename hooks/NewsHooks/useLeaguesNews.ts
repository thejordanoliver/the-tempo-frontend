import { useCallback, useEffect, useState } from "react";
import { LeagueType } from "types/types";
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
}

export function useLeaguesNews(league: LeagueType, limit: number = 10) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(
    async (isRefresh = false) => {
      if (!league) {
        setArticles([]);
        setError("League is required.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const { data } = await apiClient.get<NewsResponse>(
          `/api/news/league/${String(league).toLowerCase()}`,
          {
            params: { limit },
          },
        );

        if (!data.success) {
          setArticles([]);
          setError("Failed to fetch news.");
          return;
        }

        setArticles(data.articles ?? []);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "An error occurred while fetching news.";

        setArticles([]);
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, limit],
  );

  useEffect(() => {
    fetchNews(false);
  }, [fetchNews]);

  const refresh = useCallback(() => {
    fetchNews(true);
  }, [fetchNews]);

  return {
    articles,
    loading,
    refreshing,
    error,
    refresh,
  };
}