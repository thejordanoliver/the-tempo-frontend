import { useBadgeNotifications } from "@/hooks/ForumHooks/useBadgeNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { AlertConfig } from "types/alert";
import type {
  ForumComment,
  ForumCommentAttachment,
  ForumCommentCreateResponse,
  ForumCommentsResponse,
  ForumDeleteMutationResponse,
  ForumExtendedPost,
  ForumPost,
  ForumPostResponse,
} from "types/forum";
import { apiClient } from "utils/apiClient";

/* -------------------------------------------------------------------------- */
/* User Helpers                                                               */
/* -------------------------------------------------------------------------- */

function getPostAuthorId(post: ForumExtendedPost | null) {
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

/* -------------------------------------------------------------------------- */
/* Error Helpers                                                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Media Helpers                                                              */
/* -------------------------------------------------------------------------- */

function getFileNameFromUri(uri: string, fallback: string) {
  const cleanUri = uri.split("?")[0];
  const name = cleanUri.split("/").pop();

  return name && name.includes(".") ? name : fallback;
}

function getMimeType(attachment: ForumCommentAttachment) {
  if (attachment.mimeType) return attachment.mimeType;

  if (attachment.type === "video") return "video/mp4";
  if (attachment.type === "gif") return "image/gif";

  const lower = attachment.uri.toLowerCase();

  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";

  return "image/jpeg";
}

/* -------------------------------------------------------------------------- */
/* API Comment Types                                                          */
/* -------------------------------------------------------------------------- */

type RawForumComment = Omit<
  ForumComment,
  "id" | "post_id" | "user_id" | "parent_comment_id" | "replies"
> & {
  id: string | number;
  post_id?: string | null;
  user_id: string | number;
  parent_comment_id?: string | number | null;
  replies?: RawForumComment[];
};

type CreateForumCommentParams = {
  postId: string;
  text: string;
  attachment?: ForumCommentAttachment | null;
  parentCommentId?: number | null;
};

/* -------------------------------------------------------------------------- */
/* ID Helpers                                                                 */
/* -------------------------------------------------------------------------- */

function toNumberId(value: string | number) {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function toNullableNumberId(
  value: string | number | null | undefined,
) {
  if (value == null) return null;

  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

/* -------------------------------------------------------------------------- */
/* Comment Normalization                                                      */
/* -------------------------------------------------------------------------- */

function getCreatedAtTime(comment: ForumComment) {
  const time = new Date(comment.created_at).getTime();

  return Number.isFinite(time) ? time : 0;
}

function sortReplies(replies: ForumComment[]) {
  return [...replies].sort(
    (first, second) =>
      getCreatedAtTime(first) - getCreatedAtTime(second) ||
      first.id - second.id,
  );
}

function normalizeForumComment(
  comment: RawForumComment | null | undefined,
  fallbackPostId: string,
  depth = 0,
  fallbackParentCommentId: number | null = null,
): ForumComment {
  if (!comment) {
    throw new Error("Cannot normalize an empty forum comment");
  }

  const commentId = toNumberId(comment.id);

  if (!commentId) {
    throw new Error("Forum comment is missing a valid id");
  }

  const userId = toNumberId(comment.user_id);

  if (!userId) {
    throw new Error(
      `Forum comment ${commentId} is missing a valid user_id`,
    );
  }

  const parentCommentId =
    fallbackParentCommentId ??
    toNullableNumberId(comment.parent_comment_id);

  const replies =
    depth === 0 && Array.isArray(comment.replies)
      ? sortReplies(
          comment.replies.map((reply) =>
            normalizeForumComment(
              reply,
              fallbackPostId,
              1,
              toNullableNumberId(reply.parent_comment_id) ?? commentId,
            ),
          ),
        )
      : [];

  return {
    ...comment,
    id: commentId,
    post_id: comment.post_id ?? fallbackPostId,
    user_id: userId,
    parent_comment_id: parentCommentId,
    full_name: comment.full_name ?? null,
    profile_image: comment.profile_image ?? null,
    text: comment.text ?? "",
    images: comment.images ?? [],
    videos: comment.videos ?? [],
    video_thumbnails: comment.video_thumbnails ?? [],
    replies,
  };
}

/* -------------------------------------------------------------------------- */
/* Comment / Reply Creation                                                   */
/* -------------------------------------------------------------------------- */

async function createForumComment({
  postId,
  text,
  attachment,
  parentCommentId = null,
}: CreateForumCommentParams) {
  const trimmedText = text.trim();

  const endpoint =
    parentCommentId == null
      ? `/api/forum/post/${postId}/comments`
      : `/api/forum/post/${postId}/comments/${parentCommentId}/replies`;

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

    const res = await apiClient.post<
      ForumCommentCreateResponse<RawForumComment>
    >(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  }

  const res = await apiClient.post<
    ForumCommentCreateResponse<RawForumComment>
  >(endpoint, {
    text: trimmedText,
  });

  return res.data;
}

/* -------------------------------------------------------------------------- */
/* Comment Tree Helpers                                                       */
/* -------------------------------------------------------------------------- */

function appendReplyToComment(
  comments: ForumComment[],
  reply: ForumComment,
) {
  if (reply.parent_comment_id == null) {
    return comments;
  }

  return comments.map((comment) =>
    comment.id === reply.parent_comment_id
      ? {
          ...comment,
          replies: sortReplies([
            ...(comment.replies ?? []),
            reply,
          ]),
        }
      : comment,
  );
}

function updateCommentInTree(
  comments: ForumComment[],
  commentId: number,
  updatedComment: ForumComment,
) {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        ...updatedComment,
        replies:
          updatedComment.replies &&
          updatedComment.replies.length > 0
            ? sortReplies(updatedComment.replies)
            : (comment.replies ?? []),
      };
    }

    const replies = comment.replies ?? [];
    let didUpdateReply = false;

    const nextReplies = replies.map((reply) => {
      if (reply.id !== commentId) {
        return reply;
      }

      didUpdateReply = true;

      return {
        ...reply,
        ...updatedComment,
        parent_comment_id:
          updatedComment.parent_comment_id ?? comment.id,
        replies: [],
      };
    });

    return didUpdateReply
      ? {
          ...comment,
          replies: sortReplies(nextReplies),
        }
      : comment;
  });
}

function removeCommentFromTree(
  comments: ForumComment[],
  commentId: number,
) {
  const isTopLevelComment = comments.some(
    (comment) => comment.id === commentId,
  );

  if (isTopLevelComment) {
    return comments.filter(
      (comment) => comment.id !== commentId,
    );
  }

  return comments.map((comment) => {
    const replies = comment.replies ?? [];

    const nextReplies = replies.filter(
      (reply) => reply.id !== commentId,
    );

    return nextReplies.length === replies.length
      ? comment
      : {
          ...comment,
          replies: nextReplies,
        };
  });
}

function countRemovedComments(
  comments: ForumComment[],
  commentId: number,
) {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return 1 + (comment.replies?.length ?? 0);
    }

    if (
      (comment.replies ?? []).some(
        (reply) => reply.id === commentId,
      )
    ) {
      return 1;
    }
  }

  return 0;
}

function findParentCommentId(
  comments: ForumComment[],
  commentId: number,
) {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return null;
    }

    if (
      (comment.replies ?? []).some(
        (reply) => reply.id === commentId,
      )
    ) {
      return comment.id;
    }
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useCommentThread(postId: string | null) {
  const [currentUserId, setCurrentUserId] =
    useState<number | null>(null);

  const [post, setPost] =
    useState<ForumExtendedPost | null>(null);

  const [comments, setComments] =
    useState<ForumComment[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [alertConfig, setAlertConfig] =
    useState<AlertConfig | null>(null);

  const {
    handleBadgeAwards,
    requestBadgeDataRefresh,
  } = useBadgeNotifications();

  /* ------------------------------------------------------------------------ */
  /* Current User                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    AsyncStorage.getItem("userId")
      .then((id) => {
        const parsed = id
          ? Number.parseInt(id, 10)
          : NaN;

        setCurrentUserId(
          Number.isNaN(parsed)
            ? null
            : parsed,
        );
      })
      .catch(() => setCurrentUserId(null));
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Fetch Thread                                                             */
  /* ------------------------------------------------------------------------ */

  const fetchThread = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [postRes, commentRes] =
        await Promise.all([
          apiClient.get<
            ForumPostResponse<ForumExtendedPost>
          >(`/api/forum/post/${postId}`),

          apiClient.get<
            ForumCommentsResponse<RawForumComment>
          >(`/api/forum/post/${postId}/comments`),
        ]);

      setPost(postRes.data.post ?? null);

      const normalizedComments = (
        commentRes.data.comments ?? []
      )
        .map((comment) =>
          normalizeForumComment(
            comment,
            postId,
          ),
        )
        .filter(
          (comment) =>
            comment.parent_comment_id == null,
        );

      setComments(normalizedComments);
    } catch (error) {
      console.error(
        "Failed to fetch thread",
        error,
      );

      setAlertConfig({
        title: "Error",
        message: getErrorMessage(
          error,
          "Failed to load comments",
        ),
        confirmText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  /* ------------------------------------------------------------------------ */
  /* Create Top-Level Comment                                                 */
  /* ------------------------------------------------------------------------ */

  const postComment = useCallback(
    async (
      text: string,
      attachment?: ForumCommentAttachment | null,
    ) => {
      const trimmedText = text.trim();

      if (
        !postId ||
        (!trimmedText && !attachment)
      ) {
        return false;
      }

      setSubmitting(true);

      try {
        const responseData =
          await createForumComment({
            postId,
            text: trimmedText,
            attachment,
          });

        const rawComment =
          responseData.comment;

        if (!rawComment) {
          console.error(
            "Invalid comment response:",
            responseData,
          );

          throw new Error(
            "Server did not return the created comment",
          );
        }

        const createdComment =
          normalizeForumComment(
            rawComment,
            postId,
          );

        const { newlyAwardedBadges } =
          responseData;

        const awardBelongsToCurrentUser =
          isSameUser(
            currentUserId,
            getPostAuthorId(post),
          );

        if (awardBelongsToCurrentUser) {
          handleBadgeAwards(
            newlyAwardedBadges,
          );
        } else if (
          __DEV__ &&
          newlyAwardedBadges?.length
        ) {
          console.warn(
            "Ignoring badge awards returned for a post author on another user's device.",
          );
        }

        setComments((previous) => [
          ...previous,
          createdComment,
        ]);

        setPost((previous) =>
          previous
            ? {
                ...previous,
                comments_count:
                  typeof responseData.post
                    ?.comments_count ===
                  "number"
                    ? responseData.post
                        .comments_count
                    : (previous.comments_count ??
                        0) + 1,
              }
            : previous,
        );

        return true;
      } catch (error) {
        console.error(
          "Failed to post comment",
          error,
        );

        setAlertConfig({
          title: "Error",
          message: getErrorMessage(
            error,
            "Failed to post comment",
          ),
          confirmText: "OK",
        });

        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [
      currentUserId,
      handleBadgeAwards,
      post,
      postId,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Create Reply                                                             */
  /* ------------------------------------------------------------------------ */

  const postReply = useCallback(
    async (
      parentCommentId: number,
      text: string,
      attachment?: ForumCommentAttachment | null,
    ) => {
      const trimmedText = text.trim();

      if (
        !postId ||
        !parentCommentId ||
        (!trimmedText && !attachment)
      ) {
        return false;
      }

      setSubmitting(true);

      try {
        const responseData =
          await createForumComment({
            postId,
            text: trimmedText,
            attachment,
            parentCommentId,
          });

        /*
         * The reply endpoint should return:
         *
         * {
         *   message: "Reply added",
         *   reply: {...}
         * }
         *
         * The `comment` fallback keeps the frontend
         * tolerant if the backend later standardizes
         * both mutation endpoints around `comment`.
         */
        const rawReply =
          responseData.reply ??
          responseData.comment;

        if (!rawReply) {
          console.error(
            "Invalid reply response:",
            responseData,
          );

          throw new Error(
            "Server did not return the created reply",
          );
        }

        const createdReply =
          normalizeForumComment(
            rawReply,
            postId,
            1,
            parentCommentId,
          );

        const { newlyAwardedBadges } =
          responseData;

        const awardBelongsToCurrentUser =
          isSameUser(
            currentUserId,
            getPostAuthorId(post),
          );

        if (awardBelongsToCurrentUser) {
          handleBadgeAwards(
            newlyAwardedBadges,
          );
        } else if (
          __DEV__ &&
          newlyAwardedBadges?.length
        ) {
          console.warn(
            "Ignoring badge awards returned for a post author on another user's device.",
          );
        }

        setComments((previous) =>
          appendReplyToComment(
            previous,
            createdReply,
          ),
        );

        setPost((previous) =>
          previous
            ? {
                ...previous,
                comments_count:
                  typeof responseData.post
                    ?.comments_count ===
                  "number"
                    ? responseData.post
                        .comments_count
                    : (previous.comments_count ??
                        0) + 1,
              }
            : previous,
        );

        return true;
      } catch (error) {
        console.error(
          "Failed to post reply",
          error,
        );

        setAlertConfig({
          title: "Error",
          message: getErrorMessage(
            error,
            "Failed to post reply",
          ),
          confirmText: "OK",
        });

        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [
      currentUserId,
      handleBadgeAwards,
      post,
      postId,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Edit Comment / Reply                                                     */
  /* ------------------------------------------------------------------------ */

  const editComment = useCallback(
    async (
      commentId: number,
      newText: string,
    ) => {
      const trimmedText = newText.trim();

      if (
        !postId ||
        !commentId ||
        !trimmedText
      ) {
        return;
      }

      try {
        const parentCommentId =
          findParentCommentId(
            comments,
            commentId,
          );

        const res = await apiClient.put<
          ForumCommentCreateResponse<RawForumComment>
        >(
          `/api/forum/post/${postId}/comments/${commentId}`,
          {
            text: trimmedText,
          },
        );

        const rawUpdatedComment =
          res.data.comment ??
          res.data.reply;

        if (!rawUpdatedComment) {
          console.error(
            "Invalid edit comment response:",
            res.data,
          );

          throw new Error(
            "Server did not return the updated comment",
          );
        }

        const updatedComment =
          normalizeForumComment(
            rawUpdatedComment,
            postId,
            parentCommentId == null
              ? 0
              : 1,
            parentCommentId,
          );

        setComments((previous) =>
          updateCommentInTree(
            previous,
            commentId,
            {
              ...updatedComment,
              text: trimmedText,
            },
          ),
        );
      } catch (error) {
        console.error(
          "Failed to edit comment",
          error,
        );

        setAlertConfig({
          title: "Error",
          message: getErrorMessage(
            error,
            "Failed to edit comment",
          ),
          confirmText: "OK",
        });
      }
    },
    [comments, postId],
  );

  /* ------------------------------------------------------------------------ */
  /* Delete Comment / Reply                                                   */
  /* ------------------------------------------------------------------------ */

  const deleteComment = useCallback(
    async (
      targetPostId: string,
      commentId: number,
    ) => {
      if (
        !targetPostId ||
        !commentId
      ) {
        return;
      }

      try {
        const removedCount =
          countRemovedComments(
            comments,
            commentId,
          ) || 1;

        const res = await apiClient.delete<
          ForumDeleteMutationResponse<
            ForumComment,
            ForumPost
          >
        >(
          `/api/forum/post/${targetPostId}/comments/${commentId}`,
        );

        requestBadgeDataRefresh();

        setComments((previous) =>
          removeCommentFromTree(
            previous,
            commentId,
          ),
        );

        setPost((previous) =>
          previous
            ? {
                ...previous,
                comments_count:
                  typeof res.data.post
                    ?.comments_count ===
                  "number"
                    ? res.data.post
                        .comments_count
                    : Math.max(
                        (previous.comments_count ??
                          removedCount) -
                          removedCount,
                        0,
                      ),
              }
            : previous,
        );
      } catch (error) {
        console.error(
          "Failed to delete comment",
          error,
        );

        setAlertConfig({
          title: "Error",
          message: getErrorMessage(
            error,
            "Failed to delete comment",
          ),
          confirmText: "OK",
        });
      }
    },
    [
      comments,
      requestBadgeDataRefresh,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Delete Post                                                              */
  /* ------------------------------------------------------------------------ */

  const deletePost = useCallback(
    async (postIdToDelete: string) => {
      if (!postIdToDelete) {
        return false;
      }

      try {
        await apiClient.delete<
          ForumDeleteMutationResponse
        >(
          `/api/forum/post/${postIdToDelete}`,
        );

        requestBadgeDataRefresh();

        setPost((previous) =>
          previous &&
          String(previous.id) ===
            String(postIdToDelete)
            ? null
            : previous,
        );

        return true;
      } catch (error) {
        console.error(
          "Failed to delete post",
          error,
        );

        setAlertConfig({
          title: "Error",
          message: getErrorMessage(
            error,
            "Failed to delete post",
          ),
          confirmText: "OK",
        });

        return false;
      }
    },
    [requestBadgeDataRefresh],
  );

  /* ------------------------------------------------------------------------ */
  /* External Post Updates                                                    */
  /* ------------------------------------------------------------------------ */

  const updatePost = useCallback(
    (updatedPost: ForumPost) => {
      setPost((currentPost) =>
        currentPost &&
        String(currentPost.id) ===
          String(updatedPost.id)
          ? {
              ...currentPost,
              ...updatedPost,
            }
          : currentPost,
      );
    },
    [],
  );

  /* ------------------------------------------------------------------------ */
  /* Public API                                                               */
  /* ------------------------------------------------------------------------ */

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
    postReply,
    editComment,
    deleteComment,
    deletePost,
    updatePost,
  };
}