import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import ConfirmModal from "../components/ConfirmModal";
import CropEditorModal from "../components/CropEditorModal";
import CustomActivityIndicator from "../components/CustomActivityIndicator";
import { CustomHeaderTitle } from "../components/CustomHeaderTitle";
import PollEditorModal, { PollData } from "../components/Forum/PollEditorModal";
import VideoEditorModal from "../components/Forum/VideoEditorModal";
import { GiphySearchModal } from "../components/Sports/NBA/GameDetails/GameChat/GiphySearchSheet";
import { Colors, globalStyles } from "../constants/styles";
import { usePreferences } from "../contexts/PreferencesContext";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { MediaItem, useCreatePost } from "../hooks/ForumHooks/useCreatePost";
import { useAuth } from "../hooks/UserHooks/useAuth";
import { useCallback, useLayoutEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { createPostStyles } from "../styles/ForumStyles/CreatePostStyles";
import { LeagueType } from "../types/types";

export default function CreatePostScreen() {
  const { teamId, league } = useLocalSearchParams<{
    teamId?: string;
    league?: LeagueType;
  }>();

  const {
    newPostText,
    setNewPostText,
    media,
    mediaAnims,
    loading,
    pickMedia,
    addGif,
    removeMedia,
    createPost,
    alertConfig,
    showAlert,
    closeAlert,
    setMedia,
    poll,
    setPoll,
  } = useCreatePost(teamId, league);

  const [videoEditorVisible, setVideoEditorVisible] = useState(false);
  const [videoToEditIndex, setVideoToEditIndex] = useState<number | null>(null);
  const [isActiveDrag, setIsActiveDrag] = useState(false);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppingIndex, setCroppingIndex] = useState<number | null>(null);
  const [pollEditorVisible, setPollEditorVisible] = useState(false);
  const [gifModalVisible, setGifModalVisible] = useState(false);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = createPostStyles(isDark);
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const router = useRouter();
  const { currentUserId } = useLocalSearchParams<{
    currentUserId?: string;
  }>();
  const { user } = useAuth();
  const profileImage =
    Number(currentUserId) === user?.id ? user?.profile_image : null;

  const toolbarIconColor = isDark ? Colors.lightGray : Colors.darkGray;
  const toolbarIconActiveColor = isDark ? Colors.dark.blue : Colors.light.blue;
  const charCount = newPostText.length;
  const charLimit = 280;
  const charsRemaining = charLimit - charCount;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle title="New post" onBack={() => router.back()} />
      ),
    });
  }, [navigation, router, createPost, loading, newPostText, poll, media]);

  const handleOpenGifPicker = useCallback(() => {
    if (loading) return;
    if (media.length >= 8) {
      showAlert({
        title: "Limit reached",
        message: "You can only add up to 8 media items.",
        confirmText: "OK",
      });
      return;
    }
    setGifModalVisible(true);
  }, [loading, media.length, showAlert]);

  const handleCloseGifPicker = useCallback(() => {
    setGifModalVisible(false);
  }, []);

  const handleGifSelected = useCallback(
    (gifUrl: string) => {
      addGif(gifUrl);
      setGifModalVisible(false);
    },
    [addGif],
  );

  const onMediaPress = useCallback((item: MediaItem, index: number) => {
    if (item.type === "gif") return;
    if (item.type === "image") {
      setImageToCrop(item.uri);
      setCroppingIndex(index);
      setCropModalVisible(true);
    } else if (item.type === "video") {
      setVideoToEditIndex(index);
      setVideoEditorVisible(true);
    }
  }, []);

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

  const renderMediaItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<MediaItem>) => {
      const anim = mediaAnims[item.id];
      const index = getIndex?.() ?? 0;
      const isVideo = item.type === "video";
      const isGif = item.type === "gif";

      return (
        <Animated.View
          style={{
            marginRight: 8,
            opacity: anim?.opacity ?? 1,
            transform: [{ scale: isActive ? 1.05 : 1 }],
            overflow: "visible",
          }}
        >
          <TouchableOpacity
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              drag();
            }}
            delayLongPress={150}
            onPress={() => onMediaPress(item, index)}
            activeOpacity={0.85}
          >
            <View style={styles.mediaThumb}>
              {item.type === "image" || item.type === "gif" ? (
                <Image
                  source={{ uri: item.uri }}
                  style={styles.mediaThumbImage}
                  contentFit="cover"
                />
              ) : item.thumbnailUri ? (
                <Image
                  source={{
                    uri: `${item.thumbnailUri}?v=${item.trimStartMs ?? Date.now()}`,
                  }}
                  style={styles.mediaThumbImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="videocam" size={22} color={Colors.white} />
              )}

              {(isGif || isVideo) && (
                <View style={styles.mediaBadge}>
                  <Text style={styles.mediaBadgeText}>
                    {isGif ? "GIF" : "VIDEO"}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {!isActive && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeMedia(item.id)}
              hitSlop={10}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={12} color={Colors.white} />
            </TouchableOpacity>
          )}
        </Animated.View>
      );
    },
    [mediaAnims, onMediaPress, removeMedia, styles],
  );

  const handleAddPollPress = useCallback(() => {
    if (newPostText || media.length > 0) {
      showAlert({
        title: "Discard Current Post?",
        message:
          "Switching to a poll will remove your text and media from this draft. This can't be undone.",
        confirmText: "Discard",
        cancelText: "Cancel",
        variant: "danger",
        onConfirm: () => {
          closeAlert();
          setNewPostText("");
          setMedia([]);
          setPollEditorVisible(true);
        },
      });
    } else {
      setPollEditorVisible(true);
    }
  }, [
    newPostText,
    media,
    setNewPostText,
    setMedia,
    setPollEditorVisible,
    showAlert,
    closeAlert,
  ]);

  if (!user?.id)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── User identity row ── */}
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Image source={profileImage} style={styles.avatarImage} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username}</Text>
          </View>
        </View>

        {/* ── Composer / poll ── */}
        <View style={styles.textContainer}>
          {!poll && (
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="What's on your mind?"
              placeholderTextColor={Colors.midTone}
              value={newPostText}
              onChangeText={setNewPostText}
              editable={!loading}
              accessibilityLabel="Post text input"
              accessibilityHint="Enter your post content here"
            />
          )}

          {poll && (
            <View style={styles.pollCardContainer}>
              <Text style={styles.pollQuestion}>{poll.question}</Text>

              {poll.options.map((opt, i) => (
                <View
                  key={opt.id}
                  style={[
                    styles.optionRow,
                    { marginBottom: i < poll.options.length - 1 ? 6 : 0 },
                  ]}
                >
                  <Text style={styles.pollOptionsText}>{opt.text}</Text>
                </View>
              ))}

              <View style={styles.metaContainer}>
                <TouchableOpacity
                  onPress={() => setPoll(null)}
                  hitSlop={8}
                  style={styles.pollRemoveContainer}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="trash-outline"
                    size={12}
                    color={Colors.midTone}
                  />
                  <Text style={styles.pollRemoveButton}>Remove poll</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ── Inline media strip ── */}
        {!poll && media.length > 0 && (
          <DraggableFlatList
            horizontal
            data={media}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingRight: 16 }}
            style={styles.mediaStrip}
            activationDistance={20}
            scrollEnabled={!isActiveDrag}
            onDragBegin={() => {
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
        )}

        <View style={styles.divider} />

        {/* ── Toolbar ── */}
        <View style={styles.toolbar}>
          {/* Media */}
          {!poll && (
            <TouchableOpacity
              onPress={pickMedia}
              disabled={loading}
              style={styles.toolBtn}
              accessibilityLabel={`Add media. ${media.length} of 8 items selected`}
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Ionicons
                name="image-outline"
                size={22}
                color={toolbarIconColor}
              />
            </TouchableOpacity>
          )}

          {/* GIF */}
          {!poll && (
            <TouchableOpacity
              onPress={handleOpenGifPicker}
              disabled={loading}
              style={styles.toolBtn}
              accessibilityLabel="Add GIF"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Text style={styles.toolGifLabel}>GIF</Text>
            </TouchableOpacity>
          )}

          {/* Poll */}
          <TouchableOpacity
            onPress={
              poll ? () => setPollEditorVisible(true) : handleAddPollPress
            }
            disabled={loading}
            style={[styles.toolBtn, poll ? styles.toolBtnActive : undefined]}
            accessibilityLabel={poll ? "Edit poll" : "Add poll"}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons
              name="stats-chart-outline"
              size={22}
              color={poll ? toolbarIconActiveColor : toolbarIconColor}
            />
          </TouchableOpacity>

          <View style={styles.toolSpacer} />

          {/* Char count */}
          {!poll && (
            <View style={styles.charCountRow}>
              <Text
                style={[
                  styles.charCountLabel,
                  charsRemaining <= 20 && {
                    color: charsRemaining < 0 ? Colors.dark.lightRed : Colors.dark.orange,
                  },
                ]}
              >
                {charsRemaining}
              </Text>
              <View>
                <Ionicons
                  name="ellipse-outline"
                  size={20}
                  color={
                    charsRemaining < 0 && isDark
                      ? Colors.dark.lightRed
                      : charsRemaining < 0
                        ? Colors.light.red
                        : charsRemaining <= 20 && isDark
                          ? Colors.light.orange
                          : charsRemaining <= 20
                            ? Colors.light.orange
                            : isDark
                              ? Colors.darkGray
                              : Colors.lightGray
                  }
                />
              </View>
            </View>
          )}
        </View>

        {/* ── Bottom context bar ── */}
        <View style={styles.bottom}>
          <View style={styles.bottomBar}>
            <View style={styles.teamBadge}>
              <View style={styles.teamDot} />
              <Text style={styles.teamBadgeText}>
                {league ? `${league} · Fan Forum` : "Fan Forum"}
              </Text>
            </View>
            <Text style={styles.mediaCountText}>
              {poll ? "Poll active" : `${media.length} / 8 media`}
            </Text>
          </View>
          <Button
            onPress={createPost}
            disabled={loading}
            isDark={isDark}
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </View>
      </ScrollView>

      {/* ── Modals ── */}
      {imageToCrop && (
        <CropEditorModal
          visible={cropModalVisible}
          imageUri={imageToCrop}
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

      <PollEditorModal
        visible={pollEditorVisible}
        initial={poll}
        onClose={() => setPollEditorVisible(false)}
        onSave={(data: PollData) => {
          setPoll(data);
          setPollEditorVisible(false);
        }}
      />

      <GiphySearchModal
        visible={gifModalVisible}
        onClose={handleCloseGifPicker}
        onGifSelected={handleGifSelected}
        gifsCount={media.filter((item) => item.type === "gif").length}
      />

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
        onConfirm={() => {
          alertConfig?.onConfirm?.();
          if (!alertConfig?.onConfirm) closeAlert();
        }}
      />
    </>
  );
}
