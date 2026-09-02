import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ForumPost,
  ForumPostUpdateResponse,
  ForumPostsResponse,
} from "types/forum";
import { apiClient } from "utils/apiClient";

type UseUserPostsOptions = {
  userId?: string | number | null;
  enabled?: boolean;
  limit?: number;
};

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

export function useUserPosts({
  userId,
  enabled = true,
  limit = 20,
}: UseUserPostsOptions = {}) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchingRef = useRef(false);

  const fetchUserPosts = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      if (!enabled || !userId) {
        return;
      }

      if (fetchingRef.current) {
        return;
      }

      fetchingRef.current = true;

      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await apiClient.get<ForumPostsResponse>(
          `/api/forum/user/${userId}`,
          {
            params: {
              page: pageNumber,
              limit,
            },
          },
        );

        const nextPosts = response.data.posts ?? [];
        const nextTotalPages = response.data.pagination?.totalPages ?? 1;

        setPosts((current) => {
          if (pageNumber === 1) {
            return nextPosts;
          }

          const existingIds = new Set(current.map((post) => String(post.id)));

          const uniqueNewPosts = nextPosts.filter(
            (post) => !existingIds.has(String(post.id)),
          );

          return [...current, ...uniqueNewPosts];
        });

        setPage(pageNumber);
        setTotalPages(nextTotalPages);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load user posts"));
      } finally {
        fetchingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [enabled, limit, userId],
  );

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setTotalPages(1);
    setError(null);

    if (!enabled || !userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    void fetchUserPosts(1);
  }, [enabled, fetchUserPosts, userId]);

  const refresh = useCallback(async () => {
    if (!userId) {
      return;
    }

    await fetchUserPosts(1, true);
  }, [fetchUserPosts, userId]);

  const loadMore = useCallback(async () => {
    if (
      !userId ||
      fetchingRef.current ||
      loading ||
      refreshing ||
      page >= totalPages
    ) {
      return;
    }

    await fetchUserPosts(page + 1);
  }, [fetchUserPosts, loading, page, refreshing, totalPages, userId]);

  const updatePost = useCallback((updatedPost: ForumPost) => {
    setPosts((current) =>
      current.map((post) =>
        String(post.id) === String(updatedPost.id)
          ? {
              ...post,
              ...updatedPost,
            }
          : post,
      ),
    );
  }, []);

  const removePost = useCallback((postId: string | number) => {
    setPosts((current) =>
      current.filter((post) => String(post.id) !== String(postId)),
    );
  }, []);

  const deletePost = useCallback(
    async (postId: string | number) => {
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
    async (postId: string | number, newText: string) => {
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
    posts,
    loading,
    refreshing,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    fetchUserPosts,
    refresh,
    loadMore,
    updatePost,
    removePost,
    deletePost,
    editPost,
  };
}
