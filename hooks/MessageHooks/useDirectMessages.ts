import { useAuth } from "hooks/UserHooks/useAuth";
import {
  getConversation,
  getMessages,
  markConversationRead,
  normalizeConversation,
  normalizeMessage,
  sendMessageRest,
  updateConversationThemePreference,
} from "services/messagesApi";
import {
  emitConversationRead,
  emitMessageSend,
  emitTypingStart,
  emitTypingStop,
  getMessagesSocket,
} from "services/messagesSocket";
import {
  DirectMessageItem,
  MessageItem,
  MessageThemePreference,
  SendDirectMessagePayload,
} from "types/messages";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_MESSAGE_THEME_PREFERENCE,
  resolveMessageAccent,
} from "utils/messageTheme";

const createClientId = () =>
  `dm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const formatTimestamp = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const upsertMessage = (
  messages: DirectMessageItem[],
  nextMessage: DirectMessageItem,
): DirectMessageItem[] => {
  const byClientId =
    nextMessage.clientId &&
    messages.findIndex((message) => message.clientId === nextMessage.clientId);

  if (typeof byClientId === "number" && byClientId >= 0) {
    return messages.map((message, index) =>
      index === byClientId
        ? { ...nextMessage, status: "sent" as const }
        : message,
    );
  }

  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages.map((message) =>
      message.id === nextMessage.id ? { ...message, ...nextMessage } : message,
    );
  }

  return [...messages, nextMessage];
};

const getSocketAckMessage = (response: any) =>
  response?.message ?? response?.data?.message ?? response?.data ?? response;

export const useDirectMessages = (conversationId: string) => {
  const { token, user } = useAuth();

  const [conversation, setConversation] = useState<MessageItem | null>(null);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [messageThemePreference, setMessageThemePreference] =
    useState<MessageThemePreference>(DEFAULT_MESSAGE_THEME_PREFERENCE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [
    isUpdatingMessageThemePreference,
    setIsUpdatingMessageThemePreference,
  ] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const socket = useMemo(() => getMessagesSocket(token), [token]);
  const messageAccent = useMemo(
    () => resolveMessageAccent(messageThemePreference),
    [messageThemePreference],
  );

  const markRead = useCallback(async () => {
    if (!conversationId) return;

    emitConversationRead(conversationId);

    try {
      await markConversationRead(conversationId);
    } catch {
      // Read state is best-effort and will be corrected by later refreshes.
    }
  }, [conversationId]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [nextMessages, nextConversation] = await Promise.all([
        getMessages(conversationId),
        getConversation(conversationId, user?.id),
      ]);

      setMessages(nextMessages);
      setConversation(nextConversation);
      setMessageThemePreference(
        nextConversation?.messageThemePreference ??
          DEFAULT_MESSAGE_THEME_PREFERENCE,
      );
      await markRead();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ??
          err.message ??
          "Messages failed to load.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, markRead, user?.id]);

  const refresh = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !isTypingRef.current) return;

    emitTypingStop(conversationId);
    isTypingRef.current = false;
  }, [conversationId]);

  const notifyTyping = useCallback(
    (value: string) => {
      if (!conversationId) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (!value.trim()) {
        stopTyping();
        return;
      }

      if (!isTypingRef.current) {
        emitTypingStart(conversationId);
        isTypingRef.current = true;
      }

      typingTimeoutRef.current = setTimeout(stopTyping, 1200);
    },
    [conversationId, stopTyping],
  );

  const sendMessage = useCallback(
    async (payload: Omit<SendDirectMessagePayload, "clientId">) => {
      const text = payload.text?.trim() ?? "";
      const attachment = payload.attachment ?? null;

      if (!conversationId || (!text && !attachment)) return false;

      if (
        attachment?.type === "image" &&
        !/^https?:\/\//i.test(attachment.uri)
      ) {
        setSendError("Image uploads are not available yet.");
        return false;
      }

      const clientId = createClientId();

      const optimisticMessage: DirectMessageItem = {
        id: clientId,
        conversationId,
        text,
        attachment,
        timestamp: formatTimestamp(new Date()),
        createdAt: new Date().toISOString(),
        isCurrentUser: true,
        clientId,
        status: "pending",
      };

      setSendError(null);
      setMessages((current) => upsertMessage(current, optimisticMessage));
      stopTyping();

      const requestPayload = {
        conversationId,
        text,
        attachment,
        clientId,
      };

      const handleFailure = (message: string) => {
        setMessages((current) =>
          current.filter((item) => item.clientId !== clientId),
        );
        setSendError(message);
      };

      if (socket?.connected) {
        emitMessageSend(requestPayload, (response: any) => {
          if (response?.error) {
            handleFailure(response.error);
            return;
          }

          const rawMessage = getSocketAckMessage(response);

          if (!rawMessage) return;

          const savedMessage = normalizeMessage({
            ...rawMessage,
            conversationId: rawMessage.conversationId ?? conversationId,
          });

          setMessages((current) => upsertMessage(current, savedMessage));
        });

        return true;
      }

      try {
        const savedMessage = await sendMessageRest(conversationId, {
          text,
          attachment,
          clientId,
        });

        setMessages((current) => upsertMessage(current, savedMessage));

        return true;
      } catch (err: any) {
        handleFailure(
          err?.response?.data?.error ??
            err.message ??
            "Message failed to send.",
        );

        return false;
      }
    },
    [conversationId, socket?.connected, stopTyping],
  );

  const updateMessageThemePreference = useCallback(
    async (nextPreference: MessageThemePreference) => {
      if (!conversationId) {
        throw new Error("Conversation is not available.");
      }

      setIsUpdatingMessageThemePreference(true);

      try {
        const savedPreference = await updateConversationThemePreference(
          conversationId,
          nextPreference,
        );

        setMessageThemePreference(savedPreference);
        setConversation((current) =>
          current
            ? {
                ...current,
                messageThemePreference: savedPreference,
              }
            : current,
        );

        return savedPreference;
      } finally {
        setIsUpdatingMessageThemePreference(false);
      }
    },
    [conversationId],
  );

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (payload: any) => {
      const rawMessage = payload?.message
        ? {
            ...payload.message,
            conversationId:
              payload.message.conversationId ?? payload.conversationId,
          }
        : payload;

      const message = normalizeMessage(rawMessage);

      if (message.conversationId !== conversationId) return;

      setMessages((current) => upsertMessage(current, message));
      setIsOtherUserTyping(false);
      markRead();
    };

    const handleTypingUpdate = (payload: any) => {
      const payloadConversationId = String(payload?.conversationId ?? "");

      if (payloadConversationId !== conversationId) return;

      const senderId = payload?.senderId ?? payload?.userId;
      const isCurrentUser = Boolean(payload?.isCurrentUser);

      if (isCurrentUser) return;

      if (!senderId || String(senderId) === String(conversation?.userId)) {
        setIsOtherUserTyping(Boolean(payload?.isTyping ?? payload?.typing));
      }
    };

    const handleConversationUpdate = (payload: any) => {
      const rawConversation = payload?.conversation ?? payload;
      const nextConversation = normalizeConversation(rawConversation, user?.id);

      if (nextConversation.id === conversationId) {
        setConversation(nextConversation);
        setMessageThemePreference(
          nextConversation.messageThemePreference ??
            DEFAULT_MESSAGE_THEME_PREFERENCE,
        );
      }
    };

    const handlePresenceUpdate = (payload: any) => {
      const userId = payload?.userId ?? payload?.id ?? payload?.user?.id;

      if (!userId || String(userId) !== String(conversation?.userId)) return;

      setConversation((current) =>
        current
          ? {
              ...current,
              isOnline: Boolean(
                payload?.isOnline ??
                  payload?.online ??
                  payload?.user?.isOnline,
              ),
            }
          : current,
      );
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:update", handleTypingUpdate);
    socket.on("conversation:update", handleConversationUpdate);
    socket.on("presence:update", handlePresenceUpdate);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:update", handleTypingUpdate);
      socket.off("conversation:update", handleConversationUpdate);
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [conversation?.userId, conversationId, markRead, socket, user?.id]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      stopTyping();
    };
  }, [stopTyping]);

  return {
    conversation,
    messages,
    messageThemePreference,
    messageAccent,
    updateMessageThemePreference,
    isUpdatingMessageThemePreference,
    isLoading,
    error,
    sendError,
    isOtherUserTyping,
    refresh,
    sendMessage,
    notifyTyping,
  };
};
