import { loadPostPolls } from "services/forumApi";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ForumPost,
  ForumPostUpdateResponse,
  ForumPostsResponse,
  UseBookmarkedPostsOptions,
} from "types/forum";
import { apiClient } from "utils/apiClient";
import {
  getForumBookmarksVersion,
  subscribeForumBookmarksChanged,
} from "services/forumBookmarkUpdates";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ error?: string; message?: string }>(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      fallback
    );
  }

  return error instanceof Error ? error.message : fallback;
};

export function useBookmarkedPosts({
  userId,
  enabled = true,
  limit = 10,
}: UseBookmarkedPostsOptions = {}) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const queryKey = `${userId ?? "me"}:${limit}`;
  const [dataQueryKey, setDataQueryKey] = useState(queryKey);
  const activeQueryKeyRef = useRef(queryKey);
  const loadedQueryKeyRef = useRef<string | null>(null);
  const loadedVersionRef = useRef<number | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const [bookmarksVersion, setBookmarksVersion] = useState(
    getForumBookmarksVersion,
  );

  const fetchBookmarks = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      if (!enabled) return;
      if (requestRef.current) return;

      const request = new AbortController();
      requestRef.current = request;
      const version = getForumBookmarksVersion();

      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const response = await apiClient.get<ForumPostsResponse>(
          "/api/forum/bookmarks",
          {
            signal: request.signal,
            params: {
              page: pageNumber,
              limit,
            },
          },
        );

        const nextPosts = await loadPostPolls(response.data.posts ?? []);
        if (request.signal.aborted) return;
        const nextTotalPages = response.data.pagination?.totalPages ?? 1;

        setPosts((current) => {
          if (pageNumber === 1) return nextPosts;
          const existingIds = new Set(current.map((post) => String(post.id)));
          return [
            ...current,
            ...nextPosts.filter((post) => !existingIds.has(String(post.id))),
          ];
        });
        setPage(pageNumber);
        setTotalPages(nextTotalPages);
        if (pageNumber === 1) {
          loadedQueryKeyRef.current = queryKey;
          loadedVersionRef.current = version;
        }
      } catch (err: unknown) {
        if (!request.signal.aborted)
          setError(getErrorMessage(err, "Failed to load bookmarks"));
      } finally {
        if (requestRef.current === request) {
          requestRef.current = null;
          setLoading(false);
          setRefreshing(false);
          // A bookmark changed while this request was in flight. Retry using
          // the new revision rather than marking the older response current.
          if (getForumBookmarksVersion() !== version)
            setBookmarksVersion((previous) => previous + 1);
        }
      }
    },
    [enabled, limit, queryKey],
  );

  useEffect(
    () =>
      subscribeForumBookmarksChanged(() => {
        setBookmarksVersion((previous) => previous + 1);
      }),
    [],
  );

  useEffect(
    () => () => {
      requestRef.current?.abort();
      requestRef.current = null;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (activeQueryKeyRef.current !== queryKey) {
        requestRef.current?.abort();
        requestRef.current = null;
        activeQueryKeyRef.current = queryKey;
        loadedQueryKeyRef.current = null;
        loadedVersionRef.current = null;
        setDataQueryKey(queryKey);
        setPosts([]);
        setPage(1);
        setTotalPages(1);
        setError(null);
        setLoading(false);
        setRefreshing(false);
      }

      if (!enabled) return;
      if (
        loadedQueryKeyRef.current === queryKey &&
        loadedVersionRef.current === getForumBookmarksVersion()
      ) {
        return;
      }

      void fetchBookmarks(1, loadedQueryKeyRef.current === queryKey);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, fetchBookmarks, queryKey, bookmarksVersion]);

  const refresh = useCallback(() => {
    fetchBookmarks(1, true);
  }, [fetchBookmarks]);

  const loadMore = useCallback(() => {
    if (!loading && !refreshing && page < totalPages) {
      fetchBookmarks(page + 1);
    }
  }, [fetchBookmarks, loading, page, refreshing, totalPages]);

  const updatePost = useCallback((updatedPost: ForumPost) => {
    setPosts((current) =>
      current.map((post) =>
        String(post.id) === String(updatedPost.id)
          ? { ...post, ...updatedPost }
          : post,
      ),
    );
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((current) =>
      current.filter((post) => String(post.id) !== String(postId)),
    );
  }, []);

  const deletePost = useCallback(
    async (postId: string) => {
      try {
        await apiClient.delete(`/api/forum/post/${postId}`);
        removePost(postId);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to delete post"));
      }
    },
    [removePost],
  );

  const editPost = useCallback(
    async (postId: string, newText: string) => {
      try {
        const response = await apiClient.patch<ForumPostUpdateResponse>(
          `/api/forum/post/${postId}`,
          {
            text: newText,
          },
        );

        if (response.data.post) {
          updatePost(response.data.post);
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to edit post"));
      }
    },
    [updatePost],
  );

  return {
    posts: dataQueryKey === queryKey ? posts : [],
    loading: enabled && (dataQueryKey !== queryKey || loading),
    refreshing: dataQueryKey === queryKey && refreshing,
    error: dataQueryKey === queryKey ? error : null,
    hasMore: dataQueryKey === queryKey && page < totalPages,
    fetchBookmarks,
    refresh,
    loadMore,
    updatePost,
    removePost,
    deletePost,
    editPost,
  };
}
