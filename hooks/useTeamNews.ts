import axios from "axios";
import { useEffect, useState } from "react";
import sanitizeHtml from "sanitize-html";

export type NewsArticle = {
  id: string;
  title: string;
  source: string;
  author: string | null;
  description: string | null;
  url: string;
  thumbnail: string;
  publishedAt: string;
  content: string;
};

interface BackendArticle {
  source: { name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: BackendArticle[];
}

/* ---------------------------------------------------------
   1. Preserve inner text inside <a> tags
--------------------------------------------------------- */
function preserveAnchorText(html: string): string {
  return html.replace(/<a [^>]*>(.*?)<\/a>/gi, "$1");
}

/* ---------------------------------------------------------
   2. Convert sanitized HTML → readable plain text
--------------------------------------------------------- */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<hl2>/gi, "\n\n")      // Convert custom headers
    .replace(/<\/hl2>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")      // Paragraph spacing
    .replace(/<br\s*\/?>/gi, "\n")   // Line breaks
    .replace(/<\/?[^>]+(>|$)/g, "")  // Strip all remaining tags
    .replace(/\n{3,}/g, "\n\n")      // Collapse large newline blocks
    .trim();
}

/* ---------------------------------------------------------
   3. Sanitize + clean article content
--------------------------------------------------------- */
function sanitizeContent(rawContent: string | null): string {
  if (!rawContent) return "No content available.";

  // Keep anchor inner text before sanitation strips tags
  const noAnchors = preserveAnchorText(rawContent);

  const clean = sanitizeHtml(noAnchors, {
    allowedTags: ["p", "br", "b", "i", "em", "strong", "ul", "ol", "li", "blockquote"],
    allowedAttributes: {},
    textFilter: (text) => {
      return text
        .replace(/\[\+\d+\schars\]/g, "")
        .replace(/subscribe\s+now[^\.]*\.?/gi, "")
        .replace(/advertisement/gi, "")
        .replace(/read\s+more[^\.]*\.?/gi, "")
        .replace(/support\s+our\s+journalism[^\.]*\.?/gi, "")
        .replace(/follow\s+us\s+on\s+[^\.]*\.?/gi, "")
        .replace(/this\s+article\s+originally\s+appeared\s+on[^\.]*\.?/gi, "")
        .replace(/©\s*\d{4}[^\.]*\.?/gi, "")
        .replace(/all\s+rights\s+reserved\.?/gi, "")
        .replace(/tap\s+to\s+continue/gi, "")
        .replace(/photo\s+credit[^\.]*\.?/gi, "")
        .replace(/\.\.\.\s*$/, "");
    },
  });

  return htmlToPlainText(clean);
}

/* ---------------------------------------------------------
   4. Hook: Fetch team news from backend API
--------------------------------------------------------- */
export function useTeamNews(
  teamName?: string,
  league: "NBA" | "NFL" | "CFB" | "CBB" | "WCBB" | "MLB" = "NBA"
) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const refreshNews = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = "";

      if (league === "NBA") {
        endpoint = `${API_URL}/api/news`;
      } 
      else if (league === "NFL" || league === "CFB" || league === "CBB" || league === "WCBB" ) {
        if (!teamName) {
          setArticles([]);
          setLoading(false);
          return;
        }
        endpoint = `${API_URL}/api/news/${league.toLowerCase()}/${encodeURIComponent(teamName)}`;
      }

      const response = await axios.get<NewsApiResponse>(endpoint);
      const backendArticles = response.data.articles || [];

      const mapped: NewsArticle[] = backendArticles.map((article, index) => {
        const sanitizedContent = sanitizeContent(article.content);

        return {
          id: `${article.publishedAt}-${index}`,
          title: article.title,
          source: article.source.name,
          author: article.author,
          description: article.description,
          url: article.url,
          thumbnail: article.urlToImage ?? "",
          publishedAt: article.publishedAt,
          content: sanitizedContent,
        };
      });

      setArticles(mapped);
    } catch (err: any) {
      console.error("Failed to fetch team news:", err?.message || err);
      setError("Unable to load team news. Please try again later.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNews();
  }, [teamName, league]);

  return {
    articles,
    loading,
    error,
    refreshNews,
  };
}
