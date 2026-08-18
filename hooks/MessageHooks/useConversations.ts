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
import type { MessageItem } from "types/messages";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ----------------------------- Helpers ----------------------------- */

const normalizeId = (value: unknown) => String(value ?? "").trim();

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.error ??
  error?.response?.data?.message ??
  error?.message ??
  fallback;

const sortConversations = (items: MessageItem[]) =>
  [...items].sort((a, b) => {
    const pinnedDelta =
      Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));

    if (pinnedDelta !== 0) {
      return pinnedDelta;
    }

    const aTime = new Date(
      a.lastMessageAt ?? a.updatedAt ?? 0,
    ).getTime();

    const bTime = new Date(
      b.lastMessageAt ?? b.updatedAt ?? 0,
    ).getTime();

    return bTime - aTime;
  });

const upsertConversation = (
  list: MessageItem[],
  next: MessageItem,
) => {
  const nextId = normalizeId(next.id);

  if (!nextId) {
    return list;
  }

  const exists = list.some(
    (item) => normalizeId(item.id) === nextId,
  );

  if (!exists) {
    return sortConversations([next, ...list]);
  }

  return sortConversations(
    list.map((item) =>
      normalizeId(item.id) === nextId
        ? {
            ...item,
            ...next,
            isPinned: next.isPinned ?? item.isPinned,
          }
        : item,
    ),
  );
};

const mergeConversations = (
  current: MessageItem[],
  incoming: MessageItem[],
) => {
  return incoming.reduce(
    (result, conversation) =>
      upsertConversation(result, conversation),
    current,
  );
};

const getPresenceUserId = (payload: any) =>
  payload?.userId ??
  payload?.id ??
  payload?.user?.id;

const getPresenceOnline = (payload: any) =>
  Boolean(
    payload?.isOnline ??
      payload?.online ??
      payload?.user?.isOnline,
  );

/* ----------------------------- Hook ----------------------------- */

export const useConversations = (search: string) => {
  const { token } = useAuth();

  /* ----------------------------- Refs ----------------------------- */

  const cacheRef = useRef<MessageItem[]>([]);
  const cursorRef = useRef<string | null>(null);
  const searchRef = useRef("");
  const requestIdRef = useRef(0);
  const isLoadingMoreRef = useRef(false);

  /* ----------------------------- State ----------------------------- */

  const [conversations, setConversations] = useState<MessageItem[]>(
    cacheRef.current,
  );

  const [isLoading, setIsLoading] = useState(
    cacheRef.current.length === 0,
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const normalizedSearch = useMemo(
    () => search.trim(),
    [search],
  );

  /* ----------------------------- State Helpers ----------------------------- */

  const commitConversations = useCallback(
    (next: MessageItem[]) => {
      const sorted = sortConversations(next);

      cacheRef.current = sorted;
      setConversations(sorted);
    },
    [],
  );

  /* ----------------------------- Load Conversations ----------------------------- */

  const loadConversations = useCallback(
    async ({
      query,
      cursor = null,
      refreshing = false,
      loadingMore = false,
      background = false,
    }: {
      query: string;
      cursor?: string | null;
      refreshing?: boolean;
      loadingMore?: boolean;
      background?: boolean;
    }) => {
      const requestId = ++requestIdRef.current;

      if (refreshing) {
        setIsRefreshing(true);
      } else if (loadingMore) {
        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);
      } else if (!background && cacheRef.current.length === 0) {
        setIsLoading(true);
      }

      /*
       * Clear the full-page error only for initial loads and explicit
       * refreshes. Action errors are handled by their caller.
       */
      if (!loadingMore) {
        setError(null);
      }

      try {
        const response = await getConversations(
          query,
          cursor ?? undefined,
        );

        /*
         * Ignore results from requests that were superseded by a newer
         * search or refresh.
         */
        if (requestId !== requestIdRef.current) {
          return;
        }

        const incoming = response.items.map(normalizeConversation);
        const nextCursor = response.nextCursor ?? null;

        if (loadingMore && cursor) {
          commitConversations(
            mergeConversations(cacheRef.current, incoming),
          );
        } else {
          commitConversations(incoming);
        }

        cursorRef.current = nextCursor;
        setHasMore(Boolean(nextCursor));
      } catch (err: any) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        /*
         * Only replace the list with an error screen when no cached
         * conversations are available.
         */
        if (cacheRef.current.length === 0) {
          setError(
            getErrorMessage(
              err,
              "Messages failed to load.",
            ),
          );
        }

        throw err;
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
          setIsLoadingMore(false);
          isLoadingMoreRef.current = false;
        }
      }
    },
    [commitConversations],
  );

  /* ----------------------------- Initial Load and Search ----------------------------- */

  useEffect(() => {
    const query = normalizedSearch;
    searchRef.current = query;

    const timeout = setTimeout(
      () => {
        cursorRef.current = null;
        setHasMore(true);

        void loadConversations({
          query,
          cursor: null,
        }).catch(() => {
          // The hook's list-level error state handles initial failures.
        });
      },
      query ? 250 : 0,
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [loadConversations, normalizedSearch]);

  /* ----------------------------- Refresh ----------------------------- */

  const refresh = useCallback(async () => {
    cursorRef.current = null;
    setHasMore(true);

    try {
      await loadConversations({
        query: searchRef.current,
        cursor: null,
        refreshing: true,
      });
    } catch {
      /*
       * Preserve the existing list when a refresh fails.
       * The UI can continue displaying cached conversations.
       */
    }
  }, [loadConversations]);

  /* ----------------------------- Pagination ----------------------------- */

  const loadMore = useCallback(async () => {
    const nextCursor = cursorRef.current;

    if (
      !nextCursor ||
      !hasMore ||
      isLoading ||
      isRefreshing ||
      isLoadingMoreRef.current
    ) {
      return;
    }

    try {
      await loadConversations({
        query: searchRef.current,
        cursor: nextCursor,
        loadingMore: true,
        background: true,
      });
    } catch {
      // Preserve the current list when pagination fails.
    }
  }, [
    hasMore,
    isLoading,
    isRefreshing,
    loadConversations,
  ]);

  /* ----------------------------- Pin Conversation ----------------------------- */

  const togglePinConversation = useCallback(
    async (item: MessageItem) => {
      const itemId = normalizeId(item.id);

      if (!itemId) {
        throw new Error("Conversation ID is missing.");
      }

      const nextPinned = !item.isPinned;
      const previous = cacheRef.current;

      const optimistic = sortConversations(
        previous.map((conversation) =>
          normalizeId(conversation.id) === itemId
            ? {
                ...conversation,
                isPinned: nextPinned,
              }
            : conversation,
        ),
      );

      commitConversations(optimistic);

      try {
        const updated = await pinConversation(
          itemId,
          nextPinned,
        );

        if (updated) {
          const normalized = normalizeConversation(updated);

          commitConversations(
            upsertConversation(
              cacheRef.current,
              normalized,
            ),
          );
        }

        /*
         * Socket emission should not determine whether the HTTP action
         * is considered successful.
         */
        try {
          emitConversationPin(itemId, nextPinned);
        } catch {
          // The server request succeeded; socket reconnection can recover.
        }
      } catch (err) {
        commitConversations(previous);
        throw new Error(
          getErrorMessage(
            err,
            "Could not update pinned conversation.",
          ),
        );
      }
    },
    [commitConversations],
  );

  /* ----------------------------- Delete Conversation ----------------------------- */

  const deleteConversation = useCallback(
    async (item: MessageItem) => {
      const itemId = normalizeId(item.id);

      if (!itemId) {
        throw new Error("Conversation ID is missing.");
      }

      const previous = cacheRef.current;

      /*
       * Remove the conversation immediately. The FlatList now receives
       * a new array and MessageListItem can run its exiting animation.
       */
      const optimistic = previous.filter(
        (conversation) =>
          normalizeId(conversation.id) !== itemId,
      );

      commitConversations(optimistic);

      try {
        await deleteConversationRequest(itemId);

        /*
         * Emit only after the server confirms deletion. A socket problem
         * should not restore a conversation already deleted by the API.
         */
        try {
          emitConversationDelete(itemId);
        } catch {
          // The HTTP deletion succeeded, so keep the item removed.
        }
      } catch (err: any) {
        /*
         * A 404 means the conversation is already gone, which is the
         * desired final state.
         */
        if (err?.response?.status === 404) {
          return;
        }

        commitConversations(previous);

        throw new Error(
          getErrorMessage(
            err,
            "Could not delete conversation.",
          ),
        );
      }
    },
    [commitConversations],
  );

  /* ----------------------------- Socket Updates ----------------------------- */

  useEffect(() => {
    const socket = getMessagesSocket(token);

    if (!socket) {
      return;
    }

    const updateConversation = (payload: any) => {
      const raw = payload?.conversation ?? payload;
      const normalized = normalizeConversation(raw);

      if (!normalizeId(normalized.id)) {
        return;
      }

      commitConversations(
        upsertConversation(
          cacheRef.current,
          normalized,
        ),
      );
    };

    const markRead = (payload: any) => {
      const conversationId = normalizeId(
        payload?.conversationId ??
          payload?.conversation?.id ??
          payload?.id,
      );

      if (!conversationId) {
        return;
      }

      commitConversations(
        cacheRef.current.map((conversation) =>
          normalizeId(conversation.id) === conversationId
            ? {
                ...conversation,
                unreadCount: 0,
              }
            : conversation,
        ),
      );
    };

    const removeConversation = (payload: any) => {
      const conversationId = normalizeId(
        payload?.conversationId ??
          payload?.conversation?.id ??
          payload?.id,
      );

      if (!conversationId) {
        return;
      }

      commitConversations(
        cacheRef.current.filter(
          (conversation) =>
            normalizeId(conversation.id) !== conversationId,
        ),
      );
    };

    const updatePin = (payload: any) => {
      const conversationId = normalizeId(
        payload?.conversationId ??
          payload?.conversation?.id ??
          payload?.id,
      );

      if (!conversationId) {
        return;
      }

      const isPinned = Boolean(
        payload?.isPinned ?? payload?.pinned,
      );

      commitConversations(
        cacheRef.current.map((conversation) =>
          normalizeId(conversation.id) === conversationId
            ? {
                ...conversation,
                isPinned,
              }
            : conversation,
        ),
      );
    };

    const updatePresence = (payload: any) => {
      const userId = normalizeId(
        getPresenceUserId(payload),
      );

      if (!userId) {
        return;
      }

      const isOnline = getPresenceOnline(payload);

      commitConversations(
        cacheRef.current.map((conversation) =>
          normalizeId(conversation.userId) === userId
            ? {
                ...conversation,
                isOnline,
              }
            : conversation,
        ),
      );
    };

    const newMessage = (payload: any) => {
      const conversationId = normalizeId(
        payload?.conversationId ??
          payload?.conversation?.id,
      );

      if (!conversationId) {
        return;
      }

      commitConversations(
        cacheRef.current.map((conversation) =>
          normalizeId(conversation.id) === conversationId
            ? {
                ...conversation,
                lastMessage:
                  payload?.text ??
                  payload?.message?.text ??
                  conversation.lastMessage,
                timestamp:
                  payload?.timestampLabel ??
                  conversation.timestamp,
                lastMessageAt:
                  payload?.createdAt ??
                  payload?.timestamp ??
                  conversation.lastMessageAt,
                unreadCount: payload?.isCurrentUser
                  ? conversation.unreadCount
                  : (conversation.unreadCount ?? 0) + 1,
              }
            : conversation,
        ),
      );
    };

    socket.on("conversation:update", updateConversation);
    socket.on("conversation:read", markRead);
    socket.on("conversation:deleted", removeConversation);
    socket.on("conversation:delete", removeConversation);
    socket.on("conversation:pin", updatePin);
    socket.on("presence:update", updatePresence);
    socket.on("message:new", newMessage);

    return () => {
      socket.off("conversation:update", updateConversation);
      socket.off("conversation:read", markRead);
      socket.off("conversation:deleted", removeConversation);
      socket.off("conversation:delete", removeConversation);
      socket.off("conversation:pin", updatePin);
      socket.off("presence:update", updatePresence);
      socket.off("message:new", newMessage);
    };
  }, [commitConversations, token]);

  /* ----------------------------- Return API ----------------------------- */

  return {
    conversations,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    refresh,
    loadMore,
    hasMore,
    togglePinConversation,
    deleteConversation,
  };
};