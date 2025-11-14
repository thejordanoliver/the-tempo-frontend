import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import type { NewsItem } from "types/types";



export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeThumbnail = (article: any): string => {
    // Try multiple known thumbnail fields
    const thumb =
      article.urlToImage ||
      article.thumbnail ||
      article.image ||
      article?.media?.thumbnail?.url ||
      article?.media?.content?.url ||
      article?.enclosure?.url ||
      "";
    return thumb.startsWith("http") ? thumb : "";
  };

  const fetchAllNews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/news/all`);
      const articles = res.data.articles || [];

      const formatted = articles.map((a: any, index: number) => ({
        id: `${a.publishedAt || a.date || "unknown"}-${index}`,
        title: a.title || "Untitled",
        source:
          typeof a.source === "string"
            ? a.source
            : a.source?.name || "Unknown Source",
        url: a.url || "",
        thumbnail: normalizeThumbnail(a),
        content: a.content || a.description || "",
        publishedAt: a.publishedAt || a.date,
        date: a.publishedAt || a.date,
      }));

      setNews(formatted);
      setError(null);
    } catch (err: any) {
      console.error("All news fetch error:", err.message);
      setError("Failed to load all sports news.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllNews();
  }, [fetchAllNews]);

  return { news, loading, error, refresh: fetchAllNews };
}
