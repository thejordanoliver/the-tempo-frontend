// hooks/useTeamForum.ts
import axios from "axios";
import { Post } from "components/Forum/PostItem";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "utils/authStorage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export function useTeamForum(teamId: string, league?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Load token & decode user
  useEffect(() => {
    (async () => {
      const storedToken = await getAccessToken();
      setToken(storedToken || null);

      if (storedToken) {
        const decoded: { id: number } = jwtDecode(storedToken);
        setCurrentUserId(decoded.id);
      }
    })();
  }, []);

  const fetchPosts = useCallback(
    async (pageNumber = 1, authToken?: string) => {
      const usedToken = authToken ?? token;
      if (!teamId || !league || !usedToken) return;

      pageNumber === 1 ? setLoading(true) : setRefreshing(true);
      setError(null);

      try {
        const res = await axios.get(
          `${BASE_URL}/api/forum/team/${league}/${teamId}`,
          {
            params: { page: pageNumber, limit: 10 },
            headers: { Authorization: `Bearer ${usedToken}` },
          }
        );

        const data = res.data;

        if (pageNumber === 1) setPosts(data.posts);
        else setPosts((prev) => [...prev, ...data.posts]);

        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);

        const likedSet = new Set<string>(
          data.posts
            .filter((post: Post) => post.liked_by_current_user)
            .map((post: Post) => String(post.id))
        );
        setLikedPosts(likedSet);
      } catch (err: any) {
        console.error("Fetch posts error:", err);
        setError(
          err.response?.data?.error || err.message || "Error loading posts"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [teamId, league]
  );

  useEffect(() => {
    if (token) fetchPosts(1, token);
  }, [token, fetchPosts]);

  const refresh = () => fetchPosts(1);
  const loadMore = () => {
    if (page < totalPages && !loading && !refreshing) fetchPosts(page + 1);
  };

  const deletePost = useCallback(
    async (postId: string) => {
      if (!token) return;
      try {
        await axios.delete(`${BASE_URL}/api/forum/post/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } catch (err: any) {
        console.error("Delete post error:", err);
      }
    },
    [token]
  );

  const editPost = useCallback(
    async (postId: string, newText: string) => {
      if (!token) return;
      try {
        const res = await axios.patch(
          `${BASE_URL}/api/forum/post/${postId}`,
          { text: newText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? res.data.post : p))
        );
      } catch (err: any) {
        console.error("Edit post error:", err);
      }
    },
    [token]
  );

// hooks/useTeamForum.ts
const prependPost = useCallback(
  (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  },
  [setPosts]
);

return {
  posts,
  loading,
  refreshing,
  error,
  token,
  currentUserId,
  likedPosts,
  fetchPosts,
  refresh,
  loadMore,
  deletePost,
  editPost,
  prependPost, // ✅ expose this
};

}
