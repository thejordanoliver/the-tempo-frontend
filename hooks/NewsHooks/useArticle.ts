import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

export interface ArticleImage {
  url: string;
  alt?: string;
}

export interface ArticleVideo {
  title: string;
  description: string;
  url: string | null;
  thumbnail?: string;
  duration: number;
}

export interface Article {
  id: number;
  headline: string;
  description: string;
  published: string;
  images: ArticleImage[];
  videos: ArticleVideo[];
  story: string; // HTML
  byline: string;
  keywords: string[];
  caption: string;
  source: string;
  type: "Story" | "Media" | "HeadlineNews" | "Preview";
}

interface ArticleResponse {
  success: boolean;
  article: Article;
}

export function useArticle(articleId: number | string) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchArticle = useCallback(async () => {
    if (!articleId) return;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<ArticleResponse>(
        `api/news/article/${articleId}`,
      );

      if (requestId !== requestIdRef.current) return;

      if (res.data.success) {
        setArticle(res.data.article);
      } else {
        setError("Failed to fetch article");
      }
    } catch (err: any) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "Error fetching article");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void fetchArticle();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchArticle]);

  return {
    article,
    loading,
    error,
    refetch: fetchArticle, // 🔥 nice bonus
  };
}
