// hooks/useForum.ts
import { useBadgeNotifications } from "@/hooks/ForumHooks/useBadgeNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import type {
  ForumPost,
  ForumPostUpdateResponse,
  ForumPostsResponse,
  UseForumOptions,
} from "types/forum";
import { apiClient } from "utils/apiClient";

export function useForum({ teamId, league }: UseForumOptions) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const { requestBadgeDataRefresh } = useBadgeNotifications();

  useEffect(() => {
    AsyncStorage.getItem("userId")
      .then((id) => setCurrentUserId(id ? parseInt(id, 10) : null))
      .catch(() => setCurrentUserId(null));
  }, []);

  const fetchPosts = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      if (!league) return;

      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }

      setError(null);

      try {
        const endpoint = teamId
          ? `/api/forum/team/${league}/${teamId}`
          : `/api/forum/league/${league}`;

        const res = await apiClient.get<ForumPostsResponse>(endpoint, {
          params: { page: pageNumber, limit: 10 },
        });

        const data = res.data;
        const nextPosts = Array.isArray(data?.posts) ? data.posts : [];
        const nextTotalPages = Number(data?.pagination?.totalPages) || 1;

        setPosts((prev) =>
          pageNumber === 1 ? nextPosts : [...prev, ...nextPosts],
        );

        setPage(pageNumber);
        setTotalPages(nextTotalPages);
      } catch (err: any) {
        console.error("Fetch posts error:", err);
        setError(
          err.response?.data?.error ?? err.message ?? "Error loading posts",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [teamId, league],
  );

  const refresh = useCallback(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading && !refreshing) {
      fetchPosts(page + 1);
    }
  }, [page, totalPages, loading, refreshing, fetchPosts]);

  const deletePost = useCallback(
    async (postId: string) => {
      try {
        await apiClient.delete(`/api/forum/post/${postId}`);
        setPosts((prev) => prev.filter((p) => String(p.id) !== postId));
        requestBadgeDataRefresh();
      } catch (err: any) {
        const message =
          err.response?.data?.error ?? err.message ?? "Failed to delete post";
        console.error("Delete post error:", message);
        throw new Error(message);
      }
    },
    [requestBadgeDataRefresh],
  );

  const editPost = useCallback(async (postId: string, newText: string) => {
    try {
      const res = await apiClient.patch<ForumPostUpdateResponse>(
        `/api/forum/post/${postId}`,
        {
          text: newText,
        },
      );
      setPosts((prev) =>
        prev.map((p) =>
          String(p.id) === postId && res.data.post ? res.data.post : p,
        ),
      );
    } catch (err: any) {
      const message =
        err.response?.data?.error ?? err.message ?? "Failed to edit post";
      console.error("Edit post error:", message);
      throw new Error(message);
    }
  }, []);

  const prependPost = useCallback((newPost: ForumPost) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const updatePost = useCallback((updatedPost: ForumPost) => {
    setPosts((prev) =>
      prev.map((post) =>
        String(post.id) === String(updatedPost.id)
          ? { ...post, ...updatedPost }
          : post,
      ),
    );
  }, []);

  return {
    posts,
    loading,
    refreshing,
    error,
    currentUserId,
    hasMore: page < totalPages,
    fetchPosts,
    refresh,
    loadMore,
    deletePost,
    editPost,
    prependPost,
    updatePost,
  };
}
