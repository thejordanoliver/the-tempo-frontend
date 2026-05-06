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

export function useLeaguesNews(limit: number = 10, league: LeagueType) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const res = await apiClient.get<NewsResponse>(
          `api/news/league/${league.toLowerCase()}`,
          {
            params: {
              limit,
            },
          },
        );

        if (res.data.success) {
          setArticles(res.data.articles);
        } else {
          setError("Failed to fetch news.");
        }
      } catch (err: any) {
        setError(err?.message || "An error occurred while fetching news.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [limit, league],
  );

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const refresh = useCallback(async () => {
    await fetchNews(true);
  }, [fetchNews]);

  return {
    articles,
    loading,
    refreshing,
    error,
    refresh,
  };
}