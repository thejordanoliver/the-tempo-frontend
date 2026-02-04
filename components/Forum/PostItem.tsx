// components/Forum/PostItem.tsx
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Colors, Fonts } from "constants/Styles";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { BlurView } from "expo-blur";
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
import { getAccessToken } from "utils/authStorage";
import AlertModal from "./AlertModal";
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
  token: string | null;
  currentUserId: number | null;
  deletePost: (postId: string) => void;
  editPost: (postId: string, newText: string) => void;
  BASE_URL: string;
  onImagePress: (uri: string, caption?: string) => void;
  disableCommentNavigation?: boolean;
}

export const PostItem = memo(function PostItem({
  item,
  isDark,
  token,
  currentUserId,
  deletePost,
  editPost,
  BASE_URL,
  onImagePress,
  disableCommentNavigation,
}: PostItemProps) {
  const { likes, setLike, toggleLike } = useLikesStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const router = useRouter();
  const styles = postItemStyles(isDark);

  const profileImageUri = item.profile_image
    ? item.profile_image.startsWith("http")
      ? item.profile_image
      : `${BASE_URL}${item.profile_image}`
    : null;

  const IMG_BASE_URL = `${BASE_URL}/uploads/forum-images/`;

  const postImages = (item.images ?? []).map((img) => {
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads/forum-images/")) {
      return `${IMG_BASE_URL}${img.split("/uploads/forum-images/")[1]}`;
    }
    return `${IMG_BASE_URL}${img}`;
  });

  const postVideos = (item.videos ?? []).map((vid) => {
    if (vid.startsWith("http")) return vid;
    if (vid.startsWith("/uploads/forum-images/")) {
      return `${IMG_BASE_URL}${vid.split("/uploads/forum-images/")[1]}`;
    }
    return `${IMG_BASE_URL}${vid}`;
  });

  const postVideoThumbnails = (item.video_thumbnails ?? []).map((thumb) => {
    if (!thumb) return null;
    if (thumb.startsWith("http")) return thumb;
    if (thumb.startsWith("/uploads/forum-images/")) {
      return `${IMG_BASE_URL}${thumb.split("/uploads/forum-images/")[1]}`;
    }
    return `${IMG_BASE_URL}${thumb}`;
  });

  const media: MediaItem[] = [
    ...postImages.map((uri, index) => ({
      id: `img-${item.id}-${index}`,
      type: "image" as const,
      uri,
    })),
    ...postVideos.map((uri, index) => ({
      id: `vid-${item.id}-${index}`,
      type: "video" as const,
      uri,
      thumbnailUri: postVideoThumbnails?.[index] ?? undefined,
    })),
  ];

  // Initialize store only once on mount
  useEffect(() => {
    if (!likes[item.id]) {
      setLike(item.id, item.liked_by_current_user, item.likes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const likeState = useLikesStore((state) => state.likes[item.id]);

  // fallback values if not yet initialized
  const liked = likeState?.liked ?? item.liked_by_current_user;
  const likeCount = likeState?.count ?? item.likes;

  const toggleLikePress = async () => {
    let authToken = token ?? (await getAccessToken());

    if (!authToken) {
      alert("You must be logged in to like posts.");
      return;
    }

    // Optimistic UI update
    toggleLike(item.id);

    try {
      await axios.patch(
        `${BASE_URL}/api/forum/post/${item.id}/like`,
        { like: !liked },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (err: any) {
      // rollback on failure
      toggleLike(item.id);
      alert(
        err.response?.data?.error || err.message || "Failed to toggle like"
      );
    }
  };

  const isAuthor =
    currentUserId != null && String(currentUserId) === String(item.user_id);

  const confirmDelete = () => setShowDeleteModal(true);
  const handleDeleteConfirm = () => {
    deletePost(item.id);
    setShowDeleteModal(false);
    setDropdownVisible(false);
  };
  const handleDeleteCancel = () => setShowDeleteModal(false);

  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const showDropdown = () => {
    setDropdownVisible(true);
    Animated.timing(dropdownAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  };

  const hideDropdown = () => {
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(() => setDropdownVisible(false));
  };

  const onSaveEdit = () => {
    if (editText.trim() && editText !== item.text) {
      editPost(item.id, editText);
    }
    setIsEditing(false);
    setDropdownVisible(false);
  };

  const getTextStyle = (isDark: boolean, isDelete?: boolean) => ({
    fontSize: 18,
    color: isDelete
      ? isDark
        ? Colors.dark.lightRed
        : Colors.light.red
      : isDark
      ? Colors.white
      : Colors.black,
    fontFamily: Fonts.OSREGULAR,
    paddingVertical: 8,
    paddingHorizontal: 12,
  });

  return (
    <View style={styles.container}>
      <View style={styles.postContainer}>
        {/* User Row */}
        <View style={styles.userRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => router.push(`/user/${item.user_id}`)}
              activeOpacity={0.7}
            >
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
                    {item.username[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/user/${item.user_id}`)}
              activeOpacity={0.7}
              style={{ marginLeft: 4 }}
            >
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
          </View>

          {isAuthor && (
            <TouchableOpacity
              onPress={() =>
                dropdownVisible ? hideDropdown() : showDropdown()
              }
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown */}
        {dropdownVisible && (
          <Animated.View
            style={[
              styles.dropdownMenu,
              {
                opacity: dropdownAnim,
                transform: [
                  {
                    translateY: dropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <BlurView
              intensity={50}
              tint="systemChromeMaterial"
              style={{
                borderRadius: 8,
                borderTopRightRadius: 4,
                overflow: "hidden",
              }}
            >
              <View style={styles.dropdownItem}>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(true);
                    hideDropdown();
                  }}
                >
                  <Text style={getTextStyle(isDark)}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={confirmDelete}>
                  <Text style={getTextStyle(isDark, true)}>Delete</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        )}

        {/* Post Content */}
        {isEditing ? (
          <TextInput
            style={styles.editPostText}
            multiline
            value={editText}
            onChangeText={setEditText}
          />
        ) : (
          <View style={styles.postTextWrapper}>
            <Text style={styles.postText}>{item.text}</Text>
            {media.length > 0 && <PostImages media={media} item={item} />}
          </View>
        )}

        {/* Footer */}
        <View style={styles.postFooter}>
          {isEditing ? (
            <View style={styles.editActionsContainer}>
              <TouchableOpacity style={styles.button} onPress={onSaveEdit}>
                <Text style={styles.saveText}>Save</Text>
                <Ionicons
                  name="checkmark"
                  size={30}
                  color={isDark ? Colors.dark.limeGreen : Colors.light.green}
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
                          pathname: "/comment-thread/[postId]",
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
              <View style={styles.timeWrapper}>
                <Text style={styles.timestamp}>
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                  }).replace(/^about /, "")}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <AlertModal
        title="Delete Post"
        message="Are you sure you want to delete this post?"
        visible={showDeleteModal}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        isDark={isDark}
      />
    </View>
  );
});
