import { useScopedRouter } from "hooks/useScopedRouter";
import { useForumPostInteractions } from "hooks/ForumHooks/useForumPostInteractions";
import { PostItemStyles } from "styles/ForumStyles/PostItemStyles";
import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "components/ConfirmModal";
import { Colors } from "constants/styles";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { memo, useRef } from "react";
import PostShareModal, { type PostShareModalRef } from "components/Forum/PostShareModal";
import { Text, TouchableOpacity, View } from "react-native";
import type { ForumPost } from "types/forum";

export type InteractionsProps = {
  item: ForumPost;
  isDark: boolean;
  currentUserId: number | null;
  onBookmarkChange?: (post: ForumPost, bookmarked: boolean) => void;
  disableCommentNavigation?: boolean;
};

export const Interactions = memo(function Interactions({
  item,
  isDark,
  currentUserId,
  onBookmarkChange,
  disableCommentNavigation,
}: InteractionsProps) {

  const shareSheet = useRef<PostShareModalRef>(null);
  const router = useScopedRouter();
  const styles = PostItemStyles(isDark);
  const {
    liked, likeCount, bookmarked, bookmarkCount, shareCount,
    bookmarkPending, sharePending, feedbackModal, dismissFeedback,
    toggleLikePress, handleBookmarkPress, handleSharePress,
  } = useForumPostInteractions({ item, currentUserId, onBookmarkChange });
  const timestamp = formatDistanceToNow(new Date(item.created_at), {
    addSuffix: true,
  }).replace(/^about /, "");
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
      <View style={styles.interactionContainer}>
        <View style={styles.interactionWrapper}>
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
                name={liked ? "heart" : "heart-outline"}
                size={28}
                color={isDark ? Colors.white : Colors.black}
              />

              <Text style={styles.count}>{likeCount}</Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity
              onPress={handleCommentPress}
              disabled={disableCommentNavigation}
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
                color={isDark ? Colors.white : Colors.black}
              />

              <Text style={styles.count}>{item.comments_count}</Text>
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
              <Text style={styles.count}>{bookmarkCount}</Text>

              <Ionicons
                name={bookmarked ? "bookmark" : "bookmark-outline"}
                size={28}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              onPress={() => shareSheet.current?.present()}
              accessibilityRole="button"
              accessibilityLabel="Share post"
              disabled={sharePending}
              style={[
                styles.buttonContainer,
                sharePending && {
                  opacity: 0.6,
                },
              ]}
            >
              <Text style={styles.count}>{shareCount}</Text>

              <Ionicons
                name="share-social-outline"
                size={28}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp} numberOfLines={1}>
          {timestamp}
        </Text>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/*                         Interaction Error                          */}
      {/* ------------------------------------------------------------------ */}

      <PostShareModal ref={shareSheet} post={item} currentUserId={currentUserId} onShared={handleSharePress} />

      <ConfirmModal
        title={feedbackModal?.title}
        message={feedbackModal?.message}
        visible={Boolean(feedbackModal)}
        onCancel={dismissFeedback}
        onConfirm={dismissFeedback}
        confirmText="OK"
        showCancel={false}
      />
    </>
  );
});
