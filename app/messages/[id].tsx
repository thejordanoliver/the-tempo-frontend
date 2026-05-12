import { Ionicons } from "@expo/vector-icons";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import MessageAttachmentMenu from "components/Messages/MessageAttachmentMenu";
import { GiphySearchModal } from "components/Sports/NBA/GameDetails/GameChat/GiphySearchSheet";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
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
import type { ListRenderItem } from "react-native";
import {
  ActivityIndicator,
  Alert,
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
import { DirectMessageItem, MessageAttachment } from "types/messages";

const FALLBACK_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder_nmzv2o.png";

export default function MessageDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const conversationId = Array.isArray(params.id)
    ? (params.id[0] ?? "")
    : (params.id ?? "");

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => messageDetailStyles(isDark), [isDark]);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const listRef = useRef<FlatList<DirectMessageItem>>(null);
  const inputRef = useRef<TextInput>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const {
    conversation,
    messages,
    isLoading,
    error,
    sendError,
    isOtherUserTyping,
    sendMessage,
    notifyTyping,
    refresh,
  } = useDirectMessages(conversationId);

  const [draftMessage, setDraftMessage] = useState("");
  const [selectedAttachment, setSelectedAttachment] =
    useState<MessageAttachment | null>(null);
  const [attachmentMenuVisible, setAttachmentMenuVisible] = useState(false);
  const [gifModalVisible, setGifModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const isSendDisabled =
    draftMessage.trim().length === 0 && selectedAttachment === null;

  const displayUsername = conversation?.username ?? "Messages";
  const displayFullName =
    conversation?.fullName ?? conversation?.full_name ?? "Direct message";
  const displayAvatar = conversation?.profileImageUrl || FALLBACK_AVATAR;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
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

  const handlePickImage = useCallback(() => {
    closeAttachmentMenu();
    Alert.alert(
      "Image upload unavailable",
      "Direct message image uploads need an upload endpoint before local photos can be sent.",
    );

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
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

  const renderMessage: ListRenderItem<DirectMessageItem> = useCallback(
    ({ item }) => {
      const hasText = item.text.trim().length > 0;
      const hasAttachment = Boolean(item.attachment);

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
              styles.messageBubble,
              hasAttachment && styles.attachmentMessageBubble,
              item.isCurrentUser
                ? styles.currentUserBubble
                : styles.otherUserBubble,
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
                  item.isCurrentUser && styles.currentUserMessageText,
                ]}
              >
                {item.text}
              </Text>
            )}

            <Text
              style={[
                styles.messageTime,
                hasAttachment && styles.attachmentMessageTime,
                item.isCurrentUser && styles.currentUserMessageTime,
              ]}
            >
              {item.timestamp}
            </Text>
          </View>
        </View>
      );
    },
    [
      conversation?.profileImageUrl,
      styles.attachmentCaptionText,
      styles.attachmentMessageBubble,
      styles.attachmentMessageTime,
      styles.currentUserBubble,
      styles.currentUserMessageText,
      styles.currentUserMessageTime,
      styles.currentUserRow,
      styles.messageAttachment,
      styles.messageAvatar,
      styles.messageBubble,
      styles.messageRow,
      styles.messageText,
      styles.messageTime,
      styles.otherUserBubble,
      styles.otherUserRow,
    ],
  );

  const keyExtractor = useCallback((item: DirectMessageItem) => item.id, []);

  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator
            size="small"
            color={isDark ? Colors.white : Colors.black}
          />
          <Text style={styles.emptyTitle}>Loading conversation</Text>
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
            activeOpacity={0.85}
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
        <CustomHeaderTitle
          tabName="Message"
          title={displayUsername}
          messageAvatar={displayAvatar}
          messageUsername={displayUsername}
          messageFullName={displayFullName}
          messageIsOnline={Boolean(conversation?.isOnline)}
          messageIsVerified={conversation?.isVerified}
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
    navigation,
  ]);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderTypingIndicator}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
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
                activeOpacity={0.85}
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
                activeOpacity={0.85}
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
              activeOpacity={0.85}
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
      borderRadius: 15,
      marginRight: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    messageBubble: {
      maxWidth: "78%",
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
    },

    attachmentMessageBubble: {
      paddingHorizontal: 6,
      paddingTop: 6,
      paddingBottom: 8,
      overflow: "hidden",
    },

    currentUserBubble: {
      borderBottomRightRadius: 6,
      borderColor: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    otherUserBubble: {
      borderBottomLeftRadius: 6,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    messageText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.OSREGULAR,
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
      fontSize: 11,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.midTone,
    },

    attachmentMessageTime: {
      paddingHorizontal: 6,
    },

    currentUserMessageTime: {
      color: isDark ? Colors.darkGray : Colors.lightGray,
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

    retryButton: {
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 18,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryButtonText: {
      fontSize: 13,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.black : Colors.white,
    },

    typingBubble: {
      paddingHorizontal: 13,
      paddingVertical: 10,
      minHeight: 40,
      justifyContent: "center",
    },

    typingBubbleText: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.OSREGULAR,
      fontStyle: "italic",
      color: isDark ? Colors.lightGray : Colors.darkGray,
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

    previewContainer: {
      marginBottom: 8,
      alignSelf: "center",
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    previewMedia: {
      width: 200,
      height: 200,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
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

    sendError: {
      marginTop: 6,
      paddingHorizontal: 8,
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
