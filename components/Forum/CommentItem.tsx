import { Ionicons } from "@expo/vector-icons";
import AlertModal from "components/Forum/AlertModal";
import { Colors } from "constants/styles";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import { AlertConfig } from "hooks/ForumHooks/useCreatePost";
import React, { useEffect, useState } from "react";
import {
  Image,
  PixelRatio,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { commentItemStyles } from "styles/ForumStyles/CommentItemStyles";
import { Post } from "./PostItem";

interface CommentItemProps {
  comment: Post;
  postId: string;
  isDark: boolean;
  BASE_URL: string;
  currentUserId: string | number;
  editComment: (commentId: string, newText: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  isLast: boolean;
}

const COLLAPSED_HEIGHT = Math.round(3 * 20 * PixelRatio.getFontScale());
const ACTION_WIDTH = 180;

type RightActionsProps = {
  dragX: SharedValue<number>;
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

const RightActions = ({
  dragX,
  isDark,
  onEdit,
  onDelete,
}: RightActionsProps) => {
  const styles = commentItemStyles(isDark);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      dragX.value,
      [-ACTION_WIDTH, 0],
      [0, ACTION_WIDTH],
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Animated.View style={[styles.actionsContainer, animatedStyle]}>
      <View style={styles.actionWrapper}>
        <TouchableOpacity style={styles.confirmButton} onPress={onEdit}>
          <Ionicons name="create" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.actionWrapper}>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export const CommentItem = ({
  comment,
  postId,
  isDark,
  BASE_URL,
  currentUserId,
  editComment,
  deleteComment,
  isLast,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [textExpanded, setTextExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const swipeRef = React.useRef<SwipeableMethods>(null);
  const router = useRouter();

  const onPressUser = () => {
    router.push({
      pathname: "/user/[id]",
      params: { id: comment.user_id },
    });
  };

  const styles = commentItemStyles(isDark);

  /* ---------------- Height animation (Reanimated) ---------------- */
  const animatedHeight = useSharedValue(COLLAPSED_HEIGHT);

  useEffect(() => {
    animatedHeight.value = withTiming(
      textExpanded ? fullHeight || COLLAPSED_HEIGHT : COLLAPSED_HEIGHT,
      {
        duration: 140,
        easing: Easing.inOut(Easing.ease),
      },
    );
  }, [textExpanded, fullHeight]);

  const heightStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  /* ---------------- Helpers ---------------- */
  const showAlert = (config: AlertConfig) => setAlertConfig(config);
  const closeAlert = () => setAlertConfig(null);

  const profileUri = comment.profile_image
    ? comment.profile_image.startsWith("http")
      ? comment.profile_image
      : `${BASE_URL}${comment.profile_image}`
    : undefined;

  const isAuthor = String(currentUserId) === String(comment.user_id);

  const confirmDelete = () => {
    showAlert({
      title: "Delete Comment",
      message: "Are you sure you want to delete this comment?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        await deleteComment(postId, comment.id);
        closeAlert();
      },
    });
  };

  const onSaveEdit = async () => {
    if (editText.trim() && editText !== comment.text) {
      await editComment(comment.id, editText.trim());
    }
    setIsEditing(false);
  };

  /* ---------------- Swipe actions (ReanimatedSwipeable) ---------------- */
  const renderRightActions = (
    progress: SharedValue<number>,
    dragX: SharedValue<number>,
  ) => {
    if (!isAuthor || isEditing) return null;

    return (
      <RightActions
        dragX={dragX}
        isDark={isDark}
        onEdit={() => {
          swipeRef.current?.close(); // 👈 CLOSE IT
          setIsEditing(true);
        }}
        onDelete={() => {
          swipeRef.current?.close(); // optional but nice
          confirmDelete();
        }}
      />
    );
  };

  const rawTimeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
  });

  const timestamp = rawTimeAgo.startsWith("about ")
    ? rawTimeAgo.slice(6)
    : rawTimeAgo;

  /* ---------------- Render ---------------- */
  return (
    <View style={[styles.container, isLast && { borderBottomWidth: 0 }]}>
      <Swipeable
        ref={swipeRef}
        enabled={!isEditing}
        renderRightActions={renderRightActions}
      >
        <View>
          {/* Header */}
          <TouchableOpacity activeOpacity={0.75} onPress={onPressUser}>
            <View style={styles.user}>
              <Image
                source={profileUri ? { uri: profileUri } : undefined}
                style={styles.image}
              />
              <Text
                style={styles.username}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {comment.username}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Body */}
          {isEditing ? (
            <>
              <TextInput
                style={styles.editInputContainer}
                multiline
                value={editText}
                onChangeText={setEditText}
              />

              <View style={styles.editActionsContainer}>
                <TouchableOpacity onPress={onSaveEdit} style={styles.button}>
                  <Text style={styles.saveText}>Save</Text>
                  <Ionicons
                    name="checkmark"
                    size={30}
                    color={isDark ? Colors.dark.leafGreen : Colors.light.green}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                  <Ionicons
                    name="close"
                    size={30}
                    color={isDark ? Colors.dark.lightRed : Colors.light.red}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.commentContainer}>
              <Animated.View
                style={[
                  heightStyle,
                  {
                    overflow: "hidden",
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={styles.text}
                  numberOfLines={textExpanded ? undefined : 3}
                >
                  {comment.text}
                </Text>
              </Animated.View>

              {(comment.text.length > 100 ||
                comment.text.split("\n").length > 2) && (
                <TouchableOpacity
                  onPress={() => setTextExpanded(!textExpanded)}
                >
                  <Text style={styles.expandText}>
                    {textExpanded ? "Collapse" : "Expand"}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Measurement */}
              <Text
                pointerEvents="none"
                style={[
                  styles.text,
                  { position: "absolute", opacity: 0, width: "100%" },
                ]}
                onLayout={(e) => setFullHeight(e.nativeEvent.layout.height)}
              >
                {comment.text}
              </Text>

              <View style={styles.timestampContainer}>
                <Text style={styles.timestamp}>{timestamp}</Text>
              </View>
            </View>
          )}
        </View>

        <AlertModal
          visible={!!alertConfig}
          isDark={isDark}
          title={alertConfig?.title}
          message={alertConfig?.message}
          confirmText={alertConfig?.confirmText ?? "OK"}
          cancelText={alertConfig?.cancelText}
          onCancel={closeAlert}
          onConfirm={alertConfig?.onConfirm}
        />
      </Swipeable>
    </View>
  );
};
