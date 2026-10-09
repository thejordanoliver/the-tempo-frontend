import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedPrediction } from "types/fanPredictions";
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
  predictions?: FeedPrediction[];
};

const emptyFeed = { articles: [] as ForYouArticle[], posts: [] as ForumPost[], predictions: [] as FeedPrediction[], favoriteLeagues: [] as string[] };

export function useForYouFeed(enabled: boolean, userId: number | null, preferencesKey = "") {
  const [feed, setFeed] = useState({ ...emptyFeed, owner: null as number | null, preferencesKey, loading: false, loaded: false, error: null as string | null });
  const request = useRef<AbortController | null>(null);
  const belongsToUser = userId != null && feed.owner === userId && feed.preferencesKey === preferencesKey;
  const hasLoaded = belongsToUser && feed.loaded;

  const fetchFeed = useCallback(async () => {
    if (userId == null) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setFeed(previous => ({ ...(previous.owner === userId && previous.preferencesKey === preferencesKey ? previous : { ...emptyFeed, loaded: false }), owner: userId, preferencesKey, loading: true, error: null }));
    try {
      const { data } = await apiClient.get<ForYouResponse>("/api/feed/for-you", {
        params: { newsLimit: 20, postsLimit: 20 }, signal: controller.signal,
      });
      if (!data.success) throw new Error("Failed to load your personalized feed");
      if (controller.signal.aborted) return;
      setFeed({ owner: userId, preferencesKey, articles: data.articles ?? [], posts: data.posts ?? [], predictions: data.predictions ?? [],
        favoriteLeagues: data.favoriteLeagues ?? [], loading: false, loaded: true, error: null });
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      setFeed(previous => ({ ...previous, loading: false, error: error instanceof Error ? error.message : "Failed to load your personalized feed" }));
    }
  }, [userId, preferencesKey]);

  useEffect(() => {
    if (!enabled || hasLoaded || userId == null) return;
    const timeout = setTimeout(() => { void fetchFeed(); }, 0);
    return () => clearTimeout(timeout);
  }, [enabled, fetchFeed, hasLoaded, userId]);

  useEffect(() => () => { request.current?.abort(); }, [userId]);

  return {
    ...(belongsToUser ? feed : emptyFeed),
    loading: belongsToUser ? feed.loading || (!feed.loaded && feed.error === null && enabled) : enabled && userId != null,
    error: belongsToUser ? feed.error : null,
    refresh: fetchFeed,
  };
}
