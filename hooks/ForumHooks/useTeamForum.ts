// hooks/useTeamForum.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Post } from "components/Forum/PostItem";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export function useTeamForum(teamId: string, league?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Read userId from AsyncStorage — written by useAuth on login
  useEffect(() => {
    AsyncStorage.getItem("userId")
      .then((id) => setCurrentUserId(id ? parseInt(id, 10) : null))
      .catch(() => setCurrentUserId(null));
  }, []);

  /*
  -----------------------------
  FETCH POSTS
  -----------------------------
  */
  const fetchPosts = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      if (!teamId || !league) return;

      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }

      setError(null);

      try {
        const res = await apiClient.get(
          `/api/forum/team/${league}/${teamId}`,
          { params: { page: pageNumber, limit: 10 } },
        );

        const data = res.data;

        setPosts((prev) =>
          pageNumber === 1 ? data.posts : [...prev, ...data.posts],
        );

        // Track page locally — don't trust server echo
        setPage(pageNumber);
        setTotalPages(data.pagination.totalPages);
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

  /*
  -----------------------------
  INITIAL FETCH
  -----------------------------
  */
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  /*
  -----------------------------
  REFRESH
  -----------------------------
  */
  const refresh = () => {
    fetchPosts(1, true);
  };

  /*
  -----------------------------
  LOAD MORE (PAGINATION)
  -----------------------------
  */
  const loadMore = () => {
    if (page < totalPages && !loading && !refreshing) {
      fetchPosts(page + 1);
    }
  };

  /*
  -----------------------------
  DELETE POST
  -----------------------------
  */
  const deletePost = useCallback(async (postId: string) => {
    try {
      await apiClient.delete(`/api/forum/post/${postId}`);
      setPosts((prev) => prev.filter((p) => String(p.id) !== postId));
    } catch (err: any) {
      const message =
        err.response?.data?.error ?? err.message ?? "Failed to delete post";
      console.error("Delete post error:", message);
      throw new Error(message);
    }
  }, []);

  /*
  -----------------------------
  EDIT POST
  -----------------------------
  */
  const editPost = useCallback(async (postId: string, newText: string) => {
    try {
      const res = await apiClient.patch(`/api/forum/post/${postId}`, {
        text: newText,
      });
      setPosts((prev) =>
        prev.map((p) => (String(p.id) === postId ? res.data.post : p)),
      );
    } catch (err: any) {
      const message =
        err.response?.data?.error ?? err.message ?? "Failed to edit post";
      console.error("Edit post error:", message);
      throw new Error(message);
    }
  }, []);

  /*
  -----------------------------
  PREPEND POST (optimistic after create)
  -----------------------------
  */
  const prependPost = useCallback((newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  /*
  -----------------------------
  RETURN HOOK DATA
  -----------------------------
  */
  return {
    posts,
    loading,
    refreshing,
    error,
    currentUserId,
    fetchPosts,
    refresh,
    loadMore,
    deletePost,
    editPost,
    prependPost,
  };
}