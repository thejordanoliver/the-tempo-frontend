// hooks/useLeagueForum.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Post } from "components/Forum/PostItem";
import { useCallback, useEffect, useState } from "react";
import { LeagueType } from "types/types";
import { apiClient } from "utils/apiClient";

export function useLeagueForum(league: LeagueType) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // FIX #2: read currentUserId from AsyncStorage (written by useAuth on login)
  //         rather than decoding it from an unverified JWT payload.
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }

      setError(null);

      try {
        // FIX #1: apiClient injects Authorization header and refreshes token
        //         automatically — no manual header needed here.
        const res = await apiClient.get(`/api/forum/league/${league}`, {
          params: { page: pageNumber, limit: 10 },
        });

        const data = res.data;

        setPosts((prev) =>
          pageNumber === 1 ? data.posts : [...prev, ...data.posts],
        );

        // FIX #8: track page locally from what was requested, not what the
        //         server echoes back, so loadMore always calls the right page.
        setPage(pageNumber);
      } catch (err: any) {
        console.error("Forum fetch error:", err);
        setError(
          err.response?.data?.error ?? err.message ?? "Error loading posts",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league],
    // FIX #6: removed `token` from the dependency array and the null-guard.
    //         apiClient handles auth — fetchPosts can be called at any time.
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
    if (!loading && !refreshing) {
      fetchPosts(page + 1);
    }
  };

  /*
  -----------------------------
  DELETE POST
  -----------------------------
  */
  const deletePost = async (postId: string) => {
    // FIX #4: rethrow so the caller can show an error state
    try {
      await apiClient.delete(`/api/forum/post/${postId}`);
      setPosts((prev) => prev.filter((p) => String(p.id) !== postId));
    } catch (err: any) {
      const message =
        err.response?.data?.error ?? err.message ?? "Failed to delete post";
      console.error("Delete post error:", message);
      throw new Error(message);
    }
  };

  /*
  -----------------------------
  EDIT POST
  -----------------------------
  */
  const editPost = async (postId: string, newText: string) => {
    // FIX #5: rethrow so the caller can show an error state
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
  };

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
  };
}
