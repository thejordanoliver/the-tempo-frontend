import { Ionicons } from "@expo/vector-icons";
import MessageListItem from "components/Messages/MessageListItem";
import PinnedConversations from "components/Messages/PinnedConversations";
import SearchBar from "components/SearchBars/SearchBar";
import {
  Colors,
  Fonts,
  activeOpacity,
  globalStyles,
} from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo } from "react";
import {
  FlatList,
  type ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { MessageItem } from "types/messages";
import CustomActivityIndicator from "../CustomActivityIndicator";

type Props = {
  conversations: MessageItem[];
  pinnedConversations: MessageItem[];
  search: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
  error?: string | null;
  shouldShowPinned: boolean;
  shouldShowEmptyState: boolean;
  onSearchChange: (value: string) => void;
  onSelectConversation: (item: MessageItem) => void;
  onDeleteConversation: (item: MessageItem) => void;
  onTogglePinConversation: (item: MessageItem) => void;
  onSwipeableOpen: (id: string, close: () => void) => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  onRetry: () => void;
};

export default function MessageList({
  conversations,
  pinnedConversations,
  search,
  isLoading = false,
  isRefreshing = false,
  isLoadingMore = false,
  error = null,
  shouldShowPinned,
  shouldShowEmptyState,
  onSearchChange,
  onSelectConversation,
  onDeleteConversation,
  onTogglePinConversation,
  onSwipeableOpen,
  onRefresh,
  onLoadMore,
  hasMore,
  onRetry,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const styles = useMemo(() => messageListStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const keyExtractor = useCallback(
    (item: MessageItem) => String(item.id),
    [],
  );

  const renderItem = useCallback<ListRenderItem<MessageItem>>(
    ({ item }) => (
      <MessageListItem
        item={item}
        query={search}
        onSelect={onSelectConversation}
        onDelete={onDeleteConversation}
        onTogglePin={onTogglePinConversation}
        onSwipeableOpen={onSwipeableOpen}
      />
    ),
    [
      search,
      onSelectConversation,
      onDeleteConversation,
      onTogglePinConversation,
      onSwipeableOpen,
    ],
  );

  const renderHeader = useCallback(() => {
    if (!shouldShowPinned) {
      return null;
    }

    return (
      <PinnedConversations
        conversations={pinnedConversations}
        onSelect={onSelectConversation}
        onRemovePinned={onTogglePinConversation}
      />
    );
  }, [
    shouldShowPinned,
    pinnedConversations,
    onSelectConversation,
    onTogglePinConversation,
  ]);

  const renderEmptyState = useCallback(() => {
    if (!shouldShowEmptyState) {
      return null;
    }

    const hasSearch = search.trim().length > 0;

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name={hasSearch ? "search-outline" : "chatbubble-outline"}
            size={30}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>

        <Text style={styles.emptyTitle}>
          {hasSearch ? "No conversations found" : "No messages yet"}
        </Text>

        <Text style={styles.emptyText}>
          {hasSearch
            ? "Try searching for another username or conversation."
            : "Start a new conversation using the button above."}
        </Text>
      </View>
    );
  }, [
    isDark,
    search,
    shouldShowEmptyState,
    styles.emptyIconContainer,
    styles.emptyState,
    styles.emptyText,
    styles.emptyTitle,
  ]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <CustomActivityIndicator />
      </View>
    );
  }, [isLoadingMore, styles.footerLoader]);

  if (isLoading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>

        <Text style={global.errorText}>Messages unavailable</Text>

        <TouchableOpacity
          activeOpacity={activeOpacity}
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search"
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      <FlatList
        data={conversations}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        onEndReached={hasMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.45}
        contentContainerStyle={[
          styles.contentContainer,
          shouldShowEmptyState && styles.emptyContentContainer,
        ]}
      />
    </View>
  );
}

const messageListStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    contentContainer: {
      flexGrow: 1,
      paddingHorizontal: 12,
      paddingBottom: 100,
    },

    searchContainer: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
    },

    emptyContentContainer: {
      flexGrow: 1,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingBottom: 80,
    },

    footerLoader: {
      paddingVertical: 18,
    },

    emptyIconContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 64,
      height: 64,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 32,
    },

    emptyTitle: {
      marginBottom: 6,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },

    emptyText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    retryButton: {
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 18,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryButtonText: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.black : Colors.white,
    },
  });
