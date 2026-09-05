import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { useNotifications } from "contexts/NotificationContext";
import {
  createConversation as createConversationRequest,
  deleteConversation as deleteConversationRequest,
  getConversation,
  getConversations,
  getMessagesPage,
  markConversationRead,
  normalizeConversation,
  normalizeConversationReadPayload,
  normalizeMessage,
  pinConversation,
  sendMessageRest,
} from "services/messagesApi";
import {
  disconnectMessagesSocket,
  emitConversationDelete,
  emitConversationPin,
  emitConversationRead,
  emitMessageSend,
  getMessagesSocket,
} from "services/messagesSocket";
import type {
  ConversationReadPayload,
  ConversationReadPosition,
  ComposeDirectMessagePayload,
  DirectMessageItem,
  MessageItem,
} from "types/messages";

const CONVERSATION_PAGE_SIZE = 50;
const MESSAGE_PAGE_SIZE = 50;
const MESSAGE_CACHE_LIMIT = 150;

const normalizeId = (value: unknown) => String(value ?? "").trim();

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.error ??
  error?.response?.data?.message ??
  error?.message ??
  fallback;

const createClientId = () =>
  `dm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const formatTimestamp = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const getConversationTime = (item: MessageItem) =>
  new Date(
    item.activityAt ?? item.lastMessageAt ?? item.updatedAt ?? 0,
  ).getTime();

const sortConversations = (items: MessageItem[]) =>
  [...items].sort((a, b) => {
    const pinnedDelta =
      Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));

    if (pinnedDelta !== 0) return pinnedDelta;

    const timeDelta = getConversationTime(b) - getConversationTime(a);

    if (timeDelta !== 0) return timeDelta;

    return normalizeId(b.id).localeCompare(normalizeId(a.id));
  });

const getPreviewText = (message: DirectMessageItem) => {
  const text = message.text?.trim();

  if (text) return text;
  if (message.attachment?.type === "gif") return "GIF";
  if (message.attachment?.type === "image") return "Image";

  return "";
};

const matchesConversation = (a: MessageItem, b: MessageItem) => {
  const aId = normalizeId(a.id);
  const bId = normalizeId(b.id);

  if (aId && bId && aId === bId) return true;

  const aDmKey = normalizeId(a.dmKey);
  const bDmKey = normalizeId(b.dmKey);

  return Boolean(aDmKey && bDmKey && aDmKey === bDmKey);
};

const upsertConversationInList = (list: MessageItem[], next: MessageItem) => {
  if (!normalizeId(next.id)) return list;

  const index = list.findIndex((item) => matchesConversation(item, next));

  if (index < 0) {
    return sortConversations([next, ...list]);
  }

  const merged = list.map((item, itemIndex) =>
    itemIndex === index
      ? {
          ...item,
          ...next,
          readReceipts: {
            ...(item.readReceipts ?? {}),
            ...(next.readReceipts ?? {}),
          },
          currentUserLastReadAt:
            next.currentUserLastReadAt ?? item.currentUserLastReadAt,
          otherParticipantLastReadAt:
            next.otherParticipantLastReadAt ?? item.otherParticipantLastReadAt,
          isPinned: next.isPinned ?? item.isPinned,
        }
      : item,
  );

  return sortConversations(merged);
};

const mergeConversations = (current: MessageItem[], incoming: MessageItem[]) =>
  incoming.reduce(
    (result, conversation) => upsertConversationInList(result, conversation),
    current,
  );

const sortMessages = (items: DirectMessageItem[]) =>
  [...items].sort((a, b) => {
    const timeDelta =
      new Date(a.createdAt ?? 0).getTime() -
      new Date(b.createdAt ?? 0).getTime();

    if (timeDelta !== 0) return timeDelta;

    return normalizeId(a.id).localeCompare(normalizeId(b.id));
  });

const upsertMessageInList = (
  messages: DirectMessageItem[],
  nextMessage: DirectMessageItem,
) => {
  const nextClientId = normalizeId(nextMessage.clientId);
  const nextId = normalizeId(nextMessage.id);

  const byClientId = nextClientId
    ? messages.findIndex(
        (message) => normalizeId(message.clientId) === nextClientId,
      )
    : -1;

  if (byClientId >= 0) {
    return sortMessages(
      messages.map((message, index) =>
        index === byClientId
          ? { ...message, ...nextMessage, status: "sent" }
          : message,
      ),
    );
  }

  const byId = nextId
    ? messages.findIndex((message) => normalizeId(message.id) === nextId)
    : -1;

  if (byId >= 0) {
    return sortMessages(
      messages.map((message, index) =>
        index === byId ? { ...message, ...nextMessage } : message,
      ),
    );
  }

  return sortMessages([...messages, nextMessage]).slice(-MESSAGE_CACHE_LIMIT);
};

const mergeMessages = (
  current: DirectMessageItem[],
  incoming: DirectMessageItem[],
) =>
  incoming.reduce(
    (result, message) => upsertMessageInList(result, message),
    current,
  );

const removeMessageFromList = (
  messages: DirectMessageItem[],
  messageId: string,
) =>
  messages.filter(
    (message) => normalizeId(message.id) !== normalizeId(messageId),
  );

type ConversationReadReceiptMap = Record<string, ConversationReadPosition>;

const hasReadReceipts = (receipts?: ConversationReadReceiptMap) =>
  Boolean(receipts && Object.keys(receipts).length > 0);

const mergeReadReceipts = (
  current?: ConversationReadReceiptMap,
  incoming?: ConversationReadReceiptMap,
) => ({
  ...(current ?? {}),
  ...(incoming ?? {}),
});

const applyReadReceiptsToConversation = (
  conversation: MessageItem,
  receipts?: ConversationReadReceiptMap,
) => {
  if (!hasReadReceipts(receipts)) return conversation;

  return {
    ...conversation,
    readReceipts: mergeReadReceipts(conversation.readReceipts, receipts),
  };
};

type ConversationListState = {
  items: MessageItem[];
  cursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loaded: boolean;
};

type MessageCacheState = {
  messages: DirectMessageItem[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loaded: boolean;
};

type MessagesContextValue = {
  getConversationList: (search?: string) => ConversationListState;
  loadConversations: (options?: {
    search?: string;
    refresh?: boolean;
    background?: boolean;
  }) => Promise<void>;
  loadMoreConversations: (search?: string) => Promise<void>;
  togglePinConversation: (item: MessageItem) => Promise<void>;
  deleteConversation: (item: MessageItem) => Promise<void>;
  createOrGetConversation: (
    recipientId: number | string,
  ) => Promise<{ conversationId: string; conversation: MessageItem | null }>;
  upsertConversation: (conversation: MessageItem) => void;
  getConversationById: (conversationId: string) => MessageItem | null;
  getMessageState: (conversationId: string) => MessageCacheState;
  loadConversationMessages: (
    conversationId: string,
    options?: { background?: boolean },
  ) => Promise<void>;
  loadOlderMessages: (conversationId: string) => Promise<void>;
  sendDirectMessage: (
    conversationId: string,
    payload: ComposeDirectMessagePayload,
  ) => Promise<boolean>;
  markRead: (conversationId: string) => Promise<void>;
};

const createConversationListState = (): ConversationListState => ({
  items: [],
  cursor: null,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  loaded: false,
});

const createMessageCacheState = (): MessageCacheState => ({
  messages: [],
  nextCursor: null,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  loaded: false,
});

const MessagesContext = createContext<MessagesContextValue | null>(null);

export function MessagesProvider({
  children,
  enabled,
  token,
  userId,
}: {
  children: ReactNode;
  enabled: boolean;
  token?: string | null;
  userId?: number | string | null;
}) {
  const { markConversationNotificationsRead } = useNotifications();

  const [conversationLists, setConversationLists] = useState<
    Record<string, ConversationListState>
  >({ "": createConversationListState() });
  const [messageCache, setMessageCache] = useState<
    Record<string, MessageCacheState>
  >({});
  const [readReceiptsByConversation, setReadReceiptsByConversation] = useState<
    Record<string, ConversationReadReceiptMap>
  >({});

  const conversationListsRef = useRef(conversationLists);
  const messageCacheRef = useRef(messageCache);
  const socketRef = useRef<ReturnType<typeof getMessagesSocket>>(null);
  const conversationRequestIdsRef = useRef<Record<string, number>>({});
  const activeConversationLoadsRef = useRef<Record<string, number>>({});
  const messageRequestIdsRef = useRef<Record<string, number>>({});
  const loadingMoreConversationsRef = useRef<Record<string, boolean>>({});
  const loadingOlderMessagesRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    conversationListsRef.current = conversationLists;
  }, [conversationLists]);

  useEffect(() => {
    messageCacheRef.current = messageCache;
  }, [messageCache]);

  const getConversationList = useCallback(
    (search = "") => {
      const state =
        conversationLists[search.trim()] ?? createConversationListState();

      return {
        ...state,
        items: state.items.map((conversation) =>
          applyReadReceiptsToConversation(
            conversation,
            readReceiptsByConversation[normalizeId(conversation.id)],
          ),
        ),
      };
    },
    [conversationLists, readReceiptsByConversation],
  );

  const getConversationById = useCallback(
    (conversationId: string) => {
      const normalizedConversationId = normalizeId(conversationId);

      for (const state of Object.values(conversationLists)) {
        const conversation = state.items.find(
          (item) => normalizeId(item.id) === normalizedConversationId,
        );

        if (conversation) {
          return applyReadReceiptsToConversation(
            conversation,
            readReceiptsByConversation[normalizedConversationId],
          );
        }
      }

      return null;
    },
    [conversationLists, readReceiptsByConversation],
  );

  const getMessageState = useCallback(
    (conversationId: string) =>
      messageCache[normalizeId(conversationId)] ?? createMessageCacheState(),
    [messageCache],
  );

  const updateConversationList = useCallback(
    (
      search: string,
      updater: (state: ConversationListState) => ConversationListState,
    ) => {
      const key = search.trim();

      setConversationLists((current) => {
        const previous = current[key] ?? createConversationListState();

        return {
          ...current,
          [key]: updater(previous),
        };
      });
    },
    [],
  );

  const cacheConversationReadReceipts = useCallback(
    (conversation: MessageItem | null | undefined) => {
      const conversationId = normalizeId(conversation?.id);
      const readReceipts = conversation?.readReceipts;

      if (!conversationId || !hasReadReceipts(readReceipts)) return;

      setReadReceiptsByConversation((current) => ({
        ...current,
        [conversationId]: mergeReadReceipts(
          current[conversationId],
          readReceipts,
        ),
      }));
    },
    [],
  );

  const clearConversationUnread = useCallback((conversationId: string) => {
    const normalizedConversationId = normalizeId(conversationId);
    if (!normalizedConversationId) return;

    setConversationLists((current) => {
      const next = { ...current };

      Object.entries(current).forEach(([key, state]) => {
        next[key] = {
          ...state,
          items: state.items.map((conversation) =>
            normalizeId(conversation.id) === normalizedConversationId
              ? { ...conversation, unreadCount: 0 }
              : conversation,
          ),
        };
      });

      return next;
    });
  }, []);

  const applyConversationReadReceipt = useCallback(
    (payload: ConversationReadPayload | null) => {
      if (!payload) return;

      const conversationId = normalizeId(payload.conversationId);
      const readerId = normalizeId(payload.readerId);
      const readAt = normalizeId(payload.readAt);

      if (!conversationId || !readerId || !readAt) return;

      const receipt: ConversationReadPosition = {
        userId: payload.readerId,
        readAt,
        lastReadMessageId: payload.lastReadMessageId ?? null,
      };
      const isCurrentUserReader = readerId === normalizeId(userId);

      setReadReceiptsByConversation((current) => ({
        ...current,
        [conversationId]: mergeReadReceipts(current[conversationId], {
          [readerId]: receipt,
        }),
      }));

      setConversationLists((current) => {
        const next = { ...current };

        Object.entries(current).forEach(([key, state]) => {
          next[key] = {
            ...state,
            items: state.items.map((conversation) => {
              if (normalizeId(conversation.id) !== conversationId) {
                return conversation;
              }

              return {
                ...conversation,
                unreadCount: isCurrentUserReader ? 0 : conversation.unreadCount,
                currentUserLastReadAt: isCurrentUserReader
                  ? readAt
                  : conversation.currentUserLastReadAt,
                otherParticipantLastReadAt: isCurrentUserReader
                  ? conversation.otherParticipantLastReadAt
                  : readAt,
                readReceipts: mergeReadReceipts(conversation.readReceipts, {
                  [readerId]: receipt,
                }),
              };
            }),
          };
        });

        return next;
      });
    },
    [userId],
  );

  const upsertConversation = useCallback(
    (conversation: MessageItem) => {
      const normalized = conversation;

      if (!normalizeId(normalized.id)) return;

      cacheConversationReadReceipts(normalized);

      setConversationLists((current) => {
        const next = { ...current };
        const keys = new Set(["", ...Object.keys(current)]);

        keys.forEach((key) => {
          const previous = current[key] ?? createConversationListState();

          next[key] = {
            ...previous,
            items: upsertConversationInList(previous.items, normalized),
          };
        });

        return next;
      });
    },
    [cacheConversationReadReceipts],
  );

  const removeConversation = useCallback((conversationId: string) => {
    const normalizedConversationId = normalizeId(conversationId);

    setConversationLists((current) => {
      const next = { ...current };

      Object.entries(current).forEach(([key, state]) => {
        next[key] = {
          ...state,
          items: state.items.filter(
            (item) => normalizeId(item.id) !== normalizedConversationId,
          ),
        };
      });

      return next;
    });

    setMessageCache((current) => {
      if (!current[normalizedConversationId]) return current;

      const next = { ...current };
      delete next[normalizedConversationId];

      return next;
    });

    setReadReceiptsByConversation((current) => {
      if (!current[normalizedConversationId]) return current;

      const next = { ...current };
      delete next[normalizedConversationId];

      return next;
    });
  }, []);

  const updatePresence = useCallback((payload: any) => {
    const presenceUserId = normalizeId(
      payload?.userId ?? payload?.id ?? payload?.user?.id,
    );

    if (!presenceUserId) return;

    const isOnline = Boolean(
      payload?.isOnline ??
      payload?.online ??
      (payload?.status === "online" ? true : undefined) ??
      payload?.user?.isOnline,
    );

    setConversationLists((current) => {
      const next = { ...current };

      Object.entries(current).forEach(([key, state]) => {
        next[key] = {
          ...state,
          items: state.items.map((conversation) =>
            normalizeId(conversation.userId) === presenceUserId
              ? {
                  ...conversation,
                  isOnline,
                }
              : conversation,
          ),
        };
      });

      return next;
    });
  }, []);

  const updateConversationPreviewFromMessage = useCallback(
    (message: DirectMessageItem) => {
      const conversationId = normalizeId(message.conversationId);
      if (!conversationId) return;

      setConversationLists((current) => {
        const next = { ...current };

        Object.entries(current).forEach(([key, state]) => {
          next[key] = {
            ...state,
            items: sortConversations(
              state.items.map((conversation) =>
                normalizeId(conversation.id) === conversationId
                  ? {
                      ...conversation,
                      lastMessage: getPreviewText(message),
                      timestamp: message.timestamp,
                      lastMessageAt: message.createdAt,
                      activityAt: message.createdAt,
                      unreadCount: message.isCurrentUser
                        ? conversation.unreadCount
                        : (conversation.unreadCount ?? 0) + 1,
                    }
                  : conversation,
              ),
            ),
          };
        });

        return next;
      });
    },
    [],
  );

  const loadConversations = useCallback(
    async ({
      search = "",
      refresh = false,
      background = false,
    }: {
      search?: string;
      refresh?: boolean;
      background?: boolean;
    } = {}) => {
      if (!enabled || !token) return;

      const key = search.trim();

      if (!refresh && activeConversationLoadsRef.current[key]) {
        return;
      }

      const requestId = (conversationRequestIdsRef.current[key] ?? 0) + 1;
      conversationRequestIdsRef.current[key] = requestId;
      activeConversationLoadsRef.current[key] = requestId;

      const currentState =
        conversationListsRef.current[key] ?? createConversationListState();
      const hasCachedItems = currentState.items.length > 0;

      updateConversationList(key, (state) => ({
        ...state,
        isLoading: !background && !refresh && state.items.length === 0,
        isRefreshing: refresh || (background && state.items.length > 0),
        error: null,
      }));

      try {
        const response = await getConversations(
          key,
          undefined,
          CONVERSATION_PAGE_SIZE,
          userId,
        );

        if (conversationRequestIdsRef.current[key] !== requestId) return;

        updateConversationList(key, (state) => ({
          ...state,
          items: mergeConversations([], response.items),
          cursor: response.nextCursor,
          hasMore: Boolean(response.nextCursor),
          isLoading: false,
          isRefreshing: false,
          isLoadingMore: false,
          error: null,
          loaded: true,
        }));

        response.items.forEach(cacheConversationReadReceipts);
      } catch (error: any) {
        if (conversationRequestIdsRef.current[key] !== requestId) return;

        updateConversationList(key, (state) => ({
          ...state,
          isLoading: false,
          isRefreshing: false,
          error:
            hasCachedItems || state.items.length > 0
              ? null
              : getErrorMessage(error, "Messages failed to load."),
        }));

        throw error;
      } finally {
        if (activeConversationLoadsRef.current[key] === requestId) {
          delete activeConversationLoadsRef.current[key];
        }
      }
    },
    [
      cacheConversationReadReceipts,
      enabled,
      token,
      updateConversationList,
      userId,
    ],
  );

  const loadMoreConversations = useCallback(
    async (search = "") => {
      if (!enabled || !token) return;

      const key = search.trim();
      const currentState =
        conversationListsRef.current[key] ?? createConversationListState();
      const cursor = currentState.cursor;

      if (
        !cursor ||
        !currentState.hasMore ||
        currentState.isLoading ||
        currentState.isRefreshing ||
        currentState.isLoadingMore ||
        loadingMoreConversationsRef.current[key]
      ) {
        return;
      }

      loadingMoreConversationsRef.current[key] = true;
      updateConversationList(key, (state) => ({
        ...state,
        isLoadingMore: true,
      }));

      try {
        const response = await getConversations(
          key,
          cursor,
          CONVERSATION_PAGE_SIZE,
          userId,
        );

        updateConversationList(key, (state) => ({
          ...state,
          items: mergeConversations(state.items, response.items),
          cursor: response.nextCursor,
          hasMore: Boolean(response.nextCursor),
          isLoadingMore: false,
        }));

        response.items.forEach(cacheConversationReadReceipts);
      } catch {
        updateConversationList(key, (state) => ({
          ...state,
          isLoadingMore: false,
        }));
      } finally {
        loadingMoreConversationsRef.current[key] = false;
      }
    },
    [
      cacheConversationReadReceipts,
      enabled,
      token,
      updateConversationList,
      userId,
    ],
  );

  const togglePinConversation = useCallback(
    async (item: MessageItem) => {
      const conversationId = normalizeId(item.id);
      if (!conversationId) throw new Error("Conversation ID is missing.");

      const nextPinned = !item.isPinned;
      let previousLists: Record<string, ConversationListState> | null = null;

      setConversationLists((current) => {
        previousLists = current;
        const next = { ...current };

        Object.entries(current).forEach(([key, state]) => {
          next[key] = {
            ...state,
            items: sortConversations(
              state.items.map((conversation) =>
                normalizeId(conversation.id) === conversationId
                  ? { ...conversation, isPinned: nextPinned }
                  : conversation,
              ),
            ),
          };
        });

        return next;
      });

      try {
        const updated = await pinConversation(conversationId, nextPinned);
        upsertConversation(updated);

        try {
          emitConversationPin(conversationId, nextPinned);
        } catch {}
      } catch (error) {
        if (previousLists) {
          setConversationLists(previousLists);
        }

        throw new Error(
          getErrorMessage(error, "Could not update pinned conversation."),
        );
      }
    },
    [upsertConversation],
  );

  const deleteConversation = useCallback(async (item: MessageItem) => {
    const conversationId = normalizeId(item.id);
    if (!conversationId) throw new Error("Conversation ID is missing.");

    let previousLists: Record<string, ConversationListState> | null = null;

    setConversationLists((current) => {
      previousLists = current;
      const next = { ...current };

      Object.entries(current).forEach(([key, state]) => {
        next[key] = {
          ...state,
          items: state.items.filter(
            (conversation) => normalizeId(conversation.id) !== conversationId,
          ),
        };
      });

      return next;
    });

    try {
      await deleteConversationRequest(conversationId);

      try {
        emitConversationDelete(conversationId);
      } catch {}
    } catch (error: any) {
      if (error?.response?.status === 404) return;

      if (previousLists) {
        setConversationLists(previousLists);
      }

      throw new Error(getErrorMessage(error, "Could not delete conversation."));
    }
  }, []);

  const createOrGetConversation = useCallback(
    async (recipientId: number | string) => {
      const result = await createConversationRequest(recipientId);
      const conversationId =
        result.conversationId ?? result.conversation?.id ?? result.id;

      if (!conversationId) {
        throw new Error("Conversation could not be opened.");
      }

      if (result.conversation) {
        upsertConversation(result.conversation);
      }

      return {
        conversationId: String(conversationId),
        conversation: result.conversation ?? null,
      };
    },
    [upsertConversation],
  );

  const updateMessageState = useCallback(
    (
      conversationId: string,
      updater: (state: MessageCacheState) => MessageCacheState,
    ) => {
      const key = normalizeId(conversationId);
      if (!key) return;

      setMessageCache((current) => {
        const previous = current[key] ?? createMessageCacheState();

        return {
          ...current,
          [key]: updater(previous),
        };
      });
    },
    [],
  );

  const loadConversationMessages = useCallback(
    async (
      conversationId: string,
      { background = false }: { background?: boolean } = {},
    ) => {
      const normalizedConversationId = normalizeId(conversationId);
      if (!enabled || !token || !normalizedConversationId) return;

      const requestId =
        (messageRequestIdsRef.current[normalizedConversationId] ?? 0) + 1;
      messageRequestIdsRef.current[normalizedConversationId] = requestId;

      const currentState =
        messageCacheRef.current[normalizedConversationId] ??
        createMessageCacheState();
      const hasCachedMessages = currentState.messages.length > 0;

      updateMessageState(normalizedConversationId, (state) => ({
        ...state,
        isLoading: !background && state.messages.length === 0,
        isRefreshing: background && state.messages.length > 0,
        error: null,
      }));

      try {
        const [messagePage, conversation] = await Promise.all([
          getMessagesPage(normalizedConversationId, {
            limit: MESSAGE_PAGE_SIZE,
          }),
          getConversation(normalizedConversationId, userId),
        ]);

        if (
          messageRequestIdsRef.current[normalizedConversationId] !== requestId
        ) {
          return;
        }

        if (conversation) {
          upsertConversation(conversation);
        }

        updateMessageState(normalizedConversationId, (state) => ({
          ...state,
          messages: mergeMessages(state.messages, messagePage.messages),
          nextCursor: messagePage.nextCursor,
          hasMore: Boolean(messagePage.nextCursor),
          isLoading: false,
          isRefreshing: false,
          error: null,
          loaded: true,
        }));
      } catch (error: any) {
        updateMessageState(normalizedConversationId, (state) => ({
          ...state,
          isLoading: false,
          isRefreshing: false,
          error:
            hasCachedMessages || state.messages.length > 0
              ? null
              : getErrorMessage(error, "Messages failed to load."),
        }));
      }
    },
    [enabled, token, updateMessageState, upsertConversation, userId],
  );

  const loadOlderMessages = useCallback(
    async (conversationId: string) => {
      const normalizedConversationId = normalizeId(conversationId);
      const state =
        messageCacheRef.current[normalizedConversationId] ??
        createMessageCacheState();
      const cursor = state.nextCursor;

      if (
        !enabled ||
        !token ||
        !normalizedConversationId ||
        !cursor ||
        !state.hasMore ||
        state.isLoadingMore ||
        loadingOlderMessagesRef.current[normalizedConversationId]
      ) {
        return;
      }

      loadingOlderMessagesRef.current[normalizedConversationId] = true;
      updateMessageState(normalizedConversationId, (current) => ({
        ...current,
        isLoadingMore: true,
      }));

      try {
        const messagePage = await getMessagesPage(normalizedConversationId, {
          limit: MESSAGE_PAGE_SIZE,
          cursor,
        });

        updateMessageState(normalizedConversationId, (current) => ({
          ...current,
          messages: mergeMessages(messagePage.messages, current.messages),
          nextCursor: messagePage.nextCursor,
          hasMore: Boolean(messagePage.nextCursor),
          isLoadingMore: false,
        }));
      } catch {
        updateMessageState(normalizedConversationId, (current) => ({
          ...current,
          isLoadingMore: false,
        }));
      } finally {
        loadingOlderMessagesRef.current[normalizedConversationId] = false;
      }
    },
    [enabled, token, updateMessageState],
  );

  const markRead = useCallback(
    async (conversationId: string) => {
      const normalizedConversationId = normalizeId(conversationId);
      if (!normalizedConversationId) return;

      clearConversationUnread(normalizedConversationId);
      markConversationNotificationsRead(normalizedConversationId);

      if (socketRef.current?.connected) {
        try {
          const readPayload = await new Promise<ConversationReadPayload | null>(
            (resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Timed out marking conversation read."));
              }, 4000);

              const didEmit = emitConversationRead(
                normalizedConversationId,
                (response: any) => {
                  clearTimeout(timeout);

                  if (response?.error) {
                    reject(new Error(String(response.error)));
                    return;
                  }

                  resolve(normalizeConversationReadPayload(response));
                },
              );

              if (!didEmit) {
                clearTimeout(timeout);
                reject(new Error("Messages socket is not connected."));
              }
            },
          );

          applyConversationReadReceipt(readPayload);
          return;
        } catch {}
      }

      try {
        const readPayload = await markConversationRead(
          normalizedConversationId,
        );

        applyConversationReadReceipt(readPayload);
      } catch {}
    },
    [
      applyConversationReadReceipt,
      clearConversationUnread,
      markConversationNotificationsRead,
    ],
  );

  const sendDirectMessage = useCallback(
    async (conversationId: string, payload: ComposeDirectMessagePayload) => {
      const normalizedConversationId = normalizeId(conversationId);
      const text = payload.text?.trim() ?? "";
      const attachment = payload.attachment ?? null;

      if (!normalizedConversationId || (!text && !attachment)) return false;

      const attachmentId = normalizeId(attachment?.id);

      if (attachment && !attachmentId) {
        throw new Error("Attachment is not ready to send.");
      }

      const clientId = createClientId();
      const optimisticMessage: DirectMessageItem = {
        id: clientId,
        conversationId: normalizedConversationId,
        text,
        attachment,
        timestamp: formatTimestamp(new Date()),
        createdAt: new Date().toISOString(),
        isCurrentUser: true,
        clientId,
        status: "pending",
      };

      updateMessageState(normalizedConversationId, (state) => ({
        ...state,
        messages: upsertMessageInList(state.messages, optimisticMessage),
      }));
      updateConversationPreviewFromMessage(optimisticMessage);

      const requestPayload = {
        conversationId: normalizedConversationId,
        text,
        ...(attachmentId ? { attachmentId } : {}),
        clientId,
      };

      const handleSavedMessage = (rawMessage: any) => {
        const savedMessage = normalizeMessage({
          ...rawMessage,
          conversationId:
            rawMessage?.conversationId ?? normalizedConversationId,
        });

        updateMessageState(normalizedConversationId, (state) => ({
          ...state,
          messages: upsertMessageInList(state.messages, savedMessage),
        }));
        updateConversationPreviewFromMessage(savedMessage);
      };

      const handleFailure = (message: string) => {
        updateMessageState(normalizedConversationId, (state) => ({
          ...state,
          messages: state.messages.filter(
            (item) => normalizeId(item.clientId) !== clientId,
          ),
        }));

        throw new Error(message);
      };

      if (socketRef.current?.connected) {
        return new Promise<boolean>((resolve, reject) => {
          emitMessageSend(requestPayload, (response: any) => {
            if (response?.error) {
              try {
                handleFailure(response.error);
              } catch (error) {
                reject(error);
              }
              return;
            }

            const rawMessage =
              response?.message ??
              response?.data?.message ??
              response?.data ??
              response;

            if (rawMessage) {
              handleSavedMessage(rawMessage);
            }

            resolve(true);
          });
        });
      }

      try {
        const savedMessage = await sendMessageRest(normalizedConversationId, {
          text,
          ...(attachmentId ? { attachmentId } : {}),
          clientId,
        });

        handleSavedMessage(savedMessage);

        return true;
      } catch (error: any) {
        handleFailure(getErrorMessage(error, "Message failed to send."));

        return false;
      }
    },
    [updateConversationPreviewFromMessage, updateMessageState],
  );

  useEffect(() => {
    if (!enabled || !token) {
      socketRef.current = null;
      disconnectMessagesSocket();
      return;
    }

    const socket = getMessagesSocket(token);
    socketRef.current = socket;

    if (!socket) return;

    const handleConversationUpdate = (payload: any) => {
      const rawConversation = payload?.conversation ?? payload;
      const conversation = normalizeConversation(rawConversation, userId);

      if (normalizeId(conversation.id)) {
        upsertConversation(conversation);
      }
    };

    const handleConversationDeleted = (payload: any) => {
      const conversationId = normalizeId(
        payload?.conversationId ?? payload?.conversation?.id ?? payload?.id,
      );

      if (conversationId) {
        removeConversation(conversationId);
      }
    };

    const handleConversationRead = (payload: any) => {
      applyConversationReadReceipt(normalizeConversationReadPayload(payload));
    };

    const handleNewMessage = (payload: any) => {
      const rawMessage = payload?.message
        ? {
            ...payload.message,
            conversationId:
              payload.message.conversationId ?? payload.conversationId,
          }
        : payload;
      const message = normalizeMessage(rawMessage);
      const conversationId = normalizeId(message.conversationId);

      if (!conversationId) return;

      setMessageCache((current) => {
        const previous = current[conversationId];

        if (!previous) return current;

        return {
          ...current,
          [conversationId]: {
            ...previous,
            messages: upsertMessageInList(previous.messages, message),
          },
        };
      });

      updateConversationPreviewFromMessage(message);

      // The canonical notification row is created transactionally by the
      // backend and arrives through the notification namespace. The message
      // socket remains responsible only for updating conversation UI state.
    };

    const handleMessageDeleted = (payload: any) => {
      const conversationId = normalizeId(payload?.conversationId);
      const messageId = normalizeId(payload?.messageId ?? payload?.id);

      if (!conversationId || !messageId) return;

      updateMessageState(conversationId, (state) => ({
        ...state,
        messages: removeMessageFromList(state.messages, messageId),
      }));
    };

    socket.on("conversation:update", handleConversationUpdate);
    socket.on("conversation:deleted", handleConversationDeleted);
    socket.on("conversation:delete", handleConversationDeleted);
    socket.on("conversation:read", handleConversationRead);
    socket.on("presence:update", updatePresence);
    socket.on("message:new", handleNewMessage);
    socket.on("message:deleted", handleMessageDeleted);

    void loadConversations({ background: true }).catch(() => {});

    return () => {
      socket.off("conversation:update", handleConversationUpdate);
      socket.off("conversation:deleted", handleConversationDeleted);
      socket.off("conversation:delete", handleConversationDeleted);
      socket.off("conversation:read", handleConversationRead);
      socket.off("presence:update", updatePresence);
      socket.off("message:new", handleNewMessage);
      socket.off("message:deleted", handleMessageDeleted);
    };
  }, [
    applyConversationReadReceipt,
    enabled,
    loadConversations,
    removeConversation,
    token,
    updateMessageState,
    updatePresence,
    upsertConversation,
    updateConversationPreviewFromMessage,
    userId,
  ]);

  useEffect(() => {
    if (!enabled || !token) return;

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        socketRef.current = getMessagesSocket(token);
        void loadConversations({ background: true }).catch(() => {});
        return;
      }

      socketRef.current?.disconnect();
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, loadConversations, token]);

  const value = useMemo<MessagesContextValue>(
    () => ({
      getConversationList,
      loadConversations,
      loadMoreConversations,
      togglePinConversation,
      deleteConversation,
      createOrGetConversation,
      upsertConversation,
      getConversationById,
      getMessageState,
      loadConversationMessages,
      loadOlderMessages,
      sendDirectMessage,
      markRead,
    }),
    [
      createOrGetConversation,
      deleteConversation,
      getConversationById,
      getConversationList,
      getMessageState,
      loadConversationMessages,
      loadConversations,
      loadMoreConversations,
      loadOlderMessages,
      markRead,
      sendDirectMessage,
      togglePinConversation,
      upsertConversation,
    ],
  );

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessagesContext() {
  const context = useContext(MessagesContext);

  if (!context) {
    throw new Error("useMessagesContext must be used within MessagesProvider");
  }

  return context;
}
