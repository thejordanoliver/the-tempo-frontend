import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { CustomHeader } from "@/components/CustomHeader";
import { GiphySearchModal } from "@/components/Messages/GiphySearchModal";
import MessageThemeModal from "@/components/Messages/MessageThemeModal";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import MessageAttachmentMenu from "components/Messages/MessageAttachmentMenu";
import { activeOpacity, Colors, Fonts, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useDirectMessages } from "hooks/MessageHooks/useDirectMessages";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  AppState,
  type AppStateStatus,
  Easing,
  FlatList,
  Keyboard,
  type ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { uploadMessageImage } from "services/messagesApi";
import {
  ConversationReadPosition,
  DirectMessageItem,
  MessageAttachment,
  MessageItem,
} from "types/messages";
import { getContrastingTextColor } from "utils/color";

const FALLBACK_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder_nmzv2o.png";

const normalizeId = (value: unknown) => String(value ?? "").trim();

const getMessageTime = (message: DirectMessageItem) => {
  if (!message.createdAt) return null;

  const time = new Date(message.createdAt).getTime();

  return Number.isNaN(time) ? null : time;
};

const isPersistedOutgoingMessage = (message: DirectMessageItem) => {
  const id = normalizeId(message.id);
  const clientId = normalizeId(message.clientId);

  return (
    message.isCurrentUser &&
    message.status !== "pending" &&
    Boolean(id) &&
    (!clientId || id !== clientId) &&
    Boolean(message.createdAt)
  );
};

const hasReadMessageCursor = (
  receipt: ConversationReadPosition | null | undefined,
) =>
  Boolean(
    receipt &&
    Object.prototype.hasOwnProperty.call(receipt, "lastReadMessageId"),
  );

type ParticipantReadPosition = {
  readAt: number | null;
  lastReadMessageId?: string | null;
  hasMessageCursor: boolean;
};

const formatReadReceiptTime = (readAt: number | null | undefined) => {
  if (readAt === null || readAt === undefined) return null;

  const date = new Date(readAt);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getParticipantReadPosition = (
  conversation?: MessageItem | null,
): ParticipantReadPosition | null => {
  const otherUserId = normalizeId(conversation?.userId);

  if (!conversation || !otherUserId) return null;

  const receipt = conversation.readReceipts?.[otherUserId];
  const readAt = receipt?.readAt ?? conversation.otherParticipantLastReadAt;
  const hasMessageCursor = hasReadMessageCursor(receipt);

  if (!readAt && !hasMessageCursor) return null;

  const time = readAt ? new Date(readAt).getTime() : null;

  return {
    readAt: time === null || Number.isNaN(time) ? null : time,
    lastReadMessageId: hasMessageCursor
      ? (receipt?.lastReadMessageId ?? null)
      : undefined,
    hasMessageCursor,
  };
};

const getMessageReceiptLabels = (
  messages: DirectMessageItem[],
  otherParticipantReadPosition: ParticipantReadPosition | null,
) => {
  let latestOutgoingMessage: DirectMessageItem | null = null;
  let latestReadOutgoingMessage: DirectMessageItem | null = null;
  const readMessageId = otherParticipantReadPosition?.hasMessageCursor
    ? normalizeId(otherParticipantReadPosition.lastReadMessageId)
    : "";

  for (const message of messages) {
    if (!isPersistedOutgoingMessage(message)) continue;

    latestOutgoingMessage = message;

    if (readMessageId) {
      if (normalizeId(message.id) === readMessageId) {
        latestReadOutgoingMessage = message;
      }

      continue;
    }

    if (otherParticipantReadPosition?.hasMessageCursor) {
      continue;
    }

    const messageTime = getMessageTime(message);

    if (
      otherParticipantReadPosition?.readAt !== null &&
      otherParticipantReadPosition?.readAt !== undefined &&
      messageTime !== null &&
      messageTime <= otherParticipantReadPosition.readAt
    ) {
      latestReadOutgoingMessage = message;
    }
  }

  const labels: Record<string, string> = {};
  const renderedReadMessageId = latestReadOutgoingMessage
    ? normalizeId(latestReadOutgoingMessage.id)
    : "";
  const sentMessageId = latestOutgoingMessage
    ? normalizeId(latestOutgoingMessage.id)
    : "";

  if (renderedReadMessageId) {
    const readTime = formatReadReceiptTime(
      otherParticipantReadPosition?.readAt,
    );

    labels[renderedReadMessageId] = readTime ? `Read ${readTime}` : "Read";
  } else if (sentMessageId) {
    labels[sentMessageId] = "Sent";
  }

  return labels;
};

export default function ConversationScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const conversationId = Array.isArray(params.id)
    ? (params.id[0] ?? "")
    : (params.id ?? "");

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => messageDetailStyles(isDark), [isDark]);
  const global = globalStyles(isDark);
  const insets = useSafeAreaInsets();
  const themeSheetRef = useRef<BottomSheetModal>(null);
  const { height: windowHeight } = useWindowDimensions();

  const listRef = useRef<FlatList<DirectMessageItem>>(null);
  const inputRef = useRef<TextInput>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [isScreenFocused, setIsScreenFocused] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const isConversationVisible = isScreenFocused && appState === "active";

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);

      return () => {
        setIsScreenFocused(false);
      };
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);

    return () => {
      subscription.remove();
    };
  }, []);

  const {
    conversation,
    messages,
    messageThemePreference,
    messageAccent,
    updateMessageThemePreference,
    isUpdatingMessageThemePreference,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    sendError,
    isOtherUserTyping,
    sendMessage,
    notifyTyping,
    refresh,
    loadOlder,
  } = useDirectMessages(conversationId, {
    isVisible: isConversationVisible,
  });

  const [draftMessage, setDraftMessage] = useState("");
  const [selectedAttachment, setSelectedAttachment] =
    useState<MessageAttachment | null>(null);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [gifModalVisible, setGifModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const didInitialScrollRef = useRef(false);

  const isSendDisabled =
    isUploadingImage ||
    (draftMessage.trim().length === 0 && selectedAttachment === null);

  const displayUsername = conversation?.username ?? "Messages";
  const displayFullName =
    conversation?.fullName ?? conversation?.full_name ?? "Direct message";
  const displayAvatar = conversation?.profileImageUrl || FALLBACK_AVATAR;
  const usesCustomMessageAccent = messageThemePreference.mode !== "default";
  const otherParticipantReadPosition = useMemo(
    () => getParticipantReadPosition(conversation),
    [conversation],
  );
  const messageReceiptLabels = useMemo(
    () => getMessageReceiptLabels(messages, otherParticipantReadPosition),
    [messages, otherParticipantReadPosition],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    didInitialScrollRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (didInitialScrollRef.current || isLoading || messages.length === 0) {
      return;
    }

    didInitialScrollRef.current = true;
    scrollToBottom();
  }, [isLoading, messages.length, scrollToBottom]);

  const closeAttachmentMenu = useCallback(() => {
    setAttachmentMenuVisible(false);
  }, []);

  const handleOpenThemeSettings = useCallback(() => {
    closeAttachmentMenu();
    Keyboard.dismiss();
    setThemeModalVisible(true);

    requestAnimationFrame(() => {
      themeSheetRef.current?.present();
    });
  }, [closeAttachmentMenu]);

  const handleCloseThemeSettings = useCallback(() => {
    setThemeModalVisible(false);
  }, []);

  const handleToggleAttachmentMenu = useCallback(() => {
    setAttachmentMenuVisible((current) => !current);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const handlePickImage = useCallback(async () => {
    closeAttachmentMenu();

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo access needed",
          "Please allow photo access to send an image.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const asset = result.assets[0];
      setIsUploadingImage(true);

      const attachment = await uploadMessageImage({
        uri: asset.uri,
        name: asset.fileName ?? asset.uri.split("/").pop() ?? "message.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });

      setSelectedAttachment(attachment);
    } catch (err: any) {
      Alert.alert(
        "Image upload failed",
        err?.response?.data?.error ??
          err?.message ??
          "Please try another image.",
      );
    } finally {
      setIsUploadingImage(false);

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [closeAttachmentMenu]);

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

  const handleDraftChange = useCallback(
    (value: string) => {
      setDraftMessage(value);
      notifyTyping(value);
    },
    [notifyTyping],
  );

  const handleSend = useCallback(async () => {
    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage && !selectedAttachment) return;

    const didSend = await sendMessage({
      text: trimmedMessage,
      attachment: selectedAttachment,
    });

    if (!didSend) return;

    setDraftMessage("");
    setSelectedAttachment(null);
    setAttachmentMenuVisible(false);
    scrollToBottom();

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [draftMessage, scrollToBottom, selectedAttachment, sendMessage]);

  const handleMessagesScroll = useCallback(
    (event: any) => {
      if (!hasMore || isLoadingMore || messages.length === 0) return;

      const offsetY = event.nativeEvent.contentOffset.y;

      if (offsetY <= 48) {
        void loadOlder();
      }
    },
    [hasMore, isLoadingMore, loadOlder, messages.length],
  );

  const renderMessage: ListRenderItem<DirectMessageItem> = useCallback(
    ({ item }) => {
      const hasText = item.text.trim().length > 0;
      const hasAttachment = Boolean(item.attachment);
      const receiptLabel = messageReceiptLabels[normalizeId(item.id)];

      const customBubbleColor = item.isCurrentUser
        ? messageAccent.primary
        : messageAccent.secondary;

      const customTextColor = usesCustomMessageAccent
        ? getContrastingTextColor(customBubbleColor)
        : undefined;

      return (
        <View
          style={[
            styles.messageRow,
            item.isCurrentUser ? styles.currentUserRow : styles.otherUserRow,
          ]}
        >
          {!item.isCurrentUser && (
            <Image
              source={{
                uri:
                  item.senderProfileImageUrl ||
                  conversation?.profileImageUrl ||
                  FALLBACK_AVATAR,
              }}
              style={styles.messageAvatar}
              contentFit="cover"
            />
          )}

          <View
            style={[
              styles.messageStack,
              item.isCurrentUser
                ? styles.currentUserMessageStack
                : styles.otherUserMessageStack,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                hasAttachment && styles.attachmentMessageBubble,
                item.isCurrentUser
                  ? styles.currentUserBubble
                  : styles.otherUserBubble,
                usesCustomMessageAccent && {
                  backgroundColor: customBubbleColor,
                },
              ]}
            >
              {item.attachment && (
                <Image
                  source={{ uri: item.attachment.uri }}
                  style={styles.messageAttachment}
                  contentFit="cover"
                />
              )}

              {hasText && (
                <Text
                  style={[
                    styles.messageText,
                    hasAttachment && styles.attachmentCaptionText,
                    item.isCurrentUser &&
                      !usesCustomMessageAccent &&
                      styles.currentUserMessageText,
                    usesCustomMessageAccent && {
                      color: customTextColor,
                    },
                  ]}
                >
                  {item.text}
                </Text>
              )}

              <Text
                style={[
                  styles.messageTime,
                  hasAttachment && styles.attachmentMessageTime,
                  item.isCurrentUser &&
                    !usesCustomMessageAccent &&
                    styles.currentUserMessageTime,
                  usesCustomMessageAccent && {
                    color: customTextColor,
                    opacity: 0.72,
                  },
                ]}
              >
                {item.timestamp}
              </Text>
            </View>

            {item.isCurrentUser && Boolean(receiptLabel) && (
              <Text style={styles.messageReceiptText}>{receiptLabel}</Text>
            )}
          </View>
        </View>
      );
    },
    [
      conversation?.profileImageUrl,
      messageAccent.primary,
      messageAccent.secondary,
      messageReceiptLabels,
      usesCustomMessageAccent,
      styles.attachmentCaptionText,
      styles.attachmentMessageBubble,
      styles.attachmentMessageTime,
      styles.currentUserBubble,
      styles.currentUserMessageText,
      styles.currentUserMessageTime,
      styles.currentUserMessageStack,
      styles.currentUserRow,
      styles.messageAttachment,
      styles.messageAvatar,
      styles.messageBubble,
      styles.messageReceiptText,
      styles.messageRow,
      styles.messageStack,
      styles.messageText,
      styles.messageTime,
      styles.otherUserMessageStack,
      styles.otherUserBubble,
      styles.otherUserRow,
    ],
  );

  const keyExtractor = useCallback((item: DirectMessageItem) => item.id, []);

  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View style={global.emptyContainer}>
          <CustomActivityIndicator />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color={isDark ? Colors.white : Colors.black}
          />

          <Text style={styles.emptyTitle}>Conversation unavailable</Text>

          <Text style={styles.emptyText}>{error}</Text>

          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={styles.retryButton}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={34}
          color={isDark ? Colors.white : Colors.black}
        />

        <Text style={styles.emptyTitle}>Start the conversation</Text>

        <Text style={styles.emptyText}>Send a message to begin this chat.</Text>
      </View>
    );
  }, [
    error,
    isDark,
    isLoading,
    refresh,
    styles.emptyState,
    styles.emptyText,
    styles.emptyTitle,
    styles.retryButton,
    styles.retryButtonText,
    global.emptyContainer,
  ]);

  const renderTypingIndicator = useCallback(() => {
    if (!isOtherUserTyping) return null;

    return (
      <View style={[styles.messageRow, styles.otherUserRow]}>
        <Image
          source={{ uri: displayAvatar }}
          style={styles.messageAvatar}
          contentFit="cover"
        />

        <View
          style={[
            styles.messageBubble,
            styles.otherUserBubble,
            styles.typingBubble,
          ]}
        >
          <Text style={styles.typingBubbleText}>
            {displayUsername} is typing...
          </Text>
        </View>
      </View>
    );
  }, [
    displayAvatar,
    displayUsername,
    isOtherUserTyping,
    styles.messageAvatar,
    styles.messageBubble,
    styles.messageRow,
    styles.otherUserBubble,
    styles.otherUserRow,
    styles.typingBubble,
    styles.typingBubbleText,
  ]);

  const renderOlderMessagesLoader = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.olderMessagesLoader}>
        <CustomActivityIndicator />
      </View>
    );
  }, [isLoadingMore, styles.olderMessagesLoader]);

  useEffect(() => {
    if (isOtherUserTyping) {
      scrollToBottom();
    }
  }, [isOtherUserTyping, scrollToBottom]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      const keyboardTop = event.endCoordinates.screenY;
      const nextKeyboardHeight = Math.max(0, windowHeight - keyboardTop);

      setKeyboardVisible(nextKeyboardHeight > 0);

      Animated.timing(keyboardOffset, {
        toValue: nextKeyboardHeight,
        duration: Platform.OS === "ios" ? event.duration || 250 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        scrollToBottom();
      });
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      setKeyboardVisible(false);

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
  }, [keyboardOffset, scrollToBottom, windowHeight]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Message"
          title={displayUsername}
          messageAvatar={displayAvatar}
          messageUsername={displayUsername}
          messageFullName={displayFullName}
          messageIsOnline={Boolean(conversation?.isOnline)}
          messageIsVerified={conversation?.isVerified}
          onOpenThemesSettings={handleOpenThemeSettings}
          onBack={handleBack}
        />
      ),
    });
  }, [
    conversation?.isOnline,
    conversation?.isVerified,
    displayAvatar,
    displayFullName,
    displayUsername,
    handleBack,
    handleOpenThemeSettings,
    navigation,
  ]);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={messages}
          extraData={messageReceiptLabels}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          ListHeaderComponent={renderOlderMessagesLoader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderTypingIndicator}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.messagesContent}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onScroll={handleMessagesScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={closeAttachmentMenu}
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
          {isUploadingImage && (
            <Text style={styles.uploadStatusText}>Uploading image...</Text>
          )}

          {selectedAttachment && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: selectedAttachment.uri }}
                style={styles.previewMedia}
                contentFit="cover"
              />

              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>
                  {selectedAttachment.type === "gif" ? "GIF" : "Image"}
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
              value={draftMessage}
              onChangeText={handleDraftChange}
              placeholder={
                selectedAttachment ? "Add a caption..." : "Message..."
              }
              placeholderTextColor={isDark ? Colors.lightGray : Colors.darkGray}
              style={styles.input}
              multiline
              maxLength={500}
              textAlignVertical="center"
              returnKeyType="send"
              submitBehavior="submit"
              blurOnSubmit={false}
              onPressIn={closeAttachmentMenu}
              onFocus={() => {
                requestAnimationFrame(() => {
                  scrollToBottom();
                });
              }}
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={handleSend}
              disabled={isSendDisabled}
              style={[
                styles.sendButton,
                isSendDisabled && styles.sendButtonDisabled,
              ]}
              hitSlop={8}
            >
              <Ionicons
                name="send"
                size={18}
                color={isDark ? Colors.black : Colors.white}
              />
            </TouchableOpacity>
          </View>

          {!!sendError && <Text style={styles.sendError}>{sendError}</Text>}
        </Animated.View>
      </View>

      <GiphySearchModal
        visible={gifModalVisible}
        onClose={handleCloseGifPicker}
        onGifSelected={handleGifSelected}
        gifsCount={selectedAttachment?.type === "gif" ? 1 : 0}
      />

      <MessageThemeModal
        sheetRef={themeSheetRef}
        visible={themeModalVisible}
        isDark={isDark}
        currentPreference={messageThemePreference}
        isSaving={isUpdatingMessageThemePreference}
        onClose={handleCloseThemeSettings}
        onSave={updateMessageThemePreference}
      />
    </View>
  );
}

const messageDetailStyles = (isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    messagesContent: {
      flexGrow: 1,
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 120,
    },

    olderMessagesLoader: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },

    messageRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 12,
    },

    currentUserRow: {
      justifyContent: "flex-end",
    },

    otherUserRow: {
      justifyContent: "flex-start",
    },

    messageAvatar: {
      width: 30,
      height: 30,
      marginRight: 8,
      borderRadius: 15,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    messageStack: {
      maxWidth: "78%",
    },

    currentUserMessageStack: {
      alignItems: "flex-end",
    },

    otherUserMessageStack: {
      alignItems: "flex-start",
    },

    messageBubble: {
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 18,
    },

    attachmentMessageBubble: {
      paddingHorizontal: 6,
      paddingTop: 6,
      paddingBottom: 8,
      overflow: "hidden",
    },

    currentUserBubble: {
      borderColor: isDark ? Colors.white : Colors.black,
      borderBottomRightRadius: 6,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    otherUserBubble: {
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomLeftRadius: 6,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    messageText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    attachmentCaptionText: {
      marginTop: 8,
      paddingHorizontal: 6,
    },

    currentUserMessageText: {
      color: isDark ? Colors.black : Colors.white,
    },

    messageAttachment: {
      width: 210,
      height: 160,
      borderRadius: 14,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    messageTime: {
      alignSelf: "flex-end",
      marginTop: 6,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: Colors.midTone,
    },

    attachmentMessageTime: {
      paddingHorizontal: 6,
    },

    currentUserMessageTime: {
      color: isDark ? Colors.darkGray : Colors.lightGray,
    },

    messageReceiptText: {
      alignSelf: "flex-end",
      marginTop: 4,
      marginRight: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingBottom: 80,
    },

    emptyTitle: {
      marginTop: 12,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },

    emptyText: {
      marginTop: 6,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    retryButton: {
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 18,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryButtonText: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.black : Colors.white,
    },

    typingBubble: {
      maxWidth: "78%",
      justifyContent: "center",
      minHeight: 40,
      paddingHorizontal: 13,
      paddingVertical: 10,
    },

    typingBubbleText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      fontStyle: "italic",
      lineHeight: 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    composerOuter: {
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 20,
      paddingHorizontal: 12,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark ? Colors.black : Colors.white,
      elevation: 20,
    },

    previewContainer: {
      alignSelf: "center",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 14,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },

    uploadStatusText: {
      marginBottom: 8,
      paddingHorizontal: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    previewMedia: {
      width: 200,
      height: 200,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    previewBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "#00000088",
    },

    previewBadgeText: {
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      color: Colors.white,
    },

    previewCloseButton: {
      position: "absolute",
      top: 6,
      right: 6,
      borderRadius: 999,
      backgroundColor: "#00000088",
    },

    composer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      minHeight: 50,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 24,
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
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "transparent",
    },

    attachmentButtonActive: {
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    themeButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 19,
      backgroundColor: "transparent",
    },

    input: {
      flex: 1,
      minHeight: 38,
      maxHeight: 112,
      paddingTop: 8,
      paddingBottom: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 19,
      color: isDark ? Colors.white : Colors.black,
    },

    sendButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    sendButtonDisabled: {
      opacity: 0.35,
    },

    sendError: {
      marginTop: 6,
      paddingHorizontal: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
