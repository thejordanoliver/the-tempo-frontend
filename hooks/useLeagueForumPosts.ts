// hooks/useLeagueForumPosts.ts
import axios from "axios";
import { useAuth } from "hooks/useAuth"; // adjust if your auth hook path differs
import { useCallback, useEffect, useRef, useState } from "react";
import { LeagueType } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

interface useLeagueForumPostsParams {
  teamId: string;
  league?: LeagueType;
}

export function useLeagueForumPosts({  league }: useLeagueForumPostsParams) {
  const { token, user } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Prevent double-fetch loops
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(
    async (pageNumber = 1) => {
      if ( !league) return;

      // ⛔ Token still loading → do nothing
      if (token === undefined) return;

      // ⛔ Prevent concurrent fetch loops
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      pageNumber === 1 ? setLoading(true) : setRefreshing(true);
      setError(null);

      try {
        const res = await axios.get(
          `${BASE_URL}/api/forum/league/${league}`,
          {
            params: { page: pageNumber, limit: 10 },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );

        const { posts: newPosts, pagination } = res.data;

        setPosts((prev) =>
          pageNumber === 1 ? newPosts : [...prev, ...newPosts]
        );

        setPage(pagination.page);
        setTotalPages(pagination.totalPages);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load forum posts"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [ league, token]
  );

  // 🔁 Initial load
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // 🔄 Pull to refresh
  const refresh = useCallback(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // ⬇️ Infinite scroll
  const loadMore = useCallback(() => {
    if (loading || refreshing) return;
    if (page >= totalPages) return;
    fetchPosts(page + 1);
  }, [fetchPosts, page, totalPages, loading, refreshing]);

  // 🗑 Delete post
  const deletePost = useCallback(
    async (postId: string) => {
      if (!token) throw new Error("Not authenticated");

      await axios.delete(`${BASE_URL}/api/forum/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
    [token]
  );

  // ✏️ Edit post
  const editPost = useCallback(
    async (postId: string, text: string) => {
      if (!token) throw new Error("Not authenticated");

      const res = await axios.put(
        `${BASE_URL}/api/forum/posts/${postId}`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? res.data.post : p))
      );
    },
    [token]
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
