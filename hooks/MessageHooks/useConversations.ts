import { useAuth } from "hooks/UserHooks/useAuth";
import {
  deleteConversation as deleteConversationRequest,
  getConversations,
  normalizeConversation,
  pinConversation,
} from "services/messagesApi";
import {
  emitConversationDelete,
  emitConversationPin,
  getMessagesSocket,
} from "services/messagesSocket";
import { MessageItem } from "types/messages";
import { useCallback, useEffect, useMemo, useState } from "react";

const sortConversations = (items: MessageItem[]) =>
  [...items].sort((a, b) => {
    const pinnedDelta = Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));
    if (pinnedDelta !== 0) return pinnedDelta;

    const aTime = new Date(a.lastMessageAt ?? a.updatedAt ?? 0).getTime();
    const bTime = new Date(b.lastMessageAt ?? b.updatedAt ?? 0).getTime();

    return bTime - aTime;
  });

const upsertConversation = (
  conversations: MessageItem[],
  nextConversation: MessageItem,
) => {
  const exists = conversations.some((item) => item.id === nextConversation.id);

  if (!exists) return sortConversations([nextConversation, ...conversations]);

  return sortConversations(
    conversations.map((item) =>
      item.id === nextConversation.id
        ? {
            ...item,
            ...nextConversation,
            isPinned: nextConversation.isPinned ?? item.isPinned,
          }
        : item,
    ),
  );
};

const getPresenceUserId = (payload: any) =>
  payload?.userId ?? payload?.id ?? payload?.user?.id;

const getPresenceOnline = (payload: any) =>
  Boolean(payload?.isOnline ?? payload?.online ?? payload?.user?.isOnline);

export const useConversations = (search: string) => {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedSearch = useMemo(() => search.trim(), [search]);

  const loadConversations = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const nextConversations = await getConversations(normalizedSearch);
        setConversations(sortConversations(nextConversations));
      } catch (err: any) {
        setError(err?.response?.data?.error ?? err.message ?? "Messages failed to load.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [normalizedSearch],
  );

  const refresh = useCallback(() => {
    loadConversations({ refreshing: true });
  }, [loadConversations]);

  const togglePinConversation = useCallback(async (item: MessageItem) => {
    const nextPinned = !item.isPinned;
    const previous = conversations;

    setConversations((current) =>
      sortConversations(
        current.map((conversation) =>
          conversation.id === item.id
            ? { ...conversation, isPinned: nextPinned }
            : conversation,
        ),
      ),
    );

    try {
      emitConversationPin(item.id, nextPinned);
      const updatedConversation = await pinConversation(item.id, nextPinned);
      setConversations((current) =>
        upsertConversation(current, updatedConversation),
      );
    } catch (err: any) {
      setConversations(previous);
      setError(err?.response?.data?.error ?? err.message ?? "Could not update pinned conversation.");
    }
  }, [conversations]);

  const deleteConversation = useCallback(async (item: MessageItem) => {
    const previous = conversations;

    setConversations((current) =>
      current.filter((conversation) => conversation.id !== item.id),
    );

    try {
      emitConversationDelete(item.id);
      await deleteConversationRequest(item.id);
    } catch (err: any) {
      setConversations(previous);
      setError(err?.response?.data?.error ?? err.message ?? "Could not delete conversation.");
    }
  }, [conversations]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadConversations();
    }, normalizedSearch ? 250 : 0);

    return () => clearTimeout(timeout);
  }, [loadConversations, normalizedSearch]);

  useEffect(() => {
    const socket = getMessagesSocket(token);
    if (!socket) return;

    const handleConversationUpdate = (payload: any) => {
      const rawConversation = payload?.conversation ?? payload;
      const conversation = normalizeConversation(rawConversation);

      if (!conversation.id) return;

      setConversations((current) => upsertConversation(current, conversation));
    };

    const handleConversationRead = (payload: any) => {
      const conversationId = String(payload?.conversationId ?? payload?.id ?? "");

      if (!conversationId) return;

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        ),
      );
    };

    const handleConversationDeleted = (payload: any) => {
      const conversationId = String(
        payload?.conversationId ?? payload?.conversation?.id ?? payload?.id ?? "",
      );

      if (!conversationId) return;

      setConversations((current) =>
        current.filter((conversation) => conversation.id !== conversationId),
      );
    };

    const handleConversationPin = (payload: any) => {
      const conversationId = String(
        payload?.conversationId ?? payload?.conversation?.id ?? payload?.id ?? "",
      );
      const isPinned = Boolean(payload?.isPinned ?? payload?.pinned);

      if (!conversationId) return;

      setConversations((current) =>
        sortConversations(
          current.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, isPinned }
              : conversation,
          ),
        ),
      );
    };

    const handlePresenceUpdate = (payload: any) => {
      const userId = getPresenceUserId(payload);

      if (!userId) return;

      const isOnline = getPresenceOnline(payload);

      setConversations((current) =>
        current.map((conversation) =>
          String(conversation.userId) === String(userId)
            ? { ...conversation, isOnline }
            : conversation,
        ),
      );
    };

    const handleNewMessage = (payload: any) => {
      if (payload?.conversation) {
        handleConversationUpdate(payload.conversation);
        return;
      }

      const conversationId = String(payload?.conversationId ?? "");
      if (!conversationId) return;

      setConversations((current) =>
        sortConversations(
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  lastMessage: payload?.text ?? conversation.lastMessage,
                  timestamp: payload?.timestampLabel ?? conversation.timestamp,
                  lastMessageAt:
                    payload?.createdAt ?? payload?.timestamp ?? conversation.lastMessageAt,
                  unreadCount: payload?.isCurrentUser
                    ? conversation.unreadCount
                    : conversation.unreadCount + 1,
                }
              : conversation,
          ),
        ),
      );
    };

    socket.on("conversation:update", handleConversationUpdate);
    socket.on("conversation:read", handleConversationRead);
    socket.on("conversation:deleted", handleConversationDeleted);
    socket.on("conversation:delete", handleConversationDeleted);
    socket.on("conversation:pin", handleConversationPin);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("conversation:update", handleConversationUpdate);
      socket.off("conversation:read", handleConversationRead);
      socket.off("conversation:deleted", handleConversationDeleted);
      socket.off("conversation:delete", handleConversationDeleted);
      socket.off("conversation:pin", handleConversationPin);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("message:new", handleNewMessage);
    };
  }, [token]);

  return {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refresh,
    togglePinConversation,
    deleteConversation,
  };
};
