import { Ionicons } from "@expo/vector-icons";
import CropEditorModal from "components/CropEditorModal";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import AlertModal from "components/Forum/AlertModal";
import VideoEditorModal from "components/Forum/VideoEditorModal";
import { Colors } from "constants/Styles";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { MediaItem, useCreatePost } from "hooks/ForumHooks/useCreatePost";
import { useCallback, useLayoutEffect, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { createPostStyles } from "styles/CreatePostStyles";
import PostButton from "../components/Forum/PostButton";

export default function CreatePostScreen() {
  const { teamId, league } = useLocalSearchParams<{
    teamId?: string;
    league?: "NBA" | "NFL";
  }>();
  const {
    newPostText,
    setNewPostText,
    media,
    mediaAnims,
    loading,
    pickMedia,
    removeMedia,
    createPost,
    alertConfig,
    closeAlert,
    setMedia,
    prependPost,
  } = useCreatePost(teamId, league);

  const [videoEditorVisible, setVideoEditorVisible] = useState(false);
  const [videoToEditIndex, setVideoToEditIndex] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isActiveDrag, setIsActiveDrag] = useState(false);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppingIndex, setCroppingIndex] = useState<number | null>(null);
  const isDark = useColorScheme() === "dark";
  const styles = createPostStyles(isDark);
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle title="Create Post" onBack={() => router.back()} />
      ),
    });
  }, [navigation]);

  // Handle tapping on media (image or video)
  const onMediaPress = useCallback((item: MediaItem, index: number) => {
    if (item.type === "image") {
      setImageToCrop(item.uri);
      setCroppingIndex(index);
      setCropModalVisible(true);
    } else if (item.type === "video") {
      setVideoToEditIndex(index);
      setVideoEditorVisible(true);
    }
  }, []);

  // Called when image cropping is completed
  const onCropComplete = useCallback(
    (croppedUri: string) => {
      if (croppingIndex !== null) {
        const updated = [...media];
        updated[croppingIndex] = {
          ...updated[croppingIndex],
          uri: croppedUri,
          type: "image",
        };
        setMedia(updated);
      }
      setCropModalVisible(false);
      setImageToCrop(null);
      setCroppingIndex(null);
    },
    [croppingIndex, media, setMedia],
  );

  // Render each media item in the DraggableFlatList
  const renderMediaItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<MediaItem>) => {
      const anim = mediaAnims[item.id];
      const index = getIndex?.() ?? 0;

      return (
        <Animated.View
          style={{
            marginRight: 10,
            opacity: anim?.opacity ?? 1,
            transform: [{ scale: isActive ? 1.05 : 1 }],
          }}
        >
          <TouchableOpacity
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              drag();
            }}
            delayLongPress={150}
            onPress={() => onMediaPress(item, index)}
          >
            {item.type === "image" ? (
              <Image
                source={{ uri: item.uri }}
                style={styles.thumnailPreview}
              />
            ) : item.thumbnailUri ? (
              <Image
                source={{
                  uri: `${item.thumbnailUri}?v=${
                    item.trimStartMs ?? Date.now()
                  }`,
                }}
                style={styles.thumnailPreview}
              />
            ) : (
              <View style={styles.thumbnail}>
                <Ionicons name="videocam" size={28} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>

          {!isActive && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeMedia(item.id)}
              hitSlop={10}
            >
              <Ionicons name="close-circle" size={28} color="white" />
            </TouchableOpacity>
          )}
        </Animated.View>
      );
    },
    [mediaAnims, onMediaPress, removeMedia, styles],
  );

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
      style={styles.container}
    >
      <View style={styles.textContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="What's on your mind?"
          placeholderTextColor={isDark ? Colors.lightGray : Colors.darkGray}
          value={newPostText}
          onChangeText={setNewPostText}
          editable={!loading}
          accessibilityLabel="Post text input"
          accessibilityHint="Enter your post content here"
        />

        <View style={styles.postOptionsContainer}>
          <TouchableOpacity
            onPress={pickMedia}
            disabled={loading}
            style={styles.postOptionsWrapper}
            accessibilityLabel={`Add media. ${media.length} of 8 items selected`}
            accessibilityRole="button"
          >
            <View style={styles.postOptionsInnerWrapper}>
              <Ionicons
                name="image-outline"
                size={30}
                color={isDark ? Colors.white : Colors.black}
              />
              <Text style={styles.addMediaText}>
                Add Images/Videos ({media.length}/8)
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={28}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        </View>

        <DraggableFlatList
          horizontal
          data={media}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ overflow: "visible" }}
          style={{ overflow: "visible" }}
          activationDistance={20}
          scrollEnabled={!isActiveDrag}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
          onMomentumScrollEnd={() => setIsScrolling(false)}
          onDragBegin={() => {
            setIsScrolling(false);
            setIsActiveDrag(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          onDragEnd={({ data }) => {
            setMedia(data);
            setIsActiveDrag(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          renderItem={renderMediaItem}
        />

        <PostButton
          onPress={createPost}
          disabled={loading}
          title={loading ? "Posting..." : "Post"}
        />
      </View>

      {imageToCrop && (
        <CropEditorModal
          visible={cropModalVisible}
          imageUri={imageToCrop}
          aspectRatio={4 / 3}
          mode="post"
          onCancel={() => setCropModalVisible(false)}
          onCrop={onCropComplete}
        />
      )}

      {videoToEditIndex !== null &&
        media[videoToEditIndex]?.type === "video" && (
          <VideoEditorModal
            visible={videoEditorVisible}
            videoUri={media[videoToEditIndex].uri}
            initialThumbnailUri={media[videoToEditIndex].thumbnailUri}
            initialTrimStartMs={media[videoToEditIndex].trimStartMs}
            initialTrimEndMs={media[videoToEditIndex].trimEndMs}
            onClose={() => {
              setVideoEditorVisible(false);
              setVideoToEditIndex(null);
            }}
            onSave={({ thumbnailUri, trimStartMs, trimEndMs }) => {
              const updated = [...media];
              updated[videoToEditIndex] = {
                ...updated[videoToEditIndex],
                thumbnailUri,
                trimStartMs,
                trimEndMs,
              };
              setMedia(updated);
              setVideoEditorVisible(false);
              setVideoToEditIndex(null);
            }}
          />
        )}

      <AlertModal
        visible={!!alertConfig}
        isDark={isDark}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        onCancel={closeAlert}
        onConfirm={() => {
          alertConfig?.onConfirm?.();
          if (!alertConfig?.onConfirm) closeAlert();
        }}
      />
    </ScrollView>
  );
}
