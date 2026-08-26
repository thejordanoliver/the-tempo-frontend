import { useMessagesContext } from "contexts/MessagesContext";
import { useCallback, useEffect, useMemo } from "react";
import type { MessageItem } from "types/messages";

export const useConversations = (search: string) => {
  const {
    getConversationList,
    loadConversations,
    loadMoreConversations,
    togglePinConversation,
    deleteConversation,
    createOrGetConversation,
  } = useMessagesContext();

  const normalizedSearch = useMemo(() => search.trim(), [search]);
  const state = getConversationList(normalizedSearch);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        void loadConversations({
          search: normalizedSearch,
        }).catch(() => {});
      },
      normalizedSearch ? 250 : 0,
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [loadConversations, normalizedSearch]);

  const refresh = useCallback(async () => {
    await loadConversations({
      search: normalizedSearch,
      refresh: true,
    }).catch(() => {});
  }, [loadConversations, normalizedSearch]);

  const loadMore = useCallback(async () => {
    await loadMoreConversations(normalizedSearch);
  }, [loadMoreConversations, normalizedSearch]);

  const togglePin = useCallback(
    (item: MessageItem) => togglePinConversation(item),
    [togglePinConversation],
  );

  const remove = useCallback(
    (item: MessageItem) => deleteConversation(item),
    [deleteConversation],
  );

  return {
    conversations: state.items,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    hasLoadedSuccessfully: state.loaded,
    refresh,
    loadMore,
    hasMore: state.hasMore,
    togglePinConversation: togglePin,
    deleteConversation: remove,
    createConversation: createOrGetConversation,
  };
};
