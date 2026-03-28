// hooks/useTeamForumPosts.ts
import axios from "axios";
import { useAuth } from "hooks/UserHooks/useAuth"; // adjust path if needed
import { useCallback, useEffect, useRef, useState } from "react";
import { LeagueType } from "types/types";

import { BASE_URL } from "utils/apiClient";
interface UseTeamForumPostsParams {
  teamId: string;
  league?: LeagueType;
}

interface Pagination {
  page: number;
  totalPages: number;
}

export function useTeamForumPosts({ teamId, league }: UseTeamForumPostsParams) {
  const { token, user, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Prevent concurrent fetch loops
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(
    async (pageNumber = 1) => {
      if (!teamId || !league) return;

      // Wait for token to be ready
      if (!token) return;

      // Prevent concurrent fetches
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      pageNumber === 1 ? setLoading(true) : setRefreshing(true);
      setError(null);

      try {
        const res = await axios.get(
          `${BASE_URL}/api/forum/team/${league}/${teamId}`,
          {
            params: { page: pageNumber, limit: 10 },
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const { posts: newPosts, pagination } = res.data;

        setPosts((prev) =>
          pageNumber === 1 ? newPosts : [...prev, ...newPosts],
        );
        setPage(pagination.page);
        setTotalPages(pagination.totalPages);
      } catch (err: any) {
        console.error("Failed to fetch team posts:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load forum posts",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [teamId, league, token],
  );

  // 🔄 Fetch posts when token is ready or team/league changes
  useEffect(() => {
    if (authLoading) return; // wait for auth to finish
    if (!token) return; // wait for token
    fetchPosts(1);
  }, [fetchPosts, token, authLoading]);

  // 🔄 Pull-to-refresh
  const refresh = useCallback(() => {
    if (!token) return;
    fetchPosts(1);
  }, [fetchPosts, token]);

  // ⬇️ Infinite scroll
  const loadMore = useCallback(() => {
    if (!token || loading || refreshing) return;
    if (page >= totalPages) return;
    fetchPosts(page + 1);
  }, [fetchPosts, token, page, totalPages, loading, refreshing]);

  // 🗑 Delete post
  const deletePost = useCallback(
    async (postId: string) => {
      if (!token) throw new Error("Not authenticated");

      await axios.delete(`${BASE_URL}/api/forum/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    [token],
  );

  // ✏️ Edit post
  const editPost = useCallback(
    async (postId: string, text: string) => {
      if (!token) throw new Error("Not authenticated");

      const res = await axios.put(
        `${BASE_URL}/api/forum/posts/${postId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? res.data.post : p)),
      );
    },
    [token],
  );

  return {
    posts,
    loading,
    refreshing,
    error,
    token,
    currentUserId: user?.id ?? null,
    refresh,
    loadMore,
    deletePost,
    editPost,
  };
}
