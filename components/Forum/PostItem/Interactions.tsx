// components/Forum/Interactions.tsx
import { useBadgeNotifications } from "@/hooks/ForumHooks/useBadgeNotifications";
import { PostItemStyles } from "@/styles/ForumStyles/PostItemStyles";
import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import ConfirmModal from "components/ConfirmModal";
import { Colors } from "constants/styles";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useLikesStore } from "store/useLikesStore";
import type {
  ForumBookmarkMutationResponse,
  ForumLikeMutationResponse,
  ForumPost,
  ForumShareMutationResponse,
} from "types/forum";
import { apiClient } from "utils/apiClient";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const isSameUser = (
  firstUserId: number | null | undefined,
  secondUserId: number | null | undefined,
) =>
  firstUserId != null &&
  secondUserId != null &&
  firstUserId === secondUserId;

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type InteractionsProps = {
  item: ForumPost;
  isDark: boolean;
  currentUserId: number | null;
  onBookmarkChange?: (
    post: ForumPost,
    bookmarked: boolean,
  ) => void;
  disableCommentNavigation?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                Interactions                                */
/* -------------------------------------------------------------------------- */

export const Interactions = memo(function Interactions({
  item,
  isDark,
  currentUserId,
  onBookmarkChange,
  disableCommentNavigation,
}: InteractionsProps) {
  const { likes, setLike } = useLikesStore();
  const { handleBadgeAwards } = useBadgeNotifications();

  const router = useRouter();
  const styles = PostItemStyles(isDark);

  /* ------------------------------------------------------------------------ */
  /*                                  State                                   */
  /* ------------------------------------------------------------------------ */

  const [feedbackModal, setFeedbackModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [sharePending, setSharePending] = useState(false);

  const [bookmarked, setBookmarked] = useState(
    Boolean(
      item.bookmarked_by_current_user ??
        item.bookmarked,
    ),
  );

  const [bookmarkCount, setBookmarkCount] = useState(
    item.bookmarks ?? 0,
  );

  const [shareCount, setShareCount] = useState(
    item.shares ?? 0,
  );

  /*
   * Tracks the newest like request.
   *
   * This lets users rapidly like/unlike without disabling
   * the button while preventing an older API response from
   * overwriting a newer interaction.
   */
  const likeRequestId = useRef(0);

  /* ------------------------------------------------------------------------ */
  /*                              Like Store                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!likes[item.id]) {
      setLike(
        item.id,
        item.liked_by_current_user,
        item.likes,
      );
    }
  }, [
    item.id,
    item.liked_by_current_user,
    item.likes,
    likes,
    setLike,
  ]);

  const likeState = useLikesStore(
    (state) => state.likes[item.id],
  );

  const liked =
    likeState?.liked ??
    item.liked_by_current_user;

  const likeCount =
    likeState?.count ??
    item.likes;

  /* ------------------------------------------------------------------------ */
  /*                               Share State                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setShareCount(item.shares ?? 0);
  }, [item.shares]);

  /* ------------------------------------------------------------------------ */
  /*                             Bookmark State                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setBookmarked(
      Boolean(
        item.bookmarked_by_current_user ??
          item.bookmarked,
      ),
    );

    setBookmarkCount(item.bookmarks ?? 0);
  }, [
    item.bookmarked,
    item.bookmarked_by_current_user,
    item.bookmarks,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                                Timestamp                                 */
  /* ------------------------------------------------------------------------ */

  const timestamp = formatDistanceToNow(
    new Date(item.created_at),
    {
      addSuffix: true,
    },
  ).replace(/^about /, "");

  /* ------------------------------------------------------------------------ */
  /*                              Badge Awards                                */
  /* ------------------------------------------------------------------------ */

  const handleMutationAwards = (
    newlyAwardedBadges:
      | ForumLikeMutationResponse["newlyAwardedBadges"]
      | ForumShareMutationResponse["newlyAwardedBadges"],
  ) => {
    const awardBelongsToCurrentUser = isSameUser(
      currentUserId,
      item.user_id,
    );

    if (awardBelongsToCurrentUser) {
      handleBadgeAwards(newlyAwardedBadges);
      return;
    }

    if (__DEV__ && newlyAwardedBadges?.length) {
      console.warn(
        "Ignoring badge awards returned for a post author on another user's device.",
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                   Like                                   */
  /* ------------------------------------------------------------------------ */

  const toggleLikePress = async () => {
    const previousLiked = liked;
    const previousCount = likeCount;

    const nextLiked = !previousLiked;

    const optimisticCount = Math.max(
      previousCount + (nextLiked ? 1 : -1),
      0,
    );

    /*
     * Increment the request ID every time the user taps.
     *
     * Example:
     *
     * Like    -> request 1
     * Unlike  -> request 2
     * Like    -> request 3
     *
     * Only request 3 is allowed to update/rollback
     * the current UI state.
     */
    const requestId = ++likeRequestId.current;

    /*
     * Optimistic update.
     *
     * The heart and count change immediately instead
     * of waiting for the network request.
     */
    setLike(
      item.id,
      nextLiked,
      optimisticCount,
    );

    try {
      const response = await apiClient.patch<
        ForumLikeMutationResponse<Partial<ForumPost>>
      >(`/api/forum/post/${item.id}/like`, {
        like: nextLiked,
      });

      /*
       * If another tap occurred while this request was
       * running, this response is stale.
       */
      if (requestId !== likeRequestId.current) {
        return;
      }

      const serverPost = response.data.post;

      /*
       * Reconcile optimistic state with the backend.
       */
      setLike(
        item.id,
        typeof serverPost?.liked_by_current_user ===
          "boolean"
          ? serverPost.liked_by_current_user
          : nextLiked,
        typeof serverPost?.likes === "number"
          ? serverPost.likes
          : optimisticCount,
      );

      if (
        typeof serverPost?.shares === "number"
      ) {
        setShareCount(serverPost.shares);
      }

      handleMutationAwards(
        response.data.newlyAwardedBadges,
      );
    } catch (err: unknown) {
      /*
       * Ignore failures from stale requests.
       *
       * Only the newest interaction should be allowed
       * to rollback the UI.
       */
      if (requestId !== likeRequestId.current) {
        return;
      }

      setLike(
        item.id,
        previousLiked,
        previousCount,
      );

      const message = isAxiosError<{
        error?: string;
      }>(err)
        ? err.response?.data?.error ||
          err.message ||
          "Failed to toggle like"
        : err instanceof Error
          ? err.message
          : "Failed to toggle like";

      setFeedbackModal({
        title: "Like failed",
        message,
      });
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                Bookmark                                  */
  /* ------------------------------------------------------------------------ */

  const handleBookmarkPress = async () => {
    if (bookmarkPending) {
      return;
    }

    const previousBookmarked = bookmarked;
    const previousCount = bookmarkCount;

    const nextBookmarked = !previousBookmarked;

    const optimisticCount = Math.max(
      previousCount +
        (nextBookmarked ? 1 : -1),
      0,
    );

    setBookmarked(nextBookmarked);
    setBookmarkCount(optimisticCount);
    setBookmarkPending(true);

    try {
      const response = await apiClient.patch<
        ForumBookmarkMutationResponse<
          Partial<ForumPost>
        >
      >(`/api/forum/post/${item.id}/bookmark`, {
        bookmark: nextBookmarked,
      });

      const serverPost = response.data.post;

      const serverBookmarked =
        typeof serverPost
          ?.bookmarked_by_current_user ===
        "boolean"
          ? serverPost.bookmarked_by_current_user
          : nextBookmarked;

      const serverBookmarkCount =
        typeof serverPost?.bookmarks ===
        "number"
          ? serverPost.bookmarks
          : optimisticCount;

      setBookmarked(serverBookmarked);
      setBookmarkCount(serverBookmarkCount);

      onBookmarkChange?.(
        {
          ...item,
          ...serverPost,
          bookmarked_by_current_user:
            serverBookmarked,
          bookmarks: serverBookmarkCount,
        },
        serverBookmarked,
      );
    } catch (err: unknown) {
      setBookmarked(previousBookmarked);
      setBookmarkCount(previousCount);

      const message = isAxiosError<{
        error?: string;
      }>(err)
        ? err.response?.data?.error ||
          err.message ||
          "Failed to bookmark post"
        : err instanceof Error
          ? err.message
          : "Failed to bookmark post";

      setFeedbackModal({
        title: "Bookmark failed",
        message,
      });
    } finally {
      setBookmarkPending(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                  Share                                   */
  /* ------------------------------------------------------------------------ */

  const handleSharePress = async () => {
    if (sharePending) {
      return;
    }

    setSharePending(true);

    try {
      const response = await apiClient.post<
        ForumShareMutationResponse<
          Partial<ForumPost>
        >
      >(`/api/forum/post/${item.id}/share`);

      const serverPost = response.data.post;

      if (
        typeof serverPost?.shares === "number"
      ) {
        setShareCount(serverPost.shares);
      } else if (
        response.data.didCreateShare
      ) {
        setShareCount(
          (current) => current + 1,
        );
      }

      handleMutationAwards(
        response.data.newlyAwardedBadges,
      );
    } catch (err: unknown) {
      const message = isAxiosError<{
        error?: string;
      }>(err)
        ? err.response?.data?.error ||
          err.message ||
          "Failed to share post"
        : err instanceof Error
          ? err.message
          : "Failed to share post";

      setFeedbackModal({
        title: "Share failed",
        message,
      });
    } finally {
      setSharePending(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                 Comment                                  */
  /* ------------------------------------------------------------------------ */

  const handleCommentPress = () => {
    if (disableCommentNavigation) {
      return;
    }

    router.push({
      pathname: "/post/[postId]",
      params: {
        postId: item.id,
      },
    });
  };

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <View
        style={styles.interactionContainer}
      >
        <View
          style={styles.interactionWrapper}
        >
          {/* -------------------------------------------------------------- */}
          {/*                              Left                              */}
          {/* -------------------------------------------------------------- */}

          <View style={styles.leftSide}>
            {/* Like */}
            <TouchableOpacity
              onPress={toggleLikePress}
              style={styles.buttonContainer}
            >
              <Ionicons
                name={
                  liked
                    ? "heart"
                    : "heart-outline"
                }
                size={28}
                color={
                  isDark
                    ? Colors.white
                    : Colors.black
                }
              />

              <Text style={styles.count}>
                {likeCount}
              </Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity
              onPress={handleCommentPress}
              disabled={
                disableCommentNavigation
              }
              style={[
                styles.buttonContainer,
                disableCommentNavigation && {
                  opacity: 0.6,
                },
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={28}
                color={
                  isDark
                    ? Colors.white
                    : Colors.black
                }
              />

              <Text style={styles.count}>
                {item.comments_count}
              </Text>
            </TouchableOpacity>
          </View>

          {/* -------------------------------------------------------------- */}
          {/*                              Right                             */}
          {/* -------------------------------------------------------------- */}

          <View style={styles.rightSide}>
            {/* Bookmark */}
            <TouchableOpacity
              onPress={handleBookmarkPress}
              disabled={bookmarkPending}
              style={[
                styles.buttonContainer,
                bookmarkPending && {
                  opacity: 0.6,
                },
              ]}
            >
              <Text style={styles.count}>
                {bookmarkCount}
              </Text>

              <Ionicons
                name={
                  bookmarked
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={28}
                color={
                  isDark
                    ? Colors.white
                    : Colors.black
                }
              />
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              onPress={handleSharePress}
              disabled={sharePending}
              style={[
                styles.buttonContainer,
                sharePending && {
                  opacity: 0.6,
                },
              ]}
            >
              <Text style={styles.count}>
                {shareCount}
              </Text>

              <Ionicons
                name="share-social-outline"
                size={28}
                color={
                  isDark
                    ? Colors.white
                    : Colors.black
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timestamp */}
        <Text
          style={styles.timestamp}
          numberOfLines={1}
        >
          {timestamp}
        </Text>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/*                         Interaction Error                          */}
      {/* ------------------------------------------------------------------ */}

      <ConfirmModal
        title={feedbackModal?.title}
        message={feedbackModal?.message}
        visible={Boolean(feedbackModal)}
        onCancel={() =>
          setFeedbackModal(null)
        }
        onConfirm={() =>
          setFeedbackModal(null)
        }
        confirmText="OK"
        showCancel={false}
      />
    </>
  );
});