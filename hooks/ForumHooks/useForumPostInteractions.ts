import { isAxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useBadgeNotifications } from "hooks/ForumHooks/useBadgeNotifications";
import { setPostBookmark, setPostLike, sharePost } from "services/forumApi";
import { useLikesStore } from "store/useLikesStore";
import type { ForumLikeMutationResponse, ForumPost, ForumShareMutationResponse } from "types/forum";

type Options = {
  item: ForumPost;
  currentUserId: number | null;
  onBookmarkChange?: (post: ForumPost, bookmarked: boolean) => void;
};

const isSameUser = (
  firstUserId: number | null | undefined,
  secondUserId: number | null | undefined,
) => firstUserId != null && secondUserId != null && firstUserId === secondUserId;

export function useForumPostInteractions({ item, currentUserId, onBookmarkChange }: Options) {
  const setLike = useLikesStore((state) => state.setLike);
  const likeState = useLikesStore((state) => state.likes[item.id]);
  const { handleBadgeAwards } = useBadgeNotifications();

  const [feedbackModal, setFeedbackModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [sharePending, setSharePending] = useState(false);

  const serverBookmarked = Boolean(item.bookmarked_by_current_user ?? item.bookmarked);
  const serverBookmarkCount = item.bookmarks ?? 0;
  const serverShareCount = item.shares ?? 0;
  const bookmarkSource = JSON.stringify([item.id, serverBookmarked, serverBookmarkCount]);
  const shareSource = JSON.stringify([item.id, serverShareCount]);
  const [bookmarkOverride, setBookmarkOverride] = useState<{
    source: string; bookmarked: boolean; count: number;
  } | null>(null);
  const [shareOverride, setShareOverride] = useState<{
    source: string; count: number;
  } | null>(null);

  // Discard mutation overrides when new server props arrive. Values below
  // already use the new props on this render, without waiting for an effect.
  if (bookmarkOverride && bookmarkOverride.source !== bookmarkSource) {
    setBookmarkOverride(null);
  }
  if (shareOverride && shareOverride.source !== shareSource) {
    setShareOverride(null);
  }
  const currentBookmark = bookmarkOverride?.source === bookmarkSource ? bookmarkOverride : null;
  const bookmarked = currentBookmark?.bookmarked ?? serverBookmarked;
  const bookmarkCount = currentBookmark?.count ?? serverBookmarkCount;
  const shareCount = shareOverride?.source === shareSource ? shareOverride.count : serverShareCount;

  const updateBookmark = (nextBookmarked: boolean, count: number) =>
    setBookmarkOverride({ source: bookmarkSource, bookmarked: nextBookmarked, count });
  const updateShareCount = (count: number) =>
    setShareOverride({ source: shareSource, count });

  const likeRequestId = useRef(0);
  const bookmarkPendingRef = useRef(false);
  const sharePendingRef = useRef(false);
  const activeRef = useRef(false);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      likeRequestId.current += 1;
    };
  }, []);


  useEffect(() => {
    if (!likeState) {
      setLike(item.id, item.liked_by_current_user, item.likes);
    }
  }, [item.id, item.liked_by_current_user, item.likes, likeState, setLike]);

  const liked = likeState?.liked ?? item.liked_by_current_user;

  const likeCount = likeState?.count ?? item.likes;

  const handleMutationAwards = (
    newlyAwardedBadges:
      | ForumLikeMutationResponse["newlyAwardedBadges"]
      | ForumShareMutationResponse["newlyAwardedBadges"],
  ) => {
    const awardBelongsToCurrentUser = isSameUser(currentUserId, item.user_id);

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

  const toggleLikePress = async () => {
    const previousLiked = liked;
    const previousCount = likeCount;

    const nextLiked = !previousLiked;

    const optimisticCount = Math.max(previousCount + (nextLiked ? 1 : -1), 0);

    const requestId = ++likeRequestId.current;

    setLike(item.id, nextLiked, optimisticCount);

    try {
      const response = await setPostLike(item.id, nextLiked);

      if (!activeRef.current || requestId !== likeRequestId.current) {
        return;
      }

      const serverPost = response.post;

      setLike(
        item.id,
        typeof serverPost?.liked_by_current_user === "boolean"
          ? serverPost.liked_by_current_user
          : nextLiked,
        typeof serverPost?.likes === "number"
          ? serverPost.likes
          : optimisticCount,
      );

      if (typeof serverPost?.shares === "number") {
        updateShareCount(serverPost.shares);
      }

      handleMutationAwards(response.newlyAwardedBadges);
    } catch (err: unknown) {

      if (!activeRef.current || requestId !== likeRequestId.current) {
        return;
      }

      setLike(item.id, previousLiked, previousCount);

      const message = isAxiosError<{
        error?: string;
      }>(err)
        ? err.response?.data?.error || err.message || "Failed to toggle like"
        : err instanceof Error
          ? err.message
          : "Failed to toggle like";

      setFeedbackModal({
        title: "Like failed",
        message,
      });
    }
  };

  const handleBookmarkPress = async () => {
    if (bookmarkPendingRef.current) {
      return;
    }

    const previousBookmarked = bookmarked;
    const previousCount = bookmarkCount;

    const nextBookmarked = !previousBookmarked;

    const optimisticCount = Math.max(
      previousCount + (nextBookmarked ? 1 : -1),
      0,
    );

    updateBookmark(nextBookmarked, optimisticCount);
    bookmarkPendingRef.current = true;
    setBookmarkPending(true);

    try {
      const response = await setPostBookmark(item.id, nextBookmarked);
      if (!activeRef.current) return;

      const serverPost = response.post;

      const serverBookmarked =
        typeof serverPost?.bookmarked_by_current_user === "boolean"
          ? serverPost.bookmarked_by_current_user
          : nextBookmarked;

      const serverBookmarkCount =
        typeof serverPost?.bookmarks === "number"
          ? serverPost.bookmarks
          : optimisticCount;

      updateBookmark(serverBookmarked, serverBookmarkCount);

      onBookmarkChange?.(
        {
          ...item,
          ...serverPost,
          bookmarked_by_current_user: serverBookmarked,
          bookmarks: serverBookmarkCount,
        },
        serverBookmarked,
      );
    } catch (err: unknown) {
      if (!activeRef.current) return;
      updateBookmark(previousBookmarked, previousCount);

      const message = isAxiosError<{
        error?: string;
      }>(err)
        ? err.response?.data?.error || err.message || "Failed to bookmark post"
        : err instanceof Error
          ? err.message
          : "Failed to bookmark post";

      setFeedbackModal({
        title: "Bookmark failed",
        message,
      });
    } finally {
      bookmarkPendingRef.current = false;
      if (activeRef.current) setBookmarkPending(false);
    }
  };

  const handleSharePress = async () => {
    if (currentUserId == null || String(currentUserId) === String(item.user_id)) return;
    if (sharePendingRef.current) {
      return;
    }

    sharePendingRef.current = true;
    setSharePending(true);

    try {
      const response = await sharePost(item.id);
      if (!activeRef.current) return;

      const serverPost = response.post;

      if (typeof serverPost?.shares === "number") {
        updateShareCount(serverPost.shares);
      } else if (response.didCreateShare) {
        updateShareCount(shareCount + 1);
      }

      handleMutationAwards(response.newlyAwardedBadges);
    } catch (err: unknown) {
      if (!activeRef.current) return;
      const message = isAxiosError<{
        error?: string;
      }>(err)
        ? err.response?.data?.error || err.message || "Failed to share post"
        : err instanceof Error
          ? err.message
          : "Failed to share post";

      setFeedbackModal({
        title: "Post shared",
        message: `Your post was shared, but the share count could not be updated. ${message}`,
      });
    } finally {
      sharePendingRef.current = false;
      if (activeRef.current) setSharePending(false);
    }
  };


  return {
    liked, likeCount, bookmarked, bookmarkCount, shareCount,
    bookmarkPending, sharePending, feedbackModal,
    dismissFeedback: () => setFeedbackModal(null),
    toggleLikePress, handleBookmarkPress, handleSharePress,
  };
}
