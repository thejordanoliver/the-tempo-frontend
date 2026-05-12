// components/Forum/PostItem.tsx

import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "components/ConfirmModal";
import { Colors, Fonts } from "constants/styles";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useRouter } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLikesStore } from "store/useLikesStore";
import { postItemStyles } from "styles/ForumStyles/PostItemStyles";
import { apiClient } from "utils/apiClient";
import PollBlock from "./PollBlock";
import PostImages, { MediaItem } from "./PostImages";

export interface Post {
  id: string;
  username: string;
  full_name: string | null;
  profile_image: string | null;
  text: string;
  likes: number;
  comments_count: number;
  created_at: string;
  user_id: string | number;
  liked_by_current_user: boolean;
  images?: string[];
  videos?: string[];
  video_thumbnails?: (string | null)[];
}

interface PostItemProps {
  item: Post;
  isDark: boolean;
  currentUserId: number | null;
  deletePost: (postId: string) => void;
  editPost: (postId: string, newText: string) => void;
  onImagePress: (uri: string, caption?: string) => void;
  disableCommentNavigation?: boolean;
}

type PostSubmenuProps = {
  visible: boolean;
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

const PostSubmenu = ({
  visible,
  isDark,
  onEdit,
  onDelete,
}: PostSubmenuProps) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);
  const styles = postItemStyles(isDark);
  useEffect(() => {
    if (visible) {
      setShouldRender(true);

      Animated.spring(progress, {
        toValue: 1,
        damping: 16,
        stiffness: 230,
        mass: 0.8,
        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 130,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setShouldRender(false);
    });
  }, [progress, visible]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.submenu,
        {
          opacity: progress,
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
          borderColor: isDark ? Colors.darkGray : Colors.lightGray,
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
        <View
          style={[
            styles.submenuIconWrap,
            { backgroundColor: isDark ? Colors.black : Colors.white },
          ]}
        >
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

        <Text
          style={[
            styles.submenuText,
            { color: isDark ? Colors.dark.lightRed : Colors.light.red },
          ]}
        >
          Delete
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const PostItem = memo(function PostItem({
  item,
  isDark,
  currentUserId,
  deletePost,
  editPost,
  disableCommentNavigation,
}: PostItemProps) {
  const { likes, setLike, toggleLike } = useLikesStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submenuVisible, setSubmenuVisible] = useState(false);

  const router = useRouter();
  const styles = postItemStyles(isDark);

  const profileImageUri = item.profile_image;

  const media: MediaItem[] = [
    ...(item.images ?? []).map((uri, index) => ({
      id: `img-${item.id}-${index}`,
      type: "image" as const,
      uri,
    })),
    ...(item.videos ?? []).map((uri, index) => ({
      id: `vid-${item.id}-${index}`,
      type: "video" as const,
      uri,
      thumbnailUri: item.video_thumbnails?.[index] ?? undefined,
    })),
  ];

  useEffect(() => {
    setEditText(item.text);
  }, [item.text]);

  useEffect(() => {
    if (!likes[item.id]) {
      setLike(item.id, item.liked_by_current_user, item.likes);
    }
  }, [item.id, item.liked_by_current_user, item.likes, likes, setLike]);

  useEffect(() => {
    if (isEditing) {
      setSubmenuVisible(false);
    }
  }, [isEditing]);

  const likeState = useLikesStore((state) => state.likes[item.id]);
  const liked = likeState?.liked ?? item.liked_by_current_user;
  const likeCount = likeState?.count ?? item.likes;

  const isAuthor =
    currentUserId != null && String(currentUserId) === String(item.user_id);

  const timestamp = formatDistanceToNow(new Date(item.created_at), {
    addSuffix: true,
  }).replace(/^about /, "");

  const toggleLikePress = async () => {
    toggleLike(item.id);

    try {
      await apiClient.patch(`/api/forum/post/${item.id}/like`, {
        like: !liked,
      });
    } catch (err: any) {
      toggleLike(item.id);
      alert(
        err.response?.data?.error ?? err.message ?? "Failed to toggle like",
      );
    }
  };

  const handleOpenUser = () => {
    router.push({
      pathname: "/user/[id]",
      params: { id: item.user_id },
    });
  };

  const handleStartEdit = () => {
    setSubmenuVisible(false);
    setIsEditing(true);
  };

  const confirmDelete = () => {
    setSubmenuVisible(false);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    deletePost(item.id);
    setShowDeleteModal(false);
    setSubmenuVisible(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const onSaveEdit = () => {
    const nextText = editText.trim();

    if (nextText && nextText !== item.text) {
      editPost(item.id, nextText);
    }

    setIsEditing(false);
    setSubmenuVisible(false);
  };

  const onCancelEdit = () => {
    setEditText(item.text);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.postContainer}>
        <View style={styles.userRow}>
          <View style={styles.leftSide}>
            <TouchableOpacity onPress={handleOpenUser} activeOpacity={0.7}>
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.profilePlaceholder]}>
                  <Text
                    style={{ color: Colors.white, fontFamily: Fonts.OSBOLD }}
                  >
                    {(item.username?.[0] ?? "T").toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenUser}
              activeOpacity={0.7}
              style={styles.userRow}
            >
              <Text style={styles.username} numberOfLines={1}>
                {item.username}
              </Text>
            </TouchableOpacity>
          </View>

          {isAuthor ? (
            <View style={styles.menuAnchor}>
              <PostSubmenu
                visible={submenuVisible}
                isDark={isDark}
                onEdit={handleStartEdit}
                onDelete={confirmDelete}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSubmenuVisible((current) => !current)}
                style={[
                  styles.menuButton,
                  submenuVisible && {
                    borderColor: isDark ? Colors.darkGray : Colors.lightGray,
                    backgroundColor: isDark
                      ? Colors.darkGray
                      : Colors.lightGray,
                  },
                ]}
                hitSlop={8}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color={isDark ? Colors.white : Colors.black}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.menuPlaceholder} />
          )}
        </View>

        {isEditing ? (
          <TextInput
            style={styles.editPostText}
            multiline
            value={editText}
            onChangeText={setEditText}
            placeholder="Edit your post..."
            placeholderTextColor={isDark ? Colors.lightGray : Colors.darkGray}
            textAlignVertical="top"
          />
        ) : (
          <View style={styles.postTextWrapper}>
            {!!item.text && <Text style={styles.postText}>{item.text}</Text>}

            {media.length > 0 && <PostImages media={media} item={item} />}

            <PollBlock postId={item.id} isDark={isDark} />
          </View>
        )}

        <View style={styles.postFooter}>
          {isEditing ? (
            <View style={styles.editActionsContainer}>
              <TouchableOpacity style={styles.button} onPress={onSaveEdit}>
                <Text style={styles.saveText}>Save</Text>
                <Ionicons
                  name="checkmark"
                  size={30}
                  color={isDark ? Colors.dark.leafGreen : Colors.light.green}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={onCancelEdit}>
                <Text style={styles.cancelText}>Cancel</Text>
                <Ionicons
                  name="close"
                  size={30}
                  color={isDark ? Colors.dark.lightRed : Colors.light.red}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.interactionContainer}>
              <View style={styles.interactionWrapper}>
                <View style={styles.leftSide}>
                  <TouchableOpacity
                    onPress={toggleLikePress}
                    style={styles.likeButtonContainer}
                  >
                    <Ionicons
                      name={liked ? "heart" : "heart-outline"}
                      size={28}
                      color={isDark ? Colors.white : Colors.black}
                    />

                    <Text style={styles.count}>{likeCount}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (!disableCommentNavigation) {
                        router.push({
                          pathname: "/post/[postId]",
                          params: { postId: item.id },
                        });
                      }
                    }}
                    style={styles.likeButtonContainer}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={28}
                      color={isDark ? Colors.white : Colors.black}
                    />

                    <Text style={styles.count}>{item.comments_count}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.rightSide}>
                  <TouchableOpacity style={styles.likeButtonContainer}>
                    <Text style={styles.count}>0</Text>

                    <Ionicons
                      name="bookmark-outline"
                      size={28}
                      color={isDark ? Colors.white : Colors.black}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.likeButtonContainer}>
                    <Text style={styles.count}>0</Text>

                    <Ionicons
                      name="share-social-outline"
                      size={28}
                      color={isDark ? Colors.white : Colors.black}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.timestamp} numberOfLines={1}>
                {timestamp}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ConfirmModal
        title="Delete Post"
        message="This action can't be undone. The post and its replies will be permanently deleted."
        visible={showDeleteModal}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </View>
  );
});
