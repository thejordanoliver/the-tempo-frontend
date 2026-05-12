import { Post } from "components/Forum/PostItem";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import { AlertConfig } from "types/alert";
import { apiClient } from "utils/apiClient";
import { getRefreshToken } from "utils/authStorage";

export type CommentAttachment = {
  type: "image" | "video" | "gif";
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

interface Comment {
  id: string;
  text: string | null;
  user_id: number;
  username: string;
  created_at: string;
  profile_image: string | null;
  images?: string[];
  videos?: string[];
  video_thumbnails?: (string | null)[];
}

interface ExtendedPost extends Post {
  author?: { id: number; username: string };
}

interface JwtPayload {
  id: number;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.error === "string"
  ) {
    return (error as any).response.data.error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function getFileNameFromUri(uri: string, fallback: string) {
  const cleanUri = uri.split("?")[0];
  const name = cleanUri.split("/").pop();

  return name && name.includes(".") ? name : fallback;
}

function getMimeType(attachment: CommentAttachment) {
  if (attachment.mimeType) return attachment.mimeType;

  if (attachment.type === "video") return "video/mp4";
  if (attachment.type === "gif") return "image/gif";

  const lower = attachment.uri.toLowerCase();

  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";

  return "image/jpeg";
}

export function useCommentThread(postId: string | null) {
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [post, setPost] = useState<ExtendedPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const stored = await getRefreshToken();

      if (!stored) return;

      setToken(stored);

      try {
        const decoded = jwtDecode<JwtPayload>(stored);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error("JWT decode failed", error);
      }
    };

    loadToken();
  }, []);

  const fetchThread = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [postRes, commentRes] = await Promise.all([
        apiClient.get(`api/forum/post/${postId}`, { headers }),
        apiClient.get(`api/forum/post/${postId}/comments`, { headers }),
      ]);

      setPost(postRes.data.post);
      setComments(commentRes.data.comments ?? []);
    } catch (error) {
      console.error("Failed to fetch thread", error);

      setAlertConfig({
        title: "Error",
        message: getErrorMessage(error, "Failed to load comments"),
        confirmText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }, [postId, token]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const postComment = useCallback(
    async (text: string, attachment?: CommentAttachment | null) => {
      const trimmedText = text.trim();

      if (!token || !postId || (!trimmedText && !attachment)) return;

      setSubmitting(true);

      try {
        let createdComment: Comment;

        if (attachment) {
          const formData = new FormData();

          formData.append("text", trimmedText);

          if (attachment.type === "gif") {
            formData.append("gif_url", attachment.uri);
          } else {
            const fallbackName =
              attachment.type === "video" ? "comment-video.mp4" : "comment-image.jpg";

            formData.append("media", {
              uri: attachment.uri,
              name: attachment.fileName || getFileNameFromUri(attachment.uri, fallbackName),
              type: getMimeType(attachment),
            } as any);
          }

          const res = await apiClient.post(
            `api/forum/post/${postId}/comments`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            },
          );

          createdComment = res.data.comment;
        } else {
          const res = await apiClient.post(
            `api/forum/post/${postId}/comments`,
            { text: trimmedText },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          createdComment = res.data.comment;
        }

        setComments((prev) => [...prev, createdComment]);

        setPost((prev) =>
          prev
            ? {
                ...prev,
                comments_count: (prev.comments_count ?? 0) + 1,
              }
            : prev,
        );
      } catch (error) {
        console.error("Failed to post comment", error);

        setAlertConfig({
          title: "Error",
          message: getErrorMessage(error, "Failed to post comment"),
          confirmText: "OK",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [postId, token],
  );

  const editComment = useCallback(
    async (commentId: string, newText: string) => {
      const trimmedText = newText.trim();

      if (!token || !postId || !commentId || !trimmedText) return;

      try {
        const res = await apiClient.put(
          `api/forum/post/${postId}/comments/${commentId}`,
          { text: trimmedText },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const updatedComment = res.data.comment;

        setComments((prev) =>
          prev.map((comment) =>
            String(comment.id) === String(commentId)
              ? {
                  ...comment,
                  ...updatedComment,
                  text: trimmedText,
                }
              : comment,
          ),
        );
      } catch (error) {
        console.error("Failed to edit comment", error);

        setAlertConfig({
          title: "Error",
          message: getErrorMessage(error, "Failed to edit comment"),
          confirmText: "OK",
        });
      }
    },
    [postId, token],
  );

  const deleteComment = useCallback(
    async (targetPostId: string, commentId: string) => {
      if (!token || !targetPostId || !commentId) return;

      try {
        await apiClient.delete(
          `api/forum/post/${targetPostId}/comments/${commentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setComments((prev) =>
          prev.filter((comment) => String(comment.id) !== String(commentId)),
        );

        setPost((prev) =>
          prev
            ? {
                ...prev,
                comments_count: Math.max((prev.comments_count ?? 1) - 1, 0),
              }
            : prev,
        );
      } catch (error) {
        console.error("Failed to delete comment", error);

        setAlertConfig({
          title: "Error",
          message: getErrorMessage(error, "Failed to delete comment"),
          confirmText: "OK",
        });
      }
    },
    [token],
  );

const deletePost = useCallback(
  async (postIdToDelete: string) => {
    if (!token || !postIdToDelete) return false;

    try {
      await apiClient.delete(`api/forum/post/${postIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPost((prev) =>
        prev && String(prev.id) === String(postIdToDelete) ? null : prev,
      );

      return true;
    } catch (error) {
      console.error("Failed to delete post", error);

      setAlertConfig({
        title: "Error",
        message: getErrorMessage(error, "Failed to delete post"),
        confirmText: "OK",
      });

      return false;
    }
  },
  [token],
);

  return {
    token,
    currentUserId,
    post,
    comments,
    loading,
    submitting,
    alertConfig,
    setAlertConfig,
    fetchThread,
    postComment,
    editComment,
    deleteComment,
    deletePost,
  };
}