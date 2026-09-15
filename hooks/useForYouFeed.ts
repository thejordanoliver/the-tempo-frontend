import { useCallback, useEffect, useState } from "react";
import type { ForumPost } from "types/forum";
import { apiClient } from "utils/apiClient";

export type ForYouArticle = {
  id: number;
  keyId: string;
  headline: string;
  description: string;
  published: string;
  image: string;
  link: string;
  lastModified: string;
  byline: string;
  sport?: string;
};

type ForYouResponse = {
  success: boolean;
  favoriteLeagues: string[];
  articles: ForYouArticle[];
  posts: ForumPost[];
};

export function useForYouFeed(enabled: boolean) {
  const [articles, setArticles] = useState<ForYouArticle[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<ForYouResponse>(
        "/api/feed/for-you",
        {
          params: { newsLimit: 20, postsLimit: 20 },
        },
      );

      if (!data.success) {
        throw new Error("Failed to load your personalized feed");
      }

      setArticles(data.articles ?? []);
      setPosts(data.posts ?? []);
      setFavoriteLeagues(data.favoriteLeagues ?? []);
      setHasLoaded(true);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Failed to load your personalized feed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || hasLoaded) return;
    void fetchFeed();
  }, [enabled, fetchFeed, hasLoaded]);

  return {
    articles,
    posts,
    favoriteLeagues,
    loading,
    error,
    refresh: fetchFeed,
  };
}
