import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userPlaceholderImage from "assets/Placeholders/userPlaceholder.png";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { format } from "date-fns";
import { BlurView } from "expo-blur";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";
import { BASE_URL } from "utils/apiClient";
import ChatMessage from "./ChatMessage";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:4000";

interface Message {
  id: string;
  user: string;
  message: string;
  time: number;
  profile_image?: string | number;
  gif_url?: string;
  reactions?: Record<string, string[]>;
  gameId?: string | number;
}

interface SendMessagePayload {
  text?: string;
  gifUrl?: string;
}

interface Props {
  gameId: string | number;
  onChange?: (index: number) => void;
  onSend?: (sendFn: (payload: SendMessagePayload) => void) => void;
}

const EMOJIS = ["😂", "😱", "😳", "🔥"];

const isSameMessage = (a: Message, b: Message) =>
  a.id === b.id ||
  (a.user === b.user &&
    a.time === b.time &&
    a.message === b.message &&
    a.gif_url === b.gif_url);

export default function LiveChat({ gameId, onChange, onSend }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { top, bottom } = useSafeAreaInsets();
  const { user } = useAuth();

  const styles = LiveChatStyles(isDark);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const socketRef = useRef<Socket | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [userCount, setUserCount] = useState(0);

  const userName = user?.username ?? "Anonymous";
  const userProfile = user?.profile_image ?? userPlaceholderImage;

  const contentPaddingBottom = bottom + 150;

  const roomId = String(gameId);
  const storageKey = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return `chat_${roomId}_${today}`;
  }, [roomId]);

  const appendUniqueMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => isSameMessage(m, msg))) return prev;
      return [...prev, msg];
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      setMessages((prev) => {
        const index = prev.findIndex((message) => message.id === messageId);
        if (index === -1) return prev;

        const copy = [...prev];
        const msg = { ...copy[index] };

        msg.reactions = { ...(msg.reactions ?? {}) };
        const users = msg.reactions[emoji] ?? [];

        if (users.includes(userName)) {
          msg.reactions[emoji] = users.filter((u) => u !== userName);
        } else {
          msg.reactions[emoji] = [...users, userName];
        }

        copy[index] = msg;
        return copy;
      });
    },
    [userName],
  );

  // OPEN SHEET
  useEffect(() => {
    if (gameId != null) {
      setMessages([]);
      setUserCount(0);
      const t = setTimeout(() => bottomSheetRef.current?.expand(), 80);
      return () => clearTimeout(t);
    }
  }, [gameId]);

  // SOCKET
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinGame", roomId);
    });

    socket.on("receiveMessage", (msg: Message) => {
      appendUniqueMessage(msg);
      scrollToBottom();
    });

    socket.on("userCount", setUserCount);

    return () => {
      socket.disconnect();
    };
  }, [roomId, appendUniqueMessage, scrollToBottom]);

  const sendMessage = useCallback(
    ({ text, gifUrl }: SendMessagePayload) => {
      const cleanText = text?.trim();

      if (!cleanText && !gifUrl) return;

      const msg: Message = {
        id: `${userName}-${Date.now()}`,
        user: userName,
        message: cleanText ?? "",
        time: Date.now(),
        profile_image: userProfile,
        gif_url: gifUrl,
        gameId: roomId,
      };

      socketRef.current?.emit("sendMessage", msg);

      appendUniqueMessage(msg);
      scrollToBottom();
    },
    [appendUniqueMessage, scrollToBottom, userName, userProfile, roomId],
  );

  useEffect(() => {
    onSend?.(sendMessage);
  }, [onSend, sendMessage]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (!saved || !isMounted) return;

        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          scrollToBottom();
        }
      } catch (error) {
        console.warn("Failed to load live chat cache", error);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [scrollToBottom, storageKey]);

  useEffect(() => {
    AsyncStorage.setItem(storageKey, JSON.stringify(messages)).catch((error) =>
      console.warn("Failed to persist live chat cache", error),
    );
  }, [messages, storageKey]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <ChatMessage
        item={item}
        index={index}
        userName={userName}
        isDark={isDark}
        baseUrl={BASE_URL}
        emojis={EMOJIS}
        onReaction={addReaction}
      />
    ),
    [addReaction, isDark, userName],
  );

  const header = useMemo(
    () => (
      <View style={styles.userCountContainer}>
        <Text style={styles.userCount}>
          {userCount} {userCount === 1 ? "person" : "people"} in chat
        </Text>
      </View>
    ),
    [styles.userCount, styles.userCountContainer, userCount],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["85%"]}
      onChange={onChange}
      topInset={top + 62}
      enablePanDownToClose
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
            tint="systemThinMaterial"
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
    >
      <BottomSheetFlatList<Message>
        ref={listRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        onContentSizeChange={scrollToBottom}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={16}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
      />
    </BottomSheet>
  );
}

const LiveChatStyles = (isDark: boolean) =>
  StyleSheet.create({
    handleIndicatorStyle: {
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    background: {
      overflow: "hidden",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    userCountContainer: {
      paddingVertical: 6,
      alignItems: "center",
    },
    userCount: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
    },
  });
