import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AlertConfig } from "hooks/ForumHooks/useCreatePost";
import { getAccessToken } from "utils/authStorage";
import { Post } from "components/Forum/PostItem";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

interface Comment {
  id: string;
  text: string;
  user_id: number;
  username: string;
  created_at: string;
  profile_image: string;
}

interface ExtendedPost extends Post {
  author: { id: number; username: string };
}

interface JwtPayload {
  id: number;
}

export function useCommentThread(postId: string | null) {
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [post, setPost] = useState<ExtendedPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  /* ---------------- token ---------------- */

  useEffect(() => {
    const loadToken = async () => {
      const stored = await getAccessToken();
      if (!stored) return;

      setToken(stored);
      try {
        const decoded = jwtDecode<JwtPayload>(stored);
        setCurrentUserId(decoded.id);
      } catch (e) {
        console.error("JWT decode failed", e);
      }
    };

    loadToken();
  }, []);

  /* ---------------- fetch ---------------- */

  const fetchThread = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    try {
      const [postRes, commentRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/forum/post/${postId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        axios.get(`${BASE_URL}/api/forum/post/${postId}/comments`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      setPost(postRes.data.post);
      setComments(commentRes.data.comments);
    } catch (err) {
      console.error("Failed to fetch thread", err);
    } finally {
      setLoading(false);
    }
  }, [postId, token]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  /* ---------------- actions ---------------- */

  const postComment = async (text: string) => {
    if (!token || !text.trim()) return;

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/forum/post/${postId}/comments`,
        { text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => [res.data.comment, ...prev]);
    } catch {
      setAlertConfig({
        title: "Error",
        message: "Failed to post comment",
        confirmText: "OK",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const editComment = async (commentId: string, newText: string) => {
    if (!token) return;

    try {
      await axios.put(
        `${BASE_URL}/api/forum/post/${postId}/comments/${commentId}`,
        { text: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, text: newText } : c
        )
      );
    } catch {
      setAlertConfig({
        title: "Error",
        message: "Failed to edit comment",
        confirmText: "OK",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!token) return;

    try {
      await axios.delete(
        `${BASE_URL}/api/forum/post/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setAlertConfig({
        title: "Error",
        message: "Failed to delete comment",
        confirmText: "OK",
      });
    }
  };

  const deletePost = async (postIdToDelete: string) => {
    if (!token) return;

    await axios.delete(`${BASE_URL}/api/forum/post/${postIdToDelete}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return {
    BASE_URL,
    token,
    currentUserId,
    post,
    comments,
    loading,
    submitting,
    alertConfig,
    setAlertConfig,
    postComment,
    editComment,
    deleteComment,
    deletePost,
  };
}
