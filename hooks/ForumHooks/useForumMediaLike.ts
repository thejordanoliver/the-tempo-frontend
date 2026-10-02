import { useEffect, useRef, useState } from "react";
import { useBadgeNotifications } from "hooks/ForumHooks/useBadgeNotifications";
import { setPostLike } from "services/forumApi";
import { useLikesStore } from "store/useLikesStore";
import type { ForumPostImagesModalProps } from "types/forum";

type Options = Pick<ForumPostImagesModalProps,
  "postId" | "likedByCurrentUser" | "likesCount" | "postAuthorUserId" | "currentUserId">;

export function useForumMediaLike({
  postId, likedByCurrentUser = false, likesCount = 0, postAuthorUserId, currentUserId,
}: Options) {
  const [pending, setPending] = useState({ postId, pending: false });
  const likePending = pending.postId === postId && pending.pending;
  const pendingRef = useRef(false);
  const requestVersion = useRef(0);

  useEffect(() => {
    pendingRef.current = false;
    return () => { requestVersion.current += 1; };
  }, [postId]);

  const setLike = useLikesStore((state) => state.setLike);
  const likeState = useLikesStore((state) => state.likes[postId]);
  const { handleBadgeAwards } = useBadgeNotifications();
  /* -------------------- Likes -------------------- */

  useEffect(() => {
    if (!likeState && postId) {
      setLike(postId, likedByCurrentUser, likesCount);
    }
  }, [likeState, likedByCurrentUser, likesCount, postId, setLike]);

  const liked = likeState?.liked ?? likedByCurrentUser;
  const likeCount = likeState?.count ?? likesCount;

  const toggleLikePress = async () => {
    if (!postId || pendingRef.current) return;
    const version = requestVersion.current;
    pendingRef.current = true;

    const nextLiked = !liked;
    const optimisticCount = Math.max(likeCount + (liked ? -1 : 1), 0);

    setLike(postId, nextLiked, optimisticCount);
    setPending({ postId, pending: true });

    try {
      const response = await setPostLike(postId, nextLiked);
      if (version !== requestVersion.current) return;

      const serverPost = response.post;

      setLike(
        postId,
        typeof serverPost?.liked_by_current_user === "boolean"
          ? serverPost.liked_by_current_user
          : nextLiked,
        typeof serverPost?.likes === "number"
          ? serverPost.likes
          : optimisticCount,
      );

      if (currentUserId != null && currentUserId === postAuthorUserId) {
        handleBadgeAwards(response.newlyAwardedBadges);
      } else if (__DEV__ && response.newlyAwardedBadges?.length) {
        console.warn(
          "Ignoring badge awards returned for a post author on another user's device.",
        );
      }
    } catch {
      if (version !== requestVersion.current) return;
      setLike(postId, liked, likeCount);
    } finally {
      if (version === requestVersion.current) {
        pendingRef.current = false;
        setPending({ postId, pending: false });
      }
    }
  };


  return { liked, likeCount, likePending, toggleLikePress };
}
