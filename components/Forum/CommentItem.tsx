import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "components/ConfirmModal";
import { Post } from "components/Forum/PostItem";
import { Colors } from "constants/styles";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated as RNAnimated,
  Easing as RNEasing,
  Image,
  PixelRatio,
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
import { commentItemStyles } from "styles/ForumStyles/PostItemStyles";
import { AlertConfig } from "types/alert";
import PostImages, { MediaItem } from "./PostImages";

interface CommentItemProps {
  comment: Post;
  postId: string;
  isDark: boolean;
  currentUserId: string | number;
  editComment: (commentId: string, newText: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  isLast: boolean;
}

const COLLAPSED_HEIGHT = Math.round(3 * 20 * PixelRatio.getFontScale());

type CommentSubmenuProps = {
  visible: boolean;
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

const CommentSubmenu = ({
  visible,
  isDark,
  onEdit,
  onDelete,
}: CommentSubmenuProps) => {
  const progress = useRef(new RNAnimated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);
  const styles = useMemo(() => commentItemStyles(isDark), [isDark]);

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
        activeOpacity={0.85}
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
        activeOpacity={0.85}
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
  isLast,
}: CommentItemProps) => {
  const styles = useMemo(() => commentItemStyles(isDark), [isDark]);
  const router = useRouter();

  const commentText = comment.text ?? "";
  const hasText = commentText.trim().length > 0;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(commentText);
  const [textExpanded, setTextExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [submenuVisible, setSubmenuVisible] = useState(false);

  const animatedHeight = useSharedValue(COLLAPSED_HEIGHT);

  const isAuthor = String(currentUserId) === String(comment.user_id);
  const profileImageUri = comment.profile_image?.trim() || null;
  const profileInitial = (comment.username?.[0] ?? "T").toUpperCase();

  const media = useMemo<MediaItem[]>(
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
      params: { id: comment.user_id },
    });
  };

  const confirmDelete = () => {
    setSubmenuVisible(false);

    setAlertConfig({
      title: "Delete Comment",
      message:
        "This action can't be undone. The comment will be permanently deleted.",
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

  return (
    <View
      style={[
        styles.container,
        submenuVisible && styles.containerMenuOpen,
      ]}
    >
      <View style={[styles.commentContainer, isLast && styles.lastContainer]}>
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
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.profilePlaceholder]}>
                  <Text style={styles.profileInitial}>{profileInitial}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isEditing}
              onPress={handleOpenUser}
              style={styles.userMeta}
            >
              <Text style={styles.username} numberOfLines={1}>
                {comment.username}
              </Text>
              <Text style={styles.timestamp} numberOfLines={1}>
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
                activeOpacity={0.85}
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
                activeOpacity={0.85}
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
                activeOpacity={0.85}
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
                      style={styles.commentText}
                      numberOfLines={textExpanded ? undefined : 3}
                    >
                      {commentText}
                    </Text>
                  </Reanimated.View>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setTextExpanded((prev) => !prev)}
                    style={styles.expandButton}
                  >
                    <Text style={styles.expandText}>
                      {textExpanded ? "Show less" : "Show more"}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    pointerEvents="none"
                    style={[styles.commentText, styles.measureText]}
                    onLayout={(event) =>
                      setFullHeight(event.nativeEvent.layout.height)
                    }
                  >
                    {commentText}
                  </Text>
                </>
              ) : (
                <Text style={styles.commentText}>{commentText}</Text>
              ))}

            {media.length > 0 && (
              <View
                style={[
                  styles.commentMediaWrapper,
                  !hasText && styles.mediaOnlyWrapper,
                ]}
              >
                <PostImages media={media} item={comment} />
              </View>
            )}
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
