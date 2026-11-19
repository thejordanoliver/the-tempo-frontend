import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedPrediction } from "types/fanPredictions";
import type { ForumPost } from "types/forum";
import { apiClient } from "utils/apiClient";
import { onlyNewItems } from "utils/explore/forYouFeed";

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

export type ForYouPage = {
  articles: ForYouArticle[];
  posts: ForumPost[];
};

type ForYouResponse = {
  success: boolean;
  favoriteLeagues: string[];
  articles: ForYouArticle[];
  posts: ForumPost[];
  predictions?: FeedPrediction[];
  hasMoreArticles?: boolean;
  hasMorePosts?: boolean;
};

const PAGE_SIZE = 12;

type FeedState = {
  owner: number | null;
  preferencesKey: string;
  articles: ForYouArticle[];
  posts: ForumPost[];
  pages: ForYouPage[];
  predictions: FeedPrediction[];
  favoriteLeagues: string[];
  newsOffset: number;
  postsOffset: number;
  hasMoreArticles: boolean;
  hasMorePosts: boolean;
  loading: boolean;
  loadingMore: boolean;
  loaded: boolean;
  error: string | null;
  loadMoreError: string | null;
};

const emptyFeed = {
  articles: [] as ForYouArticle[],
  posts: [] as ForumPost[],
  pages: [] as ForYouPage[],
  predictions: [] as FeedPrediction[],
  favoriteLeagues: [] as string[],
  newsOffset: 0,
  postsOffset: 0,
  hasMoreArticles: false,
  hasMorePosts: false,
  loading: false,
  loadingMore: false,
  loaded: false,
  error: null as string | null,
  loadMoreError: null as string | null,
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to load your personalized feed";
}

export function useForYouFeed(
  enabled: boolean,
  userId: number | null,
  preferencesKey = "",
) {
  const [feed, setFeed] = useState<FeedState>({
    ...emptyFeed,
    owner: null,
    preferencesKey,
  });
  const request = useRef<AbortController | null>(null);
  const loadMoreInFlight = useRef(false);
  const belongsToUser =
    userId != null &&
    feed.owner === userId &&
    feed.preferencesKey === preferencesKey;
  const hasLoaded = belongsToUser && feed.loaded;

  const fetchFeed = useCallback(async () => {
    if (!enabled || userId == null) return;
    request.current?.abort();
    loadMoreInFlight.current = false;
    const controller = new AbortController();
    request.current = controller;

    setFeed((previous) => ({
      ...(previous.owner === userId &&
      previous.preferencesKey === preferencesKey
        ? previous
        : { ...emptyFeed }),
      owner: userId,
      preferencesKey,
      loading: true,
      loadingMore: false,
      error: null,
      loadMoreError: null,
    }));

    try {
      const { data } = await apiClient.get<ForYouResponse>(
        "/api/feed/for-you",
        {
          params: { newsLimit: PAGE_SIZE, postsLimit: PAGE_SIZE },
          signal: controller.signal,
        },
      );
      if (!data.success) throw new Error("Failed to load your personalized feed");
      if (controller.signal.aborted) return;

      const articles = data.articles ?? [];
      const posts = data.posts ?? [];
      setFeed({
        owner: userId,
        preferencesKey,
        articles,
        posts,
        pages: [{ articles, posts }],
        predictions: data.predictions ?? [],
        favoriteLeagues: data.favoriteLeagues ?? [],
        newsOffset: articles.length,
        postsOffset: posts.length,
        hasMoreArticles: data.hasMoreArticles ?? articles.length === PAGE_SIZE,
        hasMorePosts: data.hasMorePosts ?? posts.length === PAGE_SIZE,
        loading: false,
        loadingMore: false,
        loaded: true,
        error: null,
        loadMoreError: null,
      });
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      setFeed((previous) =>
        previous.owner !== userId || previous.preferencesKey !== preferencesKey
          ? previous
          : {
              ...previous,
              loading: false,
              error: getErrorMessage(error),
            },
      );
    } finally {
      if (request.current === controller) request.current = null;
    }
  }, [enabled, userId, preferencesKey]);

  const loadMore = useCallback(
    async (retry = false) => {
      if (
        !enabled ||
        userId == null ||
        !belongsToUser ||
        !feed.loaded ||
        feed.loading ||
        feed.loadingMore ||
        (!retry && feed.loadMoreError !== null) ||
        (!feed.hasMoreArticles && !feed.hasMorePosts) ||
        request.current ||
        loadMoreInFlight.current
      ) {
        return;
      }

      loadMoreInFlight.current = true;
      const controller = new AbortController();
      request.current = controller;
      setFeed((previous) => ({
        ...previous,
        loadingMore: true,
        loadMoreError: null,
      }));

      const newsLimit = feed.hasMoreArticles ? PAGE_SIZE : 0;
      const postsLimit = feed.hasMorePosts ? PAGE_SIZE : 0;

      try {
        const { data } = await apiClient.get<ForYouResponse>(
          "/api/feed/for-you",
          {
            params: {
              newsLimit,
              postsLimit,
              newsOffset: feed.newsOffset,
              postsOffset: feed.postsOffset,
            },
            signal: controller.signal,
          },
        );
        if (!data.success) throw new Error("Failed to load more feed items");
        if (controller.signal.aborted) return;

        setFeed((previous) => {
          if (
            previous.owner !== userId ||
            previous.preferencesKey !== preferencesKey
          ) return previous;

          const nextArticles = onlyNewItems(
            previous.articles,
            data.articles ?? [],
            (article) => article.keyId,
          );
          const nextPosts = onlyNewItems(
            previous.posts,
            data.posts ?? [],
            (post) => String(post.id),
          );
          const hasNewItems = nextArticles.length > 0 || nextPosts.length > 0;

          return {
            ...previous,
            articles: [...previous.articles, ...nextArticles],
            posts: [...previous.posts, ...nextPosts],
            pages: hasNewItems
              ? [...previous.pages, { articles: nextArticles, posts: nextPosts }]
              : previous.pages,
            newsOffset: previous.newsOffset + (data.articles?.length ?? 0),
            postsOffset: previous.postsOffset + (data.posts?.length ?? 0),
            hasMoreArticles:
              newsLimit > 0 &&
              nextArticles.length > 0 &&
              (data.hasMoreArticles ?? (data.articles?.length ?? 0) === PAGE_SIZE),
            hasMorePosts:
              postsLimit > 0 &&
              nextPosts.length > 0 &&
              (data.hasMorePosts ?? (data.posts?.length ?? 0) === PAGE_SIZE),
            loadingMore: false,
            loadMoreError: null,
          };
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setFeed((previous) =>
          previous.owner !== userId || previous.preferencesKey !== preferencesKey
            ? previous
            : {
                ...previous,
                loadingMore: false,
                loadMoreError: getErrorMessage(error),
              },
        );
      } finally {
        if (request.current === controller) request.current = null;
        loadMoreInFlight.current = false;
      }
    },
    [enabled, userId, belongsToUser, feed],
  );

  useEffect(() => {
    if (!enabled || hasLoaded || userId == null) return;
    const timeout = setTimeout(() => {
      void fetchFeed();
    }, 0);
    return () => clearTimeout(timeout);
  }, [enabled, fetchFeed, hasLoaded, userId]);

  useEffect(
    () => () => {
      request.current?.abort();
      loadMoreInFlight.current = false;
    },
    [userId, preferencesKey],
  );

  const current = belongsToUser ? feed : emptyFeed;
  return {
    ...current,
    loading: belongsToUser
      ? current.loading || (!current.loaded && current.error === null && enabled)
      : enabled && userId != null,
    error: belongsToUser ? current.error : null,
    hasMore: current.hasMoreArticles || current.hasMorePosts,
    refresh: fetchFeed,
    loadMore,
  };
}
