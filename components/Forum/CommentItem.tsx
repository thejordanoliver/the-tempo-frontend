import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "components/ConfirmModal";
import { Colors, activeOpacity } from "constants/styles";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  PixelRatio,
  Animated as RNAnimated,
  Easing as RNEasing,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CommentItemStyles } from "styles/ForumStyles/PostItemStyles";
import { AlertConfig } from "types/alert";
import type {
  ForumActionSubmenuProps,
  ForumComment,
  ForumCommentItemProps,
  ForumDisplayMediaItem,
  ForumPostImageItem,
} from "types/forum";
import PostImages from "./PostImages";

const COLLAPSED_HEIGHT = Math.round(3 * 20 * PixelRatio.getFontScale());
const REPLY_COLLAPSE_THRESHOLD = 3;

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

function formatReplyCount(count: number) {
  return `${count} ${count === 1 ? "reply" : "replies"}`;
}

const CommentSubmenu = ({
  visible,
  isDark,
  onEdit,
  onDelete,
}: ForumActionSubmenuProps) => {
  const progress = useRef(new RNAnimated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);
  const styles = useMemo(() => CommentItemStyles(isDark), [isDark]);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);

      RNAnimated.spring(progress, {
        toValue: 1,
        damping: 16,
        stiffness: 230,
        mass: 0.8,
        useNativeDriver: true,
      }).start();

      return;
    }

    RNAnimated.timing(progress, {
      toValue: 0,
      duration: 130,
      easing: RNEasing.in(RNEasing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setShouldRender(false);
    });
  }, [progress, visible]);

  if (!shouldRender) return null;

  return (
    <RNAnimated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.submenu,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0],
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={styles.submenuItem}
        onPress={onEdit}
      >
        <View style={styles.submenuIconWrap}>
          <Ionicons
            name="create-outline"
            size={16}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>

        <Text style={styles.submenuText}>Edit</Text>
      </TouchableOpacity>

      <View style={styles.submenuSeparator} />

      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={styles.submenuItem}
        onPress={onDelete}
      >
        <View style={styles.submenuIconWrap}>
          <Ionicons
            name="trash-outline"
            size={16}
            color={isDark ? Colors.dark.lightRed : Colors.light.red}
          />
        </View>

        <Text style={[styles.submenuText, styles.deleteSubmenuText]}>
          Delete
        </Text>
      </TouchableOpacity>
    </RNAnimated.View>
  );
};

export const CommentItem = ({
  comment,
  postId,
  isDark,
  currentUserId,
  editComment,
  deleteComment,
  onReply,
  isReply = false,
  isLast,
}: ForumCommentItemProps) => {
  const styles = useMemo(() => CommentItemStyles(isDark), [isDark]);
  const router = useRouter();

  const commentText = comment.text ?? "";
  const hasText = commentText.trim().length > 0;
  const replies = useMemo(
    () => (isReply ? [] : sortReplies(comment.replies ?? [])),
    [comment.replies, isReply],
  );
  const replyCount = replies.length;
  const shouldCollapseReplies = replyCount >= REPLY_COLLAPSE_THRESHOLD;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(commentText);
  const [textExpanded, setTextExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const previousReplyCountRef = useRef(replyCount);

  const animatedHeight = useSharedValue(COLLAPSED_HEIGHT);

  const isAuthor = currentUserId != null && comment.user_id === currentUserId;
  const profileImageUri = comment.profile_image?.trim() || null;
  const profileInitial = (comment.username?.[0] ?? "T").toUpperCase();

  const media = useMemo<ForumDisplayMediaItem[]>(
    () => [
      ...(comment.images ?? []).map((uri, index) => ({
        id: `comment-img-${comment.id}-${index}`,
        type: "image" as const,
        uri,
      })),
      ...(comment.videos ?? []).map((uri, index) => ({
        id: `comment-vid-${comment.id}-${index}`,
        type: "video" as const,
        uri,
        thumbnailUri: comment.video_thumbnails?.[index] ?? undefined,
      })),
    ],
    [comment.id, comment.images, comment.video_thumbnails, comment.videos],
  );
  const mediaItem = useMemo<ForumPostImageItem>(
    () => ({
      id: String(comment.id),
      text: comment.text ?? "",
      likes: 0,
      comments_count: 0,
      liked_by_current_user: false,
      username: comment.username,
      profile_image: comment.profile_image ?? null,
      user_id: comment.user_id,
    }),
    [
      comment.id,
      comment.profile_image,
      comment.text,
      comment.user_id,
      comment.username,
    ],
  );

  useEffect(() => {
    setEditText(commentText);
    setTextExpanded(false);
    setFullHeight(0);
  }, [commentText]);

  useEffect(() => {
    if (isEditing) {
      setSubmenuVisible(false);
    }
  }, [isEditing]);

  useEffect(() => {
    if (
      replyCount >= REPLY_COLLAPSE_THRESHOLD &&
      replyCount > previousReplyCountRef.current
    ) {
      setRepliesExpanded(true);
    }

    previousReplyCountRef.current = replyCount;
  }, [replyCount]);

  const shouldShowExpand =
    hasText && (commentText.length > 100 || commentText.split("\n").length > 3);

  useEffect(() => {
    if (!shouldShowExpand) return;

    animatedHeight.value = withTiming(
      textExpanded ? Math.max(fullHeight, COLLAPSED_HEIGHT) : COLLAPSED_HEIGHT,
      {
        duration: 140,
        easing: Easing.inOut(Easing.ease),
      },
    );
  }, [animatedHeight, fullHeight, shouldShowExpand, textExpanded]);

  const heightStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const timestamp = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
  }).replace(/^about /, "");

  const closeAlert = () => setAlertConfig(null);

  const handleOpenUser = () => {
    if (isEditing) return;

    router.push({
      pathname: "/user/[id]",
      params: { id: String(comment.user_id) },
    });
  };

  const confirmDelete = () => {
    setSubmenuVisible(false);

    setAlertConfig({
      title: isReply ? "Delete Reply" : "Delete Comment",
      message:
        isReply
          ? "This action can't be undone. The reply will be permanently deleted."
          : "This action can't be undone. The comment will be permanently deleted.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        await deleteComment(postId, comment.id);
        closeAlert();
      },
    });
  };

  const handleStartEdit = () => {
    setSubmenuVisible(false);
    setEditText(commentText);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const nextText = editText.trim();

    if (nextText && nextText !== commentText.trim()) {
      await editComment(comment.id, nextText);
    }

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(commentText);
    setIsEditing(false);
  };

  const toggleSubmenu = () => {
    if (isEditing) return;

    setSubmenuVisible((current) => !current);
  };

  const handleReplyPress = () => {
    if (isEditing || isReply) return;

    onReply?.(comment);
  };

  const visibleReplies =
    shouldCollapseReplies && !repliesExpanded ? [] : replies;

  return (
    <View
      style={[
        styles.container,
        isReply && styles.replyRoot,
        submenuVisible && styles.containerMenuOpen,
      ]}
    >
      <View
        style={[
          styles.commentContainer,
          isReply && styles.replyCommentContainer,
          isLast && !isReply && styles.lastContainer,
        ]}
      >
        <View style={styles.userRow}>
          <View style={styles.leftSide}>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isEditing}
              onPress={handleOpenUser}
              style={styles.avatarButton}
            >
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={[
                    styles.profileImage,
                    isReply && styles.replyProfileImage,
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.profileImage,
                    isReply && styles.replyProfileImage,
                    styles.profilePlaceholder,
                  ]}
                >
                  <Text
                    style={[
                      styles.profileInitial,
                      isReply && styles.replyProfileInitial,
                    ]}
                  >
                    {profileInitial}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isEditing}
              onPress={handleOpenUser}
              style={styles.userMeta}
            >
              <Text
                style={[styles.username, isReply && styles.replyUsername]}
                numberOfLines={1}
              >
                {comment.username}
              </Text>
              <Text
                style={[styles.timestamp, isReply && styles.replyTimestamp]}
                numberOfLines={1}
              >
                {timestamp}
              </Text>
            </TouchableOpacity>
          </View>

          {isAuthor ? (
            <View style={styles.menuAnchor}>
              <CommentSubmenu
                visible={submenuVisible}
                isDark={isDark}
                onEdit={handleStartEdit}
                onDelete={confirmDelete}
              />

              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={toggleSubmenu}
                style={[
                  styles.menuButton,
                  submenuVisible && styles.menuButtonActive,
                ]}
                hitSlop={8}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color={isDark ? Colors.white : Colors.black}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.menuPlaceholder} />
          )}
        </View>

        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              multiline
              value={editText}
              onChangeText={setEditText}
              placeholder="Edit your comment..."
              placeholderTextColor={isDark ? Colors.lightGray : Colors.darkGray}
              textAlignVertical="top"
            />

            <View style={styles.editActionsContainer}>
              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={handleCancelEdit}
                style={styles.editButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? Colors.dark.lightRed : Colors.light.red}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={handleSaveEdit}
                style={styles.editButton}
              >
                <Text style={styles.saveText}>Save</Text>
                <Ionicons
                  name="checkmark"
                  size={22}
                  color={isDark ? Colors.dark.leafGreen : Colors.light.green}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.commentBody}>
            {hasText &&
              (shouldShowExpand ? (
                <>
                  <Reanimated.View
                    style={[styles.commentTextClip, heightStyle]}
                  >
                    <Text
                      style={[
                        styles.commentText,
                        isReply && styles.replyText,
                      ]}
                      numberOfLines={textExpanded ? undefined : 3}
                    >
                      {commentText}
                    </Text>
                  </Reanimated.View>

                  <TouchableOpacity
                    activeOpacity={activeOpacity}
                    onPress={() => setTextExpanded((prev) => !prev)}
                    style={styles.expandButton}
                  >
                    <Text style={styles.expandText}>
                      {textExpanded ? "Show less" : "Show more"}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    pointerEvents="none"
                    style={[
                      styles.commentText,
                      isReply && styles.replyText,
                      styles.measureText,
                    ]}
                    onLayout={(event) =>
                      setFullHeight(event.nativeEvent.layout.height)
                    }
                  >
                    {commentText}
                  </Text>
                </>
              ) : (
                <Text style={[styles.commentText, isReply && styles.replyText]}>
                  {commentText}
                </Text>
              ))}

            {media.length > 0 && (
              <View
                style={[
                  styles.commentMediaWrapper,
                  isReply && styles.replyMediaWrapper,
                  !hasText && styles.mediaOnlyWrapper,
                ]}
              >
                <PostImages
                  media={media}
                  item={mediaItem}
                  currentUserId={currentUserId}
                />
              </View>
            )}
          </View>
        )}

        {!isEditing && !isReply && (
          <View style={styles.commentActionsRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Reply to ${comment.username}`}
              activeOpacity={activeOpacity}
              onPress={handleReplyPress}
              style={styles.replyActionButton}
            >
              <Text style={styles.replyActionText}>Reply</Text>
            </TouchableOpacity>

            {replyCount > 0 && !shouldCollapseReplies && (
              <Text style={styles.replyCountText}>
                {formatReplyCount(replyCount)}
              </Text>
            )}
          </View>
        )}

        {!isReply && replyCount > 0 && (
          <View style={styles.repliesContainer}>
            {shouldCollapseReplies && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={
                  repliesExpanded
                    ? `Hide replies to ${comment.username}`
                    : `View ${formatReplyCount(replyCount)} to ${comment.username}`
                }
                activeOpacity={activeOpacity}
                onPress={() => setRepliesExpanded((current) => !current)}
                style={styles.viewRepliesButton}
              >
                <Text style={styles.viewRepliesText}>
                  {repliesExpanded
                    ? "Hide replies"
                    : `View ${formatReplyCount(replyCount)}`}
                </Text>
              </TouchableOpacity>
            )}

            {visibleReplies.map((reply, index) => (
              <CommentItem
                key={String(reply.id)}
                comment={reply}
                postId={postId}
                isDark={isDark}
                currentUserId={currentUserId}
                editComment={editComment}
                deleteComment={deleteComment}
                isReply
                isLast={index === visibleReplies.length - 1}
              />
            ))}
          </View>
        )}
      </View>

      <ConfirmModal
        visible={!!alertConfig}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        showCancel={alertConfig?.showCancel ?? !!alertConfig?.cancelText}
        confirmDisabled={alertConfig?.confirmDisabled}
        variant={alertConfig?.variant ?? "default"}
        onCancel={closeAlert}
        onConfirm={async () => {
          if (alertConfig?.onConfirm) {
            await alertConfig.onConfirm();
            return;
          }

          closeAlert();
        }}
      />
    </View>
  );
};
