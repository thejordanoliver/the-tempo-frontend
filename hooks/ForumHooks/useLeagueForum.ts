import axios from "axios";
import { Post } from "components/Forum/PostItem";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import { LeagueType } from "types/types";
import { getAccessToken } from "utils/authStorage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export function useLeagueForum(league: LeagueType) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  /*
  -----------------------------
  LOAD TOKEN + DECODE USER
  -----------------------------
  */
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await getAccessToken();

        if (storedToken) {
          setToken(storedToken);

          const decoded: { id: number } = jwtDecode(storedToken);
          setCurrentUserId(decoded.id);
        }
      } catch (err) {
        console.error("Error loading token:", err);
      }
    };

    loadToken();
  }, []);

  /*
  -----------------------------
  FETCH POSTS
  -----------------------------
  */
  const fetchPosts = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      if (!token) return; // 🔑 prevents request before token loads

      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }

      setError(null);

      try {
        const res = await axios.get(
          `${BASE_URL}/api/forum/league/${league}`,
          {
            params: {
              page: pageNumber,
              limit: 10,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data;

        setPosts((prev) =>
          pageNumber === 1 ? data.posts : [...prev, ...data.posts]
        );

        setPage(data.page);
      } catch (err: any) {
        console.error("Forum fetch error:", err);

        setError(
          err.response?.data?.error ||
            err.message ||
            "Error loading posts"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, token]
  );

  /*
  -----------------------------
  INITIAL FETCH AFTER TOKEN
  -----------------------------
  */
  useEffect(() => {
    if (token) {
      fetchPosts(1);
    }
  }, [token, fetchPosts]);

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
    if (!token) throw new Error("Not authenticated");

    try {
      await axios.delete(`${BASE_URL}/api/forum/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts((prev) =>
        prev.filter((p) => String(p.id) !== postId)
      );
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  /*
  -----------------------------
  EDIT POST
  -----------------------------
  */
  const editPost = async (postId: string, newText: string) => {
    if (!token) throw new Error("Not authenticated");

    try {
      const res = await axios.patch(
        `${BASE_URL}/api/forum/post/${postId}`,
        { text: newText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts((prev) =>
        prev.map((p) =>
          String(p.id) === postId ? res.data.post : p
        )
      );
    } catch (err) {
      console.error("Edit post error:", err);
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
    token,
    currentUserId,
    fetchPosts,
    refresh,
    loadMore,
    deletePost,
    editPost,
  };
}