import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessageItem, IncomingChatMessage } from "types/chat";
import { buildChatPayload, type ChatSendPayload } from "utils/chatPayload";
import {
  areSameChatMessage,
  createClientMessage,
  createSendPayloadKey,
  dedupeMessages,
  mergeChatMessages,
  normalizeMessage,
  normalizeProfileImage,
} from "utils/chatUtils";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;
const DUPLICATE_SEND_BLOCK_MS = 800;

export function useLiveGameChat(gameId: string | number) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const cacheLoadedRef = useRef(false);
  const recentSendRef = useRef<{ key: string; time: number } | null>(null);

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const roomId = useMemo(() => String(gameId), [gameId]);
  const storageKey = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return `chat_${roomId}_${today}`;
  }, [roomId]);

  const currentUserName = user?.username?.trim() || "Anonymous";
  const currentUserProfileImage = normalizeProfileImage(user?.profile_image);

  const upsertMessage = useCallback((incomingMessage: IncomingChatMessage) => {
    const normalizedMessage = normalizeMessage(incomingMessage);
    if (!normalizedMessage) return false;

    setMessages((prevMessages) => {
      const existingIndex = prevMessages.findIndex((message) =>
        areSameChatMessage(message, normalizedMessage),
      );

      if (existingIndex === -1) {
        return [...prevMessages, normalizedMessage];
      }

      const mergedMessage = mergeChatMessages(
        prevMessages[existingIndex],
        normalizedMessage,
      );

      if (mergedMessage === prevMessages[existingIndex]) {
        return prevMessages;
      }

      const nextMessages = [...prevMessages];
      nextMessages[existingIndex] = mergedMessage;
      return nextMessages;
    });

    return true;
  }, []);

  useEffect(() => {
    let isMounted = true;
    cacheLoadedRef.current = false;
    setMessages([]);
    setUserCount(0);

    const loadCachedMessages = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem(storageKey);
        if (!isMounted) return;

        if (!savedMessages) {
          setMessages([]);
          return;
        }

        const parsedMessages: unknown = JSON.parse(savedMessages);
        if (!Array.isArray(parsedMessages)) {
          setMessages([]);
          return;
        }

        const normalizedMessages = parsedMessages
          .map((message) => normalizeMessage(message as IncomingChatMessage))
          .filter((message): message is ChatMessageItem => message !== null);

        setMessages(dedupeMessages(normalizedMessages));
      } catch (error) {
        console.warn("Failed to load live chat cache", error);
        if (isMounted) setMessages([]);
      } finally {
        if (isMounted) {
          cacheLoadedRef.current = true;
        }
      }
    };

    loadCachedMessages();

    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!cacheLoadedRef.current) return;

    AsyncStorage.setItem(storageKey, JSON.stringify(messages)).catch((error) =>
      console.warn("Failed to persist live chat cache", error),
    );
  }, [messages, storageKey]);

  useEffect(() => {
    setIsReady(false);

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    const handleConnect = () => {
      socket.emit("joinGame", roomId);
      setIsReady(true);
    };

    const handleDisconnect = () => {
      setIsReady(false);
    };

    const handleReceiveMessage = (message: IncomingChatMessage) => {
      upsertMessage(message);
    };

    socketRef.current = socket;
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userCount", setUserCount);

    return () => {
      socket.emit("leaveGame", roomId);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userCount", setUserCount);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, upsertMessage]);

  const sendMessage = useCallback(
    (sendPayload: ChatSendPayload) => {
      const payload = buildChatPayload(
        sendPayload.text ?? "",
        sendPayload.gifUrl,
      );
      const socket = socketRef.current;
      if (!payload || !socket) return false;

      const now = Date.now();
      const sendKey = createSendPayloadKey(payload);
      const recentSend = recentSendRef.current;

      if (
        recentSend?.key === sendKey &&
        now - recentSend.time < DUPLICATE_SEND_BLOCK_MS
      ) {
        return false;
      }

      const message = createClientMessage(payload, {
        userName: currentUserName,
        profileImage: currentUserProfileImage,
        gameId: roomId,
        now,
      });

      if (!message) return false;

      recentSendRef.current = { key: sendKey, time: now };
      socket.emit("sendMessage", message);
      upsertMessage(message);
      return true;
    },
    [currentUserName, currentUserProfileImage, roomId, upsertMessage],
  );

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      setMessages((prevMessages) => {
        const messageIndex = prevMessages.findIndex(
          (message) =>
            message.id === messageId || message.clientId === messageId,
        );

        if (messageIndex === -1) return prevMessages;

        const nextMessages = [...prevMessages];
        const message = nextMessages[messageIndex];
        const reactions = { ...(message.reactions ?? {}) };
        const users = reactions[emoji] ?? [];

        reactions[emoji] = users.includes(currentUserName)
          ? users.filter((userName) => userName !== currentUserName)
          : [...users, currentUserName];

        nextMessages[messageIndex] = {
          ...message,
          reactions,
        };

        return nextMessages;
      });
    },
    [currentUserName],
  );

  return {
    messages,
    userCount,
    currentUserName,
    isReady,
    sendMessage,
    addReaction,
  };
}
