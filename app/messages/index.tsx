import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import MessageList from "components/Messages/MessageList";
import NewMessageModal from "components/Messages/NewMessageModal";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useConversations } from "hooks/MessageHooks/useConversations";
import { useProfile } from "hooks/UserHooks/useProfile";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { createConversation } from "services/messagesApi";
import type { UserSearchResult } from "services/usersApi";
import { MessageItem } from "types/messages";

export default function MessageScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => messagesStyles(isDark), [isDark]);
  const [search, setSearch] = useState("");
  const [isNewMessageMounted, setIsNewMessageMounted] = useState(false);
  const [isNewMessageVisible, setIsNewMessageVisible] = useState(false);
  const [newMessageModalKey, setNewMessageModalKey] = useState(0);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const hasLoadedProfileRef = useRef(false);
  const lastLoadedUserIdRef = useRef<number | null>(null);
  const isOpeningNewMessageRef = useRef(false);
  const openSwipeableRef = useRef<{
    id: string;
    close: () => void;
  } | null>(null);

  const { currentUserId, loadProfile } = useProfile();

  const {
    conversations,
    isLoading,
    isRefreshing,
    error,
    refresh,
    togglePinConversation,
    deleteConversation,
  } = useConversations(search);

  const trimmedSearch = search.trim();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const closeOpenSwipeable = useCallback(() => {
    openSwipeableRef.current?.close();
    openSwipeableRef.current = null;
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      closeOpenSwipeable();
      setSearch(value);
    },
    [closeOpenSwipeable],
  );

  const handleSwipeableOpen = useCallback((id: string, close: () => void) => {
    if (openSwipeableRef.current?.id !== id) {
      openSwipeableRef.current?.close();
    }

    openSwipeableRef.current = { id, close };
  }, []);

  const handleSelectConversation = useCallback(
    (item: MessageItem) => {
      closeOpenSwipeable();

      router.push({
        pathname: "/messages/[id]",
        params: { id: item.id },
      });
    },
    [closeOpenSwipeable, router],
  );

  const handleDeleteConversation = useCallback(
    (item: MessageItem) => {
      closeOpenSwipeable();
      deleteConversation(item);
    },
    [closeOpenSwipeable, deleteConversation],
  );

  const handleTogglePinConversation = useCallback(
    (item: MessageItem) => {
      closeOpenSwipeable();
      togglePinConversation(item);
    },
    [closeOpenSwipeable, togglePinConversation],
  );

  const handleCreateMessage = useCallback(() => {
    if (
      isOpeningNewMessageRef.current ||
      isNewMessageVisible ||
      isCreatingConversation
    ) {
      return;
    }

    isOpeningNewMessageRef.current = true;

    closeOpenSwipeable();
    setIsNewMessageMounted(true);
    setIsNewMessageVisible(true);
  }, [closeOpenSwipeable, isCreatingConversation, isNewMessageVisible]);

  const handleCloseNewMessage = useCallback(() => {
    if (isCreatingConversation) return;
    setIsNewMessageVisible(false);
  }, [isCreatingConversation]);

  const handleDismissNewMessage = useCallback(() => {
    isOpeningNewMessageRef.current = false;
    setIsNewMessageVisible(false);
    setIsNewMessageMounted(false);
  }, []);

  const handleSelectRecipient = useCallback(
    async (user: UserSearchResult) => {
      if (isCreatingConversation) return;

      setIsCreatingConversation(true);

      try {
        const result = await createConversation(user.id);

        const conversationId =
          result.conversationId ?? result.conversation?.id ?? result.id;

        if (!conversationId) {
          throw new Error("Conversation could not be opened.");
        }

        setSearch("");
        setIsNewMessageVisible(false);
        setIsNewMessageMounted(false);

        await refresh();

        router.push({
          pathname: "/messages/[id]",
          params: { id: String(conversationId) },
        });
      } catch (err: any) {
        Alert.alert(
          "Could not start message",
          err?.response?.data?.error ?? err.message ?? "Try again in a moment.",
        );
      } finally {
        setIsCreatingConversation(false);
      }
    },
    [isCreatingConversation, refresh, router],
  );

  const pinnedConversations = useMemo(() => {
    if (trimmedSearch.length > 0) return [];

    return conversations.filter((conversation) => conversation.isPinned);
  }, [conversations, trimmedSearch.length]);

  const visibleConversations = useMemo(() => {
    if (trimmedSearch.length > 0) return conversations;

    return conversations.filter((conversation) => !conversation.isPinned);
  }, [conversations, trimmedSearch.length]);

  const shouldShowPinned = pinnedConversations.length > 0;

  const shouldShowEmptyState =
    visibleConversations.length === 0 &&
    (trimmedSearch.length > 0 || pinnedConversations.length === 0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const initialize = async () => {
        let activeUserId = currentUserId ?? null;

        if (
          !hasLoadedProfileRef.current ||
          !activeUserId ||
          activeUserId !== lastLoadedUserIdRef.current
        ) {
          const loadedUserId = await loadProfile();

          if (!isActive) return;

          activeUserId = loadedUserId ?? activeUserId;
          hasLoadedProfileRef.current = Boolean(activeUserId);
          lastLoadedUserIdRef.current = activeUserId ?? null;
        }
      };

      initialize();

      return () => {
        isActive = false;
        closeOpenSwipeable();
      };
    }, [closeOpenSwipeable, currentUserId, loadProfile]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          title="Messages"
          tabName="Messages"
          onBack={handleBack}
          onCreateMessage={handleCreateMessage}
        />
      ),
    });
  }, [navigation, handleBack, handleCreateMessage]);

  return (
    <View style={styles.container}>
      <MessageList
        conversations={visibleConversations}
        pinnedConversations={pinnedConversations}
        search={search}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        shouldShowPinned={shouldShowPinned}
        shouldShowEmptyState={shouldShowEmptyState}
        onSearchChange={handleSearchChange}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onTogglePinConversation={handleTogglePinConversation}
        onSwipeableOpen={handleSwipeableOpen}
        onRefresh={refresh}
        onRetry={refresh}
      />

      {isNewMessageMounted && (
        <NewMessageModal
          key={newMessageModalKey}
          visible={isNewMessageVisible}
          isCreating={isCreatingConversation}
          onClose={handleCloseNewMessage}
          onDismiss={handleDismissNewMessage}
          onSelectUser={handleSelectRecipient}
        />
      )}
    </View>
  );
}

export const messagesStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
    },
  });
