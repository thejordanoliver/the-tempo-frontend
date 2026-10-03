import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { CustomHeader } from "@/components/CustomHeader";
import ConversationMessageItem from "@/components/Messages/ConversationMessageItem";
import { GiphySearchModal } from "@/components/Messages/GiphySearchModal";
import MessageThemeModal from "@/components/Messages/MessageThemeModal";
import { ConversationScreenStyles } from "@/styles/MessageStyles/ConversationScreenStyles";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { NavigationBarInsetContext } from "contexts/NavigationBarInsetContext";
import { usePreferences } from "contexts/PreferencesContext";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useDirectMessages } from "hooks/MessageHooks/useDirectMessages";
import { useScopedRouter } from "hooks/useScopedRouter";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  AppState,
  type AppStateStatus,
  FlatList,
  Keyboard,
  type ListRenderItem,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { DirectMessageItem } from "types/messages";
import ConversationComposer from "components/Messages/ConversationComposer";
import ConversationTypingIndicator from "components/Messages/ConversationTypingIndicator";
import ConversationEmptyState from "components/Messages/ConversationEmptyState";
import { useConversationComposer } from "hooks/MessageHooks/useConversationComposer";
import { useConversationKeyboard } from "hooks/MessageHooks/useConversationKeyboard";
import {
  getMessageReceiptLabels,
  getParticipantReadPosition,
  normalizeId,
} from "utils/messageReadReceipts";

const FALLBACK_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder_nmzv2o.png";

export default function ConversationScreen() {
  const navigationBarInset = useContext(NavigationBarInsetContext);
  const router = useScopedRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const conversationId = Array.isArray(params.id)
    ? (params.id[0] ?? "")
    : (params.id ?? "");

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => ConversationScreenStyles(isDark), [isDark]);
  const insets = useSafeAreaInsets();
  const themeSheetRef = useRef<BottomSheetModal>(null);

  const listRef = useRef<FlatList<DirectMessageItem>>(null);
  const [isScreenFocused, setIsScreenFocused] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const isConversationVisible = isScreenFocused && appState === "active";

  useFocusEffect(
    useCallback(() => {
      if (!conversationId) return;
      const frame = requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      });
      setIsScreenFocused(true);

      return () => {
        cancelAnimationFrame(frame);
        setIsScreenFocused(false);
      };
    }, [conversationId]),
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

  const newestFirstMessages = useMemo(
    () => [...messages].reverse(),
    [messages],
  );

  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const displayUsername = conversation?.username ?? "Messages";
  const displayFullName =
    conversation?.fullName ?? conversation?.full_name ?? "Direct message";
  const displayAvatar = conversation?.profileImageUrl || FALLBACK_AVATAR;
  const usesCustomMessageAccent = messageThemePreference.mode !== "default";
  const usesGradient =
    usesCustomMessageAccent &&
    messageThemePreference.bubbleStyle === "gradient";
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

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated });
    });
  }, []);

  const { rootRef, onLayout, bottomInset, keyboardVisible } =
    useConversationKeyboard(scrollToBottom, navigationBarInset);

  const {
    inputRef,
    draftMessage,
    selectedAttachment,
    attachmentMenuVisible,
    gifModalVisible,
    isUploadingImage,
    isSendDisabled,
    closeAttachmentMenu,
    handleToggleAttachmentMenu,
    handlePickImage,
    handleOpenGifPicker,
    handleCloseGifPicker,
    handleGifSelected,
    handleRemoveAttachment,
    handleDraftChange,
    handleSend,
  } = useConversationComposer({
    conversationId,
    sendMessage,
    notifyTyping,
    scrollToBottom,
  });

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

  const handleMessagesScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!hasMore || isLoadingMore || messages.length === 0) return;

      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const distanceFromHistory =
        contentSize.height - layoutMeasurement.height - contentOffset.y;

      if (distanceFromHistory <= 48) {
        void loadOlder();
      }
    },
    [hasMore, isLoadingMore, loadOlder, messages.length],
  );

  const renderMessage: ListRenderItem<DirectMessageItem> = useCallback(
    ({ item }) => (
      <ConversationMessageItem
        item={item}
        styles={styles}
        receiptLabel={messageReceiptLabels[normalizeId(item.id)]}
        conversationProfileImageUrl={conversation?.profileImageUrl}
        fallbackAvatar={FALLBACK_AVATAR}
        primaryAccent={messageAccent.primary}
        secondaryAccent={messageAccent.secondary}
        usesCustomMessageAccent={usesCustomMessageAccent}
        usesGradient={usesGradient}
        onRetry={(message) => {
          void sendMessage({
            text: message.text,
            attachment: message.attachment,
            clientId: message.clientId,
          });
        }}
        onBlocked={() => router.back()}
      />
    ),
    [
      conversation?.profileImageUrl,
      messageAccent.primary,
      messageAccent.secondary,
      messageReceiptLabels,
      sendMessage,
      styles,
      usesCustomMessageAccent,
      usesGradient,
      router,
    ],
  );

  const keyExtractor = useCallback((item: DirectMessageItem) => item.id, []);

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
    <View ref={rootRef} collapsable={false} onLayout={onLayout} style={styles.root}>
      <Animated.View style={[styles.container, { paddingBottom: bottomInset }]}>
        <FlatList
          style={styles.messagesList}
          ref={listRef}
          key={conversationId}
          inverted
          data={newestFirstMessages}
          extraData={messageReceiptLabels}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          ListHeaderComponent={
            <ConversationTypingIndicator
              styles={styles}
              isOtherUserTyping={isOtherUserTyping}
              displayAvatar={displayAvatar}
              displayUsername={displayUsername}
            />
          }
          ListEmptyComponent={
            <ConversationEmptyState
              styles={styles}
              isDark={isDark}
              isLoading={isLoading}
              error={error}
              refresh={refresh}
            />
          }
          ListFooterComponent={renderOlderMessagesLoader}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.messagesContent}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 48,
          }}
          onScroll={handleMessagesScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={closeAttachmentMenu}
        />

        <View
          style={[
            styles.composerOuter,
            {
              paddingBottom:
                keyboardVisible || navigationBarInset > 0
                  ? 8
                  : Math.max(insets.bottom, 8),
            },
          ]}
        >
          <ConversationComposer
            styles={styles}
            isDark={isDark}
            isUploadingImage={isUploadingImage}
            selectedAttachment={selectedAttachment}
            attachmentMenuVisible={attachmentMenuVisible}
            draftMessage={draftMessage}
            isSendDisabled={isSendDisabled}
            sendError={sendError}
            inputRef={inputRef}
            handleRemoveAttachment={handleRemoveAttachment}
            handlePickImage={handlePickImage}
            handleOpenGifPicker={handleOpenGifPicker}
            handleToggleAttachmentMenu={handleToggleAttachmentMenu}
            handleDraftChange={handleDraftChange}
            closeAttachmentMenu={closeAttachmentMenu}
            scrollToBottom={scrollToBottom}
            handleSend={handleSend}
          />
        </View>
      </Animated.View>

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
