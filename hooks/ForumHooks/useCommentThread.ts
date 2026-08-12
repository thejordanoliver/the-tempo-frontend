import { useBadgeNotifications } from "@/hooks/ForumHooks/useBadgeNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAxiosError } from "axios";
import { Post } from "components/Forum/PostItem";
import { useCallback, useEffect, useState } from "react";
import { AlertConfig } from "types/alert";
import type {
  ForumCommentCreateResponse,
  ForumDeleteMutationResponse,
} from "types/badges";
import { apiClient } from "utils/apiClient";

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

function getPostAuthorId(post: ExtendedPost | null) {
  return post?.user_id ?? post?.author?.id ?? null;
}

function isSameUser(
  firstUserId: string | number | null | undefined,
  secondUserId: string | number | null | undefined,
) {
  return (
    firstUserId != null &&
    secondUserId != null &&
    String(firstUserId) === String(secondUserId)
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<{ error?: string; message?: string }>(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      fallback
    );
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [post, setPost] = useState<ExtendedPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const { handleBadgeAwards, requestBadgeDataRefresh } =
    useBadgeNotifications();

  useEffect(() => {
    AsyncStorage.getItem("userId")
      .then((id) => {
        const parsed = id ? Number.parseInt(id, 10) : NaN;
        setCurrentUserId(Number.isNaN(parsed) ? null : parsed);
      })
      .catch(() => setCurrentUserId(null));
  }, []);

  const fetchThread = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [postRes, commentRes] = await Promise.all([
        apiClient.get(`/api/forum/post/${postId}`),
        apiClient.get(`/api/forum/post/${postId}/comments`),
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
  }, [postId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const postComment = useCallback(
    async (text: string, attachment?: CommentAttachment | null) => {
      const trimmedText = text.trim();

      if (!postId || (!trimmedText && !attachment)) return;

      setSubmitting(true);

      try {
        let responseData: ForumCommentCreateResponse<Comment>;

        if (attachment) {
          const formData = new FormData();

          formData.append("text", trimmedText);

          if (attachment.type === "gif") {
            formData.append("gif_url", attachment.uri);
          } else {
            const fallbackName =
              attachment.type === "video"
                ? "comment-video.mp4"
                : "comment-image.jpg";

            formData.append("media", {
              uri: attachment.uri,
              name:
                attachment.fileName ||
                getFileNameFromUri(attachment.uri, fallbackName),
              type: getMimeType(attachment),
            } as unknown as Blob);
          }

          const res = await apiClient.post<ForumCommentCreateResponse<Comment>>(
            `/api/forum/post/${postId}/comments`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          responseData = res.data;
        } else {
          const res = await apiClient.post<ForumCommentCreateResponse<Comment>>(
            `/api/forum/post/${postId}/comments`,
            { text: trimmedText },
          );

          responseData = res.data;
        }

        const { comment: createdComment, newlyAwardedBadges } = responseData;
        const awardBelongsToCurrentUser = isSameUser(
          currentUserId,
          getPostAuthorId(post),
        );

        if (awardBelongsToCurrentUser) {
          handleBadgeAwards(newlyAwardedBadges);
        } else if (__DEV__ && newlyAwardedBadges?.length) {
          console.warn(
            "Ignoring badge awards returned for a post author on another user's device.",
          );
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
    [currentUserId, handleBadgeAwards, post, postId],
  );

  const editComment = useCallback(
    async (commentId: string, newText: string) => {
      const trimmedText = newText.trim();

      if (!postId || !commentId || !trimmedText) return;

      try {
        const res = await apiClient.put(
          `/api/forum/post/${postId}/comments/${commentId}`,
          { text: trimmedText },
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
    [postId],
  );

  const deleteComment = useCallback(
    async (targetPostId: string, commentId: string) => {
      if (!targetPostId || !commentId) return;

      try {
        await apiClient.delete<ForumDeleteMutationResponse<Comment>>(
          `/api/forum/post/${targetPostId}/comments/${commentId}`,
        );

        requestBadgeDataRefresh();

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
    [requestBadgeDataRefresh],
  );

  const deletePost = useCallback(
    async (postIdToDelete: string) => {
      if (!postIdToDelete) return false;

      try {
        await apiClient.delete<ForumDeleteMutationResponse>(
          `/api/forum/post/${postIdToDelete}`,
        );

        requestBadgeDataRefresh();

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
    [requestBadgeDataRefresh],
  );

  const updatePost = useCallback((updatedPost: Post) => {
    setPost((currentPost) =>
      currentPost && String(currentPost.id) === String(updatedPost.id)
        ? { ...currentPost, ...updatedPost }
        : currentPost,
    );
  }, []);

  return {
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
    updatePost,
  };
}
