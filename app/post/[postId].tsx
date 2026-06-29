// post/[postId].tsx

import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "components/ConfirmModal";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { CommentItem } from "components/Forum/CommentItem";
import { Post, PostItem } from "components/Forum/PostItem";
import MessageAttachmentMenu from "components/Messages/MessageAttachmentMenu";
import { GiphySearchModal } from "components/Sports/NBA/GameDetails/GameChat/GiphySearchSheet";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  type CommentAttachment,
  useCommentThread,
} from "hooks/ForumHooks/useCommentThread";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ListRenderItem } from "react-native";
import {
  Animated,
  Easing,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Comment {
  id: string;
  text: string | null;
  user_id: number;
  username: string;
  created_at: string;
  profile_image: string | null;
  images?: string[];
  videos?: string[];
  video_thumbnails?: (string | null)[];
}

function mapCommentToPost(comment: Comment): Post {
  return {
    id: comment.id,
    text: comment.text ?? "",
    user_id: comment.user_id,
    username: comment.username,
    created_at: comment.created_at,
    full_name: null,
    profile_image: comment.profile_image,
    likes: 0,
    comments_count: 0,
    liked_by_current_user: false,
    images: comment.images ?? [],
    videos: comment.videos ?? [],
    video_thumbnails: comment.video_thumbnails ?? [],
  };
}

export default function CommentThreadScreen() {
  const params = useLocalSearchParams();
  const postId = typeof params.postId === "string" ? params.postId : null;

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const styles = useMemo(() => commentThreadStyles(isDark), [isDark]);
  const global = globalStyles(isDark);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const listRef = useRef<FlatList<Post>>(null);
  const inputRef = useRef<TextInput>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const hasExitedAfterDeleteRef = useRef(false);

  const [newComment, setNewComment] = useState("");
  const [selectedAttachment, setSelectedAttachment] =
    useState<CommentAttachment | null>(null);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [gifModalVisible, setGifModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    currentUserId,
    post,
    comments,
    loading,
    submitting,
    alertConfig,
    setAlertConfig,
    postComment,
    editComment,
    deleteComment,
    deletePost,
  } = useCommentThread(postId);

  const commentItems = useMemo(
    () => comments.map(mapCommentToPost),
    [comments],
  );

  const isSendDisabled =
    (newComment.trim().length === 0 && selectedAttachment === null) ||
    submitting;

  const listBottomPadding = useMemo(() => {
    const composerPadding = selectedAttachment ? 330 : 118;

    if (keyboardVisible) {
      return composerPadding + keyboardHeight;
    }

    return composerPadding + Math.max(insets.bottom, 8);
  }, [insets.bottom, keyboardHeight, keyboardVisible, selectedAttachment]);

  const goBackToPreviousScreen = useCallback(() => {
    if (hasExitedAfterDeleteRef.current) return;

    hasExitedAfterDeleteRef.current = true;
    Keyboard.dismiss();

    requestAnimationFrame(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      const parentNavigation = navigation.getParent?.();

      if (parentNavigation?.canGoBack()) {
        parentNavigation.goBack();
        return;
      }

      router.back();
    });
  }, [navigation]);

  const closeAlert = useCallback(() => {
    setAlertConfig(null);
  }, [setAlertConfig]);

  const handleDeletePostFromThread = useCallback(
    async (targetPostId: string) => {
      const deleted = await deletePost(targetPostId);

      if (deleted) {
        goBackToPreviousScreen();
      }
    },
    [deletePost, goBackToPreviousScreen],
  );

  const handleConfirmAlert = useCallback(async () => {
    const onConfirm = alertConfig?.onConfirm;

    if (!onConfirm) {
      closeAlert();
      return;
    }

    try {
      await onConfirm();
      closeAlert();
    } catch {
      // Keep modal open if the confirm action fails.
    }
  }, [alertConfig, closeAlert]);

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const closeAttachmentMenu = useCallback(() => {
    setAttachmentMenuVisible(false);
  }, []);

  const handleToggleAttachmentMenu = useCallback(() => {
    setAttachmentMenuVisible((current) => !current);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handlePostComment = useCallback(async () => {
    const trimmedComment = newComment.trim();

    if ((!trimmedComment && !selectedAttachment) || submitting) return;

    await postComment(trimmedComment, selectedAttachment);

    setNewComment("");
    setSelectedAttachment(null);
    setAttachmentMenuVisible(false);
    scrollToBottom();

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [newComment, postComment, scrollToBottom, selectedAttachment, submitting]);

  const handlePickImage = useCallback(async () => {
    closeAttachmentMenu();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setAlertConfig({
        title: "Permission Needed",
        message: "Allow photo library access to attach images or videos.",
        confirmText: "OK",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.9,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (result.canceled || !result.assets?.[0]) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return;
    }

    const asset = result.assets[0];
    const isVideo = asset.type === "video";

    setSelectedAttachment({
      type: isVideo ? "video" : "image",
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    });

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [closeAttachmentMenu, setAlertConfig]);

  const handleOpenGifPicker = useCallback(() => {
    closeAttachmentMenu();

    requestAnimationFrame(() => {
      setGifModalVisible(true);
    });
  }, [closeAttachmentMenu]);

  const handleCloseGifPicker = useCallback(() => {
    setGifModalVisible(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handleGifSelected = useCallback((gifUrl: string) => {
    setSelectedAttachment({
      type: "gif",
      uri: gifUrl,
      fileName: "comment.gif",
      mimeType: "image/gif",
    });

    setGifModalVisible(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handleRemoveAttachment = useCallback(() => {
    setSelectedAttachment(null);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const renderComment: ListRenderItem<Post> = useCallback(
    ({ item, index }) => (
      <CommentItem
        comment={item}
        postId={postId ?? ""}
        isDark={isDark}
        currentUserId={currentUserId ?? ""}
        editComment={editComment}
        deleteComment={deleteComment}
        isLast={index === commentItems.length - 1}
      />
    ),
    [
      commentItems.length,
      currentUserId,
      deleteComment,
      editComment,
      isDark,
      postId,
    ],
  );

  const renderEmptyComments = useCallback(() => {
    if (commentItems.length > 0) return null;

    return (
      <View style={styles.emptyCommentsContainer}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={34}
          color={isDark ? Colors.white : Colors.black}
        />

        <Text style={styles.emptyTitle}>No comments yet</Text>

        <Text style={styles.emptyText}>
          Start the conversation by writing the first comment.
        </Text>
      </View>
    );
  }, [
    commentItems.length,
    isDark,
    styles.emptyCommentsContainer,
    styles.emptyText,
    styles.emptyTitle,
  ]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      const keyboardTop = event.endCoordinates.screenY;
      const nextKeyboardHeight = Math.max(0, windowHeight - keyboardTop);

      setKeyboardVisible(nextKeyboardHeight > 0);
      setKeyboardHeight(nextKeyboardHeight);

      Animated.timing(keyboardOffset, {
        toValue: nextKeyboardHeight,
        duration: Platform.OS === "ios" ? event.duration || 250 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);

      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === "ios" ? event?.duration || 220 : 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardOffset, windowHeight]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle title="Comments" onBack={() => router.back()} />
      ),
    });
  }, [navigation]);

  if (!postId) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Invalid post ID</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={commentItems}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        ListHeaderComponent={
          post ? (
            <PostItem
              item={post}
              isDark={isDark}
              currentUserId={currentUserId}
              deletePost={handleDeletePostFromThread}
              editPost={() => {}}
              onImagePress={() => {}}
              disableCommentNavigation
            />
          ) : null
        }
        ListEmptyComponent={renderEmptyComments}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={closeAttachmentMenu}
        contentContainerStyle={[
          styles.commentsContent,
          { paddingBottom: listBottomPadding },
        ]}
        onContentSizeChange={() => {
          if (commentItems.length > 0 && !keyboardVisible) {
            scrollToBottom(false);
          }
        }}
      />

      <Animated.View
        style={[
          styles.composerOuter,
          {
            paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 8),
            transform: [
              {
                translateY: Animated.multiply(keyboardOffset, -1),
              },
            ],
          },
        ]}
      >
        {selectedAttachment && (
          <View style={styles.previewContainer}>
            {selectedAttachment.type === "video" ? (
              <View style={styles.previewVideoPlaceholder}>
                <Ionicons name="play-circle" size={48} color={Colors.white} />
              </View>
            ) : (
              <Image
                source={{ uri: selectedAttachment.uri }}
                style={styles.previewMedia}
                contentFit="cover"
              />
            )}

            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>
                {selectedAttachment.type === "gif"
                  ? "GIF"
                  : selectedAttachment.type === "video"
                    ? "Video"
                    : "Image"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleRemoveAttachment}
              style={styles.previewCloseButton}
              activeOpacity={activeOpacity}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.composer}>
          <View style={styles.attachmentAnchor}>
            <MessageAttachmentMenu
              visible={attachmentMenuVisible}
              isDark={isDark}
              onPickImage={handlePickImage}
              onOpenGifPicker={handleOpenGifPicker}
            />

            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={handleToggleAttachmentMenu}
              style={[
                styles.attachmentButton,
                attachmentMenuVisible && styles.attachmentButtonActive,
              ]}
              hitSlop={8}
            >
              <Ionicons
                name={attachmentMenuVisible ? "close" : "add"}
                size={23}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          </View>

          <TextInput
            ref={inputRef}
            placeholder={
              selectedAttachment ? "Add a caption..." : "Write a comment..."
            }
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
            textAlignVertical="center"
            returnKeyType="send"
            submitBehavior="submit"
            blurOnSubmit={false}
            onSubmitEditing={handlePostComment}
            onPressIn={closeAttachmentMenu}
            onFocus={() => {
              requestAnimationFrame(() => {
                scrollToBottom();
              });
            }}
            style={styles.input}
            placeholderTextColor={isDark ? Colors.lightGray : Colors.darkGray}
          />

          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={handlePostComment}
            disabled={isSendDisabled}
            style={[
              styles.sendButton,
              isSendDisabled && styles.sendButtonDisabled,
            ]}
            hitSlop={8}
          >
            <Ionicons
              name="send"
              color={isDark ? Colors.black : Colors.white}
              size={18}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <GiphySearchModal
        visible={gifModalVisible}
        onClose={handleCloseGifPicker}
        onGifSelected={handleGifSelected}
        gifsCount={selectedAttachment?.type === "gif" ? 1 : 0}
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
        onConfirm={handleConfirmAlert}
      />
    </View>
  );
}

const commentThreadStyles = (isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    commentsContent: {
      flexGrow: 1,
      paddingTop: 8,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    emptyCommentsContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingTop: 64,
      paddingBottom: 120,
    },

    emptyTitle: {
      marginTop: 12,
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    composerOuter: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 20,
      elevation: 20,
      paddingHorizontal: 12,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    composer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      minHeight: 50,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 24,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    attachmentAnchor: {
      position: "relative",
      zIndex: 100,
      elevation: 100,
    },

    attachmentButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },

    attachmentButtonActive: {
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    previewContainer: {
      marginBottom: 8,
      alignSelf: "center",
      width: 200,
      height: 200,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    previewMedia: {
      width: "100%",
      height: "100%",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    previewVideoPlaceholder: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#111827",
    },

    previewBadge: {
      position: "absolute",
      left: 8,
      top: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "#00000088",
    },

    previewBadgeText: {
      fontSize: 11,
      fontFamily: Fonts.OSBOLD,
      color: Colors.white,
    },

    previewCloseButton: {
      position: "absolute",
      top: 6,
      right: 6,
      backgroundColor: "#00000088",
      borderRadius: 999,
    },

    input: {
      flex: 1,
      maxHeight: 112,
      minHeight: 38,
      paddingTop: 8,
      paddingBottom: 8,
      fontSize: 14,
      lineHeight: 19,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    sendButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    sendButtonDisabled: {
      opacity: 0.35,
    },
  });
