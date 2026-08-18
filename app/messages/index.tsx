import { CustomHeader } from "@/components/CustomHeader";
import MessageList from "components/Messages/MessageList";
import NewMessageModal, {
  NewMessageModalRef,
} from "components/Messages/NewMessageModal";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation, useRouter } from "expo-router";
import { useConversations } from "hooks/MessageHooks/useConversations";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, LayoutAnimation, StyleSheet, View } from "react-native";
import { createConversation } from "services/messagesApi";
import type { UserSearchResult } from "services/usersApi";
import type { MessageItem } from "types/messages";

export default function MessageListScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const styles = useMemo(() => MessageListScreenStyles(isDark), [isDark]);

  const [search, setSearch] = useState("");
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [hasLoadedSuccessfully, setHasLoadedSuccessfully] = useState(false);

  const newMessageModalRef = useRef<NewMessageModalRef>(null);

  const openSwipeableRef = useRef<{
    id: string;
    close: () => void;
  } | null>(null);

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

  /*
   * Once the list has loaded successfully, subsequent action or refresh
   * failures should not replace the entire screen with an error state.
   */
  useEffect(() => {
    if (!isLoading && !error) {
      setHasLoadedSuccessfully(true);
    }
  }, [error, isLoading]);

  /* ----------------------------- Swipeables ----------------------------- */

  const closeOpenSwipeable = useCallback(() => {
    openSwipeableRef.current?.close();
    openSwipeableRef.current = null;
  }, []);

  const handleSwipeableOpen = useCallback((id: string, close: () => void) => {
    if (openSwipeableRef.current?.id !== id) {
      openSwipeableRef.current?.close();
    }

    openSwipeableRef.current = {
      id,
      close,
    };
  }, []);

  /* ----------------------------- Search ----------------------------- */

  const handleSearchChange = useCallback(
    (value: string) => {
      closeOpenSwipeable();
      setSearch(value);
    },
    [closeOpenSwipeable],
  );

  /* ----------------------------- Conversation Actions ----------------------------- */

  const handleSelectConversation = useCallback(
    (item: MessageItem) => {
      closeOpenSwipeable();

      router.push({
        pathname: "/messages/[id]",
        params: {
          id: String(item.id),
        },
      });
    },
    [closeOpenSwipeable, router],
  );

  const handleDeleteConversation = useCallback(
    async (item: MessageItem) => {
      closeOpenSwipeable();

      LayoutAnimation.configureNext({
        duration: 180,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });

      try {
        await deleteConversation(item);
      } catch (err: any) {
        Alert.alert(
          "Could not delete conversation",
          err?.response?.data?.error ??
            err?.message ??
            "Please try again in a moment.",
        );
      }
    },
    [closeOpenSwipeable, deleteConversation],
  );

  const handleTogglePinConversation = useCallback(
    async (item: MessageItem) => {
      closeOpenSwipeable();

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      try {
        await togglePinConversation(item);
      } catch (err: any) {
        Alert.alert(
          "Could not update conversation",
          err?.response?.data?.error ??
            err?.message ??
            "Please try again in a moment.",
        );
      }
    },
    [closeOpenSwipeable, togglePinConversation],
  );

  /* ----------------------------- New Message ----------------------------- */

  const handleCreateMessage = useCallback(() => {
    closeOpenSwipeable();
    newMessageModalRef.current?.present();
  }, [closeOpenSwipeable]);

  const handleSelectRecipient = useCallback(
    async (user: UserSearchResult) => {
      if (isCreatingConversation) {
        return;
      }

      setIsCreatingConversation(true);

      try {
        const result = await createConversation(user.id);

        const conversationId =
          result.conversationId ?? result.conversation?.id ?? result.id;

        if (!conversationId) {
          throw new Error("Conversation could not be opened.");
        }

        setSearch("");
        newMessageModalRef.current?.close();

        await refresh();

        router.push({
          pathname: "/messages/[id]",
          params: {
            id: String(conversationId),
          },
        });
      } catch (err: any) {
        Alert.alert(
          "Could not start message",
          err?.response?.data?.error ??
            err?.message ??
            "Try again in a moment.",
        );
      } finally {
        setIsCreatingConversation(false);
      }
    },
    [isCreatingConversation, refresh, router],
  );

  /* ----------------------------- Derived Lists ----------------------------- */

  const pinnedConversations = useMemo(() => {
    if (trimmedSearch.length > 0) {
      return [];
    }

    return conversations.filter((conversation) => conversation.isPinned);
  }, [conversations, trimmedSearch.length]);

  const visibleConversations = useMemo(() => {
    if (trimmedSearch.length > 0) {
      return conversations;
    }

    return conversations.filter((conversation) => !conversation.isPinned);
  }, [conversations, trimmedSearch.length]);

  const shouldShowPinned = pinnedConversations.length > 0;

  const shouldShowEmptyState =
    visibleConversations.length === 0 &&
    (trimmedSearch.length > 0 || pinnedConversations.length === 0);

  /*
   * Only show the full-page error if the initial list request failed.
   * Delete, pin, and refresh failures should not hide existing content.
   */
  const visibleError = hasLoadedSuccessfully ? null : error;

  /* ----------------------------- Header ----------------------------- */

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title="Messages"
          tabName="Messages"
          onBack={() => router.back()}
          onCreateMessage={handleCreateMessage}
        />
      ),
    });
  }, [handleCreateMessage, navigation, router]);

  /* ----------------------------- Render ----------------------------- */

  return (
    <View style={styles.container}>
      <MessageList
        conversations={visibleConversations}
        pinnedConversations={pinnedConversations}
        search={search}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={visibleError}
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

      <NewMessageModal
        ref={newMessageModalRef}
        isCreating={isCreatingConversation}
        onClose={() => {}}
        onSelectUser={handleSelectRecipient}
      />
    </View>
  );
}

export const MessageListScreenStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
    },
  });
