import { useMessagesContext } from "contexts/MessagesContext";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { updateConversationThemePreference } from "services/messagesApi";
import {
  emitTypingStart,
  emitTypingStop,
  getMessagesSocket,
} from "services/messagesSocket";
import {
  ComposeDirectMessagePayload,
  MessageThemePreference,
} from "types/messages";
import {
  DEFAULT_MESSAGE_THEME_PREFERENCE,
  resolveMessageAccent,
} from "utils/messageTheme";

export const useDirectMessages = (
  conversationId: string,
  options: { isVisible?: boolean } = {},
) => {
  const { token } = useAuth();
  const isVisible = options.isVisible ?? true;
  const {
    getConversationById,
    getMessageState,
    loadConversationMessages,
    loadOlderMessages,
    sendDirectMessage,
    markRead,
    upsertConversation,
  } = useMessagesContext();

  const conversation = getConversationById(conversationId);
  const messageState = getMessageState(conversationId);

  const [messageThemePreference, setMessageThemePreference] =
    useState<MessageThemePreference>(DEFAULT_MESSAGE_THEME_PREFERENCE);
  const [sendError, setSendError] = useState<string | null>(null);
  const [
    isUpdatingMessageThemePreference,
    setIsUpdatingMessageThemePreference,
  ] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const didRequestInitialLoadRef = useRef<Record<string, boolean>>({});

  const socket = useMemo(() => getMessagesSocket(token), [token]);
  const messageAccent = useMemo(
    () => resolveMessageAccent(messageThemePreference),
    [messageThemePreference],
  );

  useEffect(() => {
    setMessageThemePreference(
      conversation?.messageThemePreference ?? DEFAULT_MESSAGE_THEME_PREFERENCE,
    );
  }, [conversation?.messageThemePreference]);

  useEffect(() => {
    if (!conversationId) return;

    const hasCachedMessages = messageState.messages.length > 0;
    const hasRequested = didRequestInitialLoadRef.current[conversationId];

    if (hasRequested) return;

    didRequestInitialLoadRef.current[conversationId] = true;

    void loadConversationMessages(conversationId, {
      background: hasCachedMessages,
    });
  }, [conversationId, loadConversationMessages, messageState.messages.length]);

  useEffect(() => {
    if (
      !conversationId ||
      !isVisible ||
      messageState.messages.length === 0 ||
      !conversation?.unreadCount
    ) {
      return;
    }

    void markRead(conversationId);
  }, [
    conversation?.unreadCount,
    conversationId,
    isVisible,
    markRead,
    messageState.messages.length,
  ]);
  const refresh = useCallback(() => {
    return loadConversationMessages(conversationId, { background: true });
  }, [conversationId, loadConversationMessages]);

  const loadOlder = useCallback(() => {
    return loadOlderMessages(conversationId);
  }, [conversationId, loadOlderMessages]);

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
    async (payload: ComposeDirectMessagePayload) => {
      setSendError(null);

      try {
        const didSend = await sendDirectMessage(conversationId, payload);

        if (didSend) {
          stopTyping();
        }

        return didSend;
      } catch (error: any) {
        setSendError(error?.message ?? "Message failed to send.");
        return false;
      }
    },
    [conversationId, sendDirectMessage, stopTyping],
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

        if (conversation) {
          upsertConversation({
            ...conversation,
            messageThemePreference: savedPreference,
          });
        }

        return savedPreference;
      } finally {
        setIsUpdatingMessageThemePreference(false);
      }
    },
    [conversation, conversationId, upsertConversation],
  );

  useEffect(() => {
    if (!socket || !conversationId) return;

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

    socket.on("typing:update", handleTypingUpdate);

    return () => {
      socket.off("typing:update", handleTypingUpdate);
    };
  }, [conversation?.userId, conversationId, socket]);

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
    messages: messageState.messages,
    messageThemePreference,
    messageAccent,
    updateMessageThemePreference,
    isUpdatingMessageThemePreference,
    isLoading: messageState.isLoading,
    isRefreshing: messageState.isRefreshing,
    isLoadingMore: messageState.isLoadingMore,
    hasMore: messageState.hasMore,
    error: messageState.error,
    sendError,
    isOtherUserTyping,
    refresh,
    loadOlder,
    sendMessage,
    notifyTyping,
  };
};
