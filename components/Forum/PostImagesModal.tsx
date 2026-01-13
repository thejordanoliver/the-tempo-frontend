import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  useColorScheme,
  View,
} from "react-native";
import { useLikesStore } from "store/useLikesStore";
import { getAccessToken } from "utils/authStorage";
import { MediaItem } from "./PostImages";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const screenWidth = Dimensions.get("window").width;
const COLLAPSED_LINES = 3;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PostImagesModalProps = {
  visible: boolean;
  postId: string;
  media: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  postText?: string;
  likesCount?: number;
  commentsCount?: number;
  likedByCurrentUser?: boolean;
  profileImage?: string | null;
  username?: string;
};

export default function PostImagesModal({
  visible,
  postId,
  media,
  initialIndex,
  onClose,
  postText,
  likesCount = 0,
  commentsCount = 0,
  likedByCurrentUser = false,
  profileImage,
  username,
}: PostImagesModalProps) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const flatListRef = useRef<FlatList<MediaItem>>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [isTruncated, setIsTruncated] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const videoRefs = useRef<Record<number, Video | null>>({});
  const [captionVisible, setCaptionVisible] = useState(true);
  const captionOpacity = useRef(new Animated.Value(1)).current;
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const { likes, setLike, toggleLike } = useLikesStore();
  const likeState = likes[postId];

  const fullProfileImageUri =
    profileImage && !profileImage.startsWith("http")
      ? `${BASE_URL}${profileImage}`
      : profileImage;

  /* -------------------- Likes -------------------- */

  useEffect(() => {
    if (!likeState && postId) {
      setLike(postId, likedByCurrentUser, likesCount);
    }
  }, [postId]);

  const liked = likeState?.liked ?? likedByCurrentUser;
  const likeCount = likeState?.count ?? likesCount;

  const toggleLikePress = async () => {
    const token = await getAccessToken();
    if (!token) return;

    toggleLike(postId);

    try {
      await axios.patch(
        `${BASE_URL}/api/forum/post/${postId}/like`,
        { like: !liked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      toggleLike(postId);
    }
  };

  /* -------------------- Open / Close Animation -------------------- */

  const toggleCaption = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (!visible || media.length === 0) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      requestAnimationFrame(() => {
        if (
          flatListRef.current &&
          initialIndex >= 0 &&
          initialIndex < media.length
        ) {
          flatListRef.current.scrollToIndex({
            index: initialIndex,
            animated: false,
          });
        }
      });
    });
  }, [visible, initialIndex, media.length]);

  useEffect(() => {
    if (!collapsedHeight || !expandedHeight) return;

    Animated.timing(animatedHeight, {
      toValue: expanded ? expandedHeight : collapsedHeight,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // ❗ height animation
    }).start();
  }, [expanded, collapsedHeight, expandedHeight]);

  useEffect(() => {
    if (visible) {
      setExpanded(false);
      setCollapsedHeight(0);
      setExpandedHeight(0);
    }
  }, [visible]);

  /* -------------------- Video Pauses On Swipe -------------------- */

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([key, ref]) => {
      const index = Number(key);
      if (ref && index !== activeIndex) {
        ref.pauseAsync?.();
      }
    });
  }, [activeIndex]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  /* -------------------- Caption Disappers/Reappear on Toggle -------------------- */
  const toggleCaptionVisibility = () => {
    const toValue = captionVisible ? 0 : 1;

    Animated.timing(captionOpacity, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setCaptionVisible(!captionVisible);
  };

  useEffect(() => {
    if (visible) {
      captionOpacity.setValue(1);
      setCaptionVisible(true);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setPlayingIndex(null); // ⛔ never autoplay on open
    }
  }, [visible, initialIndex]);

  /* -------------------- Render -------------------- */

  return (
    <Modal visible={visible} transparent animationType="fade">
      <SafeAreaView style={styles.modalContainer}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalBackground} />

        <Animated.View
          style={[styles.galleryWrapper, { opacity, transform: [{ scale }] }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.user}>
              {fullProfileImageUri && (
                <Image
                  source={{ uri: fullProfileImageUri }}
                  style={styles.profileImage}
                />
              )}
              <Text style={styles.username}>{username}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Media Carousel */}
          <FlatList
            ref={flatListRef}
            data={media}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, idx) => `${item.type}-${idx}`}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            initialScrollIndex={initialIndex}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={1}
                onPress={toggleCaptionVisibility}
                style={styles.imageContainer}
              >
                {item.type === "video" ? (
                  playingIndex === index ? (
                    <Video
                      ref={(ref) => {
                        videoRefs.current[index] = ref;
                      }}
                      source={{ uri: item.uri }}
                      style={styles.media}
                      resizeMode={ResizeMode.COVER}
                      useNativeControls
                      shouldPlay
                      onPlaybackStatusUpdate={(status) => {
                        if (!status.isLoaded) return;

                        if (status.didJustFinish) {
                          setPlayingIndex(null); // ✅ revert to thumbnail
                        }
                      }}
                    />
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setPlayingIndex(index)}
                    >
                      <View>
                        {item.thumbnailUri ? (
                          <Image
                            source={{ uri: item.thumbnailUri }}
                            style={styles.media}
                          />
                        ) : (
                          <View style={[styles.media, styles.videoFallback]} />
                        )}

                        {/* ▶️ Play overlay */}
                        <View style={styles.playOverlay}>
                          <Ionicons
                            name="play-circle"
                            size={72}
                            color="white"
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                ) : (
                  <Image source={{ uri: item.uri }} style={styles.image} />
                )}
              </TouchableOpacity>
            )}
          />
        </Animated.View>

        {/* Caption + Engagement */}
        {postText && (
          <Animated.View
            style={[styles.captionOverlay, { opacity: captionOpacity }]}
          >
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            {/* Truncation detector */}
            <Text
              style={[
                styles.captionText,
                { position: "absolute", opacity: 0, zIndex: -1 },
              ]}
              onTextLayout={(e) => {
                if (e.nativeEvent.lines.length > COLLAPSED_LINES) {
                  setIsTruncated(true);
                }
              }}
            >
              {postText}
            </Text>
            {/* Visible caption */}
            <Text
              style={styles.captionText}
              numberOfLines={expanded ? undefined : COLLAPSED_LINES}
            >
              {postText}
            </Text>
            {isTruncated && (
              <TouchableOpacity onPress={toggleCaption}>
                <Text style={styles.showMoreText}>
                  {expanded ? "Show less" : "Show more"}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.engagementRow}>
              <TouchableOpacity
                onPress={toggleLikePress}
                style={styles.iconWithText}
              >
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={28}
                  color={liked ? "#ff3b30" : Colors.white}
                />
                <Text style={styles.engagementText}>{likeCount}</Text>
              </TouchableOpacity>

              <View style={styles.iconWithText}>
                <Ionicons
                  name="chatbubble-outline"
                  size={28}
                  color={Colors.white}
                />
                <Text style={styles.engagementText}>{commentsCount}</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

/* -------------------- Styles -------------------- */

function getStyles(isDark: boolean) {
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    modalBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      zIndex: 0,
    },
    galleryWrapper: {
      flex: 1,
      width: screenWidth,
    },
    captionOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      padding: 12,
      paddingBottom: 40,
      borderTopColor: Colors.midTone,
      borderTopWidth: 0.5,
    },
    videoFallback: {
      backgroundColor: Colors.black,
      justifyContent: "center",
      alignItems: "center",
    },

    imageContainer: {
      width: screenWidth,
      justifyContent: "center",
      alignItems: "flex-start",
      paddingBottom: 80,
    },
    imageWrapper: {
      width: screenWidth - 32,
      borderRadius: 12,
      borderColor: Colors.white,
      borderWidth: 1,
      overflow: "hidden",
      backgroundColor: Colors.black,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
      overflow: "hidden",
      resizeMode: "contain",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 12,
      paddingTop: 20,
    },
    user: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 60,
      borderColor: Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
    },
    username: {
      fontFamily: Fonts.OSREGULAR,
      marginBottom: 4,
      color: Colors.white,
    },
    captionText: {
      fontSize: 14,
      color: Colors.white,
      textAlign: "left",
      fontFamily: Fonts.OSREGULAR,
      marginBottom: 10,
    },

    engagementRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      gap: 16,
      marginTop: 8,
    },
    iconWithText: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    engagementText: {
      fontSize: 16,
      color: Colors.white,
      fontFamily: Fonts.OSREGULAR,
    },
    closeButton: {
      padding: 10,
      borderRadius: 8,
      zIndex: 10,
    },
    mediaContainer: {
      width: screenWidth,
      justifyContent: "center",
      alignItems: "center",
    },
    media: {
      width: screenWidth,
      height: 320,
    },
    showMoreText: {
      color: Colors.lightGray,
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      marginTop: 4,
    },
    playOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: screenWidth,
      height: 320,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.25)",
    },
  });
}
