import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
  type BottomSheetFlatListMethods,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type PropsWithChildren,
} from "react";
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChatMessageItem } from "types/chat";
import type { ChatSendPayload } from "utils/chatPayload";
import { createMessageKey } from "utils/chatUtils";
import { snapPoints } from "utils/modalUtils";
import ChatInputBar from "./ChatInputBar";
import ChatMessage from "./ChatMessage";
import { GiphySearchModal } from "./GiphySearchModal";

const EMOJIS = ["😂", "😱", "😳", "🔥"];
const FALLBACK_INPUT_HEIGHT = 84;
const NEAR_BOTTOM_THRESHOLD = 96;

const ChatSheetContainer = ({ children }: PropsWithChildren) => {
  return <View style={StyleSheet.absoluteFill}>{children}</View>;
};

type BottomSheetChatListProps = ComponentProps<
  typeof BottomSheetFlatList<ChatMessageItem>
> & {
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
};

// The bottom-sheet implementation forwards these standard FlatList props even
// though its published prop type omits them.
const BottomSheetChatList =
  BottomSheetFlatList as unknown as React.ComponentType<BottomSheetChatListProps>;

type Props = {
  messages: ChatMessageItem[];
  userCount: number;
  currentUserName: string;
  onReaction: (messageId: string, emoji: string) => void;
  onSend: (payload: ChatSendPayload) => boolean | Promise<boolean>;
  inputDisabled?: boolean;
  sendDisabled?: boolean;
  onDismiss: () => void;
};

export default function LiveChat({
  messages,
  userCount,
  currentUserName,
  onReaction,
  onSend,
  inputDisabled = false,
  sendDisabled = false,
  onDismiss,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { top, bottom } = useSafeAreaInsets();
  const styles = useMemo(() => LiveChatStyles(isDark), [isDark]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const listRef = useRef<BottomSheetFlatListMethods>(null);

  const [inputHeight, setInputHeight] = useState(FALLBACK_INPUT_HEIGHT);
  const [showLatestButton, setShowLatestButton] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);
  const [gifModalVisible, setGifModalVisible] = useState(false);

  // `@gorhom/bottom-sheet` doesn't expose an imperative method for toggling
  // content panning — it's driven by the `enableContentPanningGesture` prop
  // instead, so we track it as state and feed it to the sheet below.
  const [contentPanningEnabled, setContentPanningEnabled] = useState(true);

  const isNearBottomRef = useRef(true);
  const previousMessageCountRef = useRef(messages.length);

  const disablePanDown = useCallback(() => {
    setContentPanningEnabled(false);
  }, []);

  const enablePanDown = useCallback(() => {
    setContentPanningEnabled(true);
  }, []);

  const scrollToLatestMessage = useCallback((animated = true) => {
    const scroll = (shouldAnimate: boolean) => {
      listRef.current?.scrollToEnd({ animated: shouldAnimate });
      listRef.current?.scrollToOffset?.({
        offset: Number.MAX_SAFE_INTEGER,
        animated: shouldAnimate,
      });

      isNearBottomRef.current = true;
      setShowLatestButton(false);
    };

    requestAnimationFrame(() => {
      scroll(animated);
      setTimeout(() => scroll(false), 60);
      setTimeout(() => scroll(false), 160);
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      bottomSheetRef.current?.present();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    scrollToLatestMessage(false);
  }, [inputHeight, scrollToLatestMessage]);

  useEffect(() => {
    const messageCountChanged =
      previousMessageCountRef.current !== messages.length;

    previousMessageCountRef.current = messages.length;

    if (!messageCountChanged) return;

    if (isNearBottomRef.current) {
      scrollToLatestMessage(true);
    } else {
      setShowLatestButton(true);
    }
  }, [messages.length, scrollToLatestMessage]);

  const openGifPicker = useCallback(() => {
    Keyboard.dismiss();
    disablePanDown();
    setGifModalVisible(true);
  }, [disablePanDown]);

  const closeGifPicker = useCallback(() => {
    enablePanDown();
    setGifModalVisible(false);
  }, [enablePanDown]);

  const handleGifSelected = useCallback(
    (gifUrl: string) => {
      setSelectedGifUrl(gifUrl);
      closeGifPicker();
    },
    [closeGifPicker],
  );

  const contentContainerStyle = useMemo(
    () => [
      styles.listContent,
      {
        paddingBottom: inputHeight + bottom + 20,
      },
    ],
    [bottom, inputHeight, styles.listContent],
  );

  const keyExtractor = useCallback(
    (item: ChatMessageItem) => createMessageKey(item),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatMessageItem }) => (
      <ChatMessage
        item={item}
        userName={currentUserName}
        isDark={isDark}
        emojis={EMOJIS}
        onReaction={onReaction}
      />
    ),
    [currentUserName, isDark, onReaction],
  );

  const handleSend = useCallback(
    async (payload: ChatSendPayload) => {
      const sent = await onSend(payload);

      if (sent) {
        Keyboard.dismiss();
        scrollToLatestMessage(true);
      }

      return sent;
    },
    [onSend, scrollToLatestMessage],
  );

  const handleMessageSent = useCallback(() => {
    Keyboard.dismiss();
    scrollToLatestMessage(true);
  }, [scrollToLatestMessage]);

  const handleContentSizeChange = useCallback(() => {
    if (isNearBottomRef.current) {
      scrollToLatestMessage(false);
    }
  }, [scrollToLatestMessage]);

  const handleListLayout = useCallback(() => {
    scrollToLatestMessage(false);
  }, [scrollToLatestMessage]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const visibleHeight = event.nativeEvent.layoutMeasurement.height;
      const contentHeight = event.nativeEvent.contentSize.height;

      const distanceFromBottom = contentHeight - (offsetY + visibleHeight);
      const isNearBottom = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;

      isNearBottomRef.current = isNearBottom;
      setShowLatestButton(!isNearBottom && messages.length > 0);
    },
    [messages.length],
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.title}>Live Chat</Text>
        <Text style={styles.userCount}>
          {userCount} {userCount === 1 ? "person" : "people"} in chat
        </Text>
      </View>
    ),
    [styles.header, styles.title, styles.userCount, userCount],
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter
        {...props}
        bottomInset={0}
        style={styles.footerContainer}
      >
        <ChatInputBar
          isDark={isDark}
          onSend={handleSend}
          disabled={inputDisabled}
          sendDisabled={sendDisabled}
          onHeightChange={setInputHeight}
          onSent={handleMessageSent}
          selectedGifUrl={selectedGifUrl}
          onSelectedGifUrlChange={setSelectedGifUrl}
          onOpenGifPicker={openGifPicker}
          disablePanDown={disablePanDown}
          enablePanDown={enablePanDown}
        />
      </BottomSheetFooter>
    ),
    [
      handleMessageSent,
      handleSend,
      inputDisabled,
      isDark,
      openGifPicker,
      sendDisabled,
      selectedGifUrl,
      styles.footerContainer,
      disablePanDown,
      enablePanDown,
    ],
  );

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={2}
        snapPoints={snapPoints}
        onDismiss={onDismiss}
        topInset={top}
        containerComponent={ChatSheetContainer}
        footerComponent={renderFooter}
        enablePanDownToClose
        enableContentPanningGesture={contentPanningEnabled}
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        handleIndicatorStyle={styles.handleIndicatorStyle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
        backgroundComponent={() => (
          <View style={[StyleSheet.absoluteFill, styles.background]}>
            <BlurView
              intensity={80}
              tint={"systemChromeMaterial"}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      >
        <View style={styles.content}>
          {header}

          <BottomSheetChatList
            ref={listRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={contentContainerStyle}
            onContentSizeChange={handleContentSizeChange}
            onLayout={handleListLayout}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            initialNumToRender={16}
            maxToRenderPerBatch={12}
            windowSize={7}
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
          />

          {showLatestButton && (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => scrollToLatestMessage(true)}
              style={[
                styles.latestButton,
                {
                  bottom: inputHeight + bottom + 14,
                },
              ]}
            >
              <Ionicons
                name="arrow-down"
                size={15}
                color={isDark ? Colors.black : Colors.white}
              />
              <Text style={styles.latestButtonText}>Latest</Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheetModal>

      <GiphySearchModal
        visible={gifModalVisible}
        onClose={closeGifPicker}
        onGifSelected={handleGifSelected}
        gifsCount={0}
      />
    </>
  );
}

const LiveChatStyles = (isDark: boolean) =>
  StyleSheet.create({
    handleIndicatorStyle: {
      width: 42,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    background: {
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      backgroundColor: isDark ? Colors.black : Colors.white,
      overflow: "hidden",
    },
    content: {
      position: "relative",
      flex: 1,
    },
    listContent: {
      paddingTop: 4,
    },
    header: {
      alignItems: "center",
      marginBottom: 4,
      paddingTop: 4,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    title: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    userCount: {
      marginTop: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    footerContainer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    latestButton: {
      position: "absolute",
      zIndex: 20,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      gap: 6,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: isDark ? Colors.white : Colors.black,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 6,
    },
    latestButtonText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      color: isDark ? Colors.black : Colors.white,
    },
  });
