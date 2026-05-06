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
  type PropsWithChildren,
} from "react";
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";
import type { ChatMessageItem } from "types/chat";
import type { ChatSendPayload } from "utils/chatPayload";
import { createMessageKey } from "utils/chatUtils";
import { snapPoints } from "utils/modalUtils";
import ChatInputBar from "./ChatInputBar";
import ChatMessage from "./ChatMessage";
import { GiphySearchModal } from "./GiphySearchSheet";

const EMOJIS = ["😂", "😱", "😳", "🔥"];
const FALLBACK_INPUT_HEIGHT = 84;
const NEAR_BOTTOM_THRESHOLD = 96;

const ChatSheetContainer = ({ children }: PropsWithChildren) => {
  return <View style={StyleSheet.absoluteFill}>{children}</View>;
};
type Props = {
  messages: ChatMessageItem[];
  userCount: number;
  currentUserName: string;
  onReaction: (messageId: string, emoji: string) => void;
  onSend: (payload: ChatSendPayload) => boolean | Promise<boolean>;
  inputDisabled?: boolean;
  onDismiss: () => void;
};

export default function LiveChat({
  messages,
  userCount,
  currentUserName,
  onReaction,
  onSend,
  inputDisabled = false,
  onDismiss,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { top, bottom } = useSafeAreaInsets();
  const styles = useMemo(() => liveChatStyles(isDark), [isDark]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const listRef = useRef<BottomSheetFlatListMethods>(null);

  const [inputHeight, setInputHeight] = useState(FALLBACK_INPUT_HEIGHT);
  const [showLatestButton, setShowLatestButton] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);
  const [gifModalVisible, setGifModalVisible] = useState(false);

  const isNearBottomRef = useRef(true);
  const previousMessageCountRef = useRef(messages.length);

  const scrollToLatestMessage = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
      isNearBottomRef.current = true;
      setShowLatestButton(false);
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

    requestAnimationFrame(() => {
      setGifModalVisible(true);
    });
  }, []);

  const closeGifPicker = useCallback(() => {
    Keyboard.dismiss();
    setGifModalVisible(false);
  }, []);

  const handleGifSelected = useCallback((gifUrl: string) => {
    setSelectedGifUrl(gifUrl);
    setGifModalVisible(false);
  }, []);

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
          onHeightChange={setInputHeight}
          onSent={handleMessageSent}
          selectedGifUrl={selectedGifUrl}
          onSelectedGifUrlChange={setSelectedGifUrl}
          onOpenGifPicker={openGifPicker}
        />
      </BottomSheetFooter>
    ),
    [
      handleMessageSent,
      handleSend,
      inputDisabled,
      isDark,
      openGifPicker,
      selectedGifUrl,
      styles.footerContainer,
    ],
  );

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onDismiss={onDismiss}
        topInset={top}
        containerComponent={ChatSheetContainer}
        containerStyle={styles.sheetContainer}
        footerComponent={renderFooter}
        enablePanDownToClose
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
            pressBehavior="close"
            style={styles.backdrop}
          />
        )}
        backgroundComponent={() => (
          <View style={[StyleSheet.absoluteFill, styles.background]}>
            <BlurView
              intensity={80}
              tint={
                isDark
                  ? "systemChromeMaterialDark"
                  : "systemChromeMaterialLight"
              }
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      >
        <View style={styles.content}>
          <BottomSheetFlatList<ChatMessageItem>
            ref={listRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={header}
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
                  bottom: inputHeight  + 14,
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

const liveChatStyles = (isDark: boolean) =>
  StyleSheet.create({
    sheetContainer: {
      zIndex: 10000,
      elevation: 10000,
    },
    handleIndicatorStyle: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      width: 42,
    },
    backdrop: {
      zIndex: 9999,
      elevation: 9999,
    },
    background: {
      overflow: "hidden",
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    content: {
      flex: 1,
      position: "relative",
    },
    listContent: {
      paddingTop: 4,
    },
    header: {
      paddingTop: 4,
      paddingBottom: 10,
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      marginBottom: 4,
    },
    title: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    userCount: {
      marginTop: 2,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
    },
    footerContainer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    latestButton: {
      position: "absolute",
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: isDark ? Colors.white : Colors.black,
      shadowColor: Colors.black,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
      zIndex: 20,
    },
    latestButtonText: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 12,
      color: isDark ? Colors.black : Colors.white,
    },
  });