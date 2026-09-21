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
}

export function useAllNews(limit: number = 10) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  // 🔄 reusable fetch function
  const fetchNews = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<NewsResponse>("api/news/all", {
        params: { limit },
      });

      if (requestId !== requestIdRef.current) return;

      if (res.data.success) {
        setArticles(res.data.articles);
      } else {
        setError("Failed to fetch news.");
      }
    } catch (err: any) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "An error occurred while fetching news.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [limit]);

  // initial load
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchNews();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchNews]);

  return {
    articles,
    loading,
    error,
    refresh: fetchNews, // ✅ exposed refresh function
  };
}
