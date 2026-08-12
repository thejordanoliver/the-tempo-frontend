import { isAxiosError } from "axios";
import type { Post } from "components/Forum/PostItem";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "utils/apiClient";

type UseBookmarkedPostsOptions = {
  enabled?: boolean;
  limit?: number;
};

type BookmarkedPostsResponse = {
  posts?: Post[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
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

export function useBookmarkedPosts({
  enabled = true,
  limit = 10,
}: UseBookmarkedPostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fetchingRef = useRef(false);

  const fetchBookmarks = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      if (!enabled) return;
      if (fetchingRef.current) return;

      fetchingRef.current = true;

      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const response = await apiClient.get<BookmarkedPostsResponse>(
          "/api/forum/bookmarks",
          {
            params: {
              page: pageNumber,
              limit,
            },
          },
        );

        const nextPosts = response.data.posts ?? [];
        const nextTotalPages = response.data.pagination?.totalPages ?? 1;

        setPosts((current) =>
          pageNumber === 1 ? nextPosts : [...current, ...nextPosts],
        );
        setPage(pageNumber);
        setTotalPages(nextTotalPages);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load bookmarks"));
      } finally {
        fetchingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [enabled, limit],
  );

  useEffect(() => {
    if (!enabled) {
      setPosts([]);
      setPage(1);
      setTotalPages(1);
      setError(null);
      return;
    }

    fetchBookmarks(1);
  }, [enabled, fetchBookmarks]);

  const refresh = useCallback(() => {
    fetchBookmarks(1, true);
  }, [fetchBookmarks]);

  const loadMore = useCallback(() => {
    if (!loading && !refreshing && page < totalPages) {
      fetchBookmarks(page + 1);
    }
  }, [fetchBookmarks, loading, page, refreshing, totalPages]);

  const updatePost = useCallback((updatedPost: Post) => {
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
        const response = await apiClient.patch<{ post?: Post }>(
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
    hasMore: page < totalPages,
    fetchBookmarks,
    refresh,
    loadMore,
    updatePost,
    removePost,
    deletePost,
    editPost,
  };
}
