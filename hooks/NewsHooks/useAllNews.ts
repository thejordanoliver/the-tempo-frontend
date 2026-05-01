import { useCallback, useEffect, useState } from "react";
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

export function useAllNews(limit: number = 10) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 reusable fetch function
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<NewsResponse>("api/news/all", {
        params: { limit },
      });

      if (res.data.success) {
        setArticles(res.data.articles);
      } else {
        setError("Failed to fetch news.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching news.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // initial load
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    articles,
    loading,
    error,
    refresh: fetchNews, // ✅ exposed refresh function
  };
}