import { Ionicons } from "@expo/vector-icons";
import ConversationItem from "components/Messages/ConversationItem";
import PinnedConversations from "components/Messages/PinnedConversations";
import SearchBar from "components/SearchBars/SearchBar";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MessageItem } from "types/messages";

type Props = {
  conversations: MessageItem[];
  pinnedConversations: MessageItem[];
  search: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  shouldShowPinned: boolean;
  shouldShowEmptyState: boolean;
  onSearchChange: (value: string) => void;
  onSelectConversation: (item: MessageItem) => void;
  onDeleteConversation: (item: MessageItem) => void;
  onTogglePinConversation: (item: MessageItem) => void;
  onSwipeableOpen: (id: string, close: () => void) => void;
  onRefresh: () => void;
  onRetry: () => void;
};

function MessageList({
  conversations,
  pinnedConversations,
  search,
  isLoading = false,
  isRefreshing = false,
  error = null,
  shouldShowPinned,
  shouldShowEmptyState,
  onSearchChange,
  onSelectConversation,
  onDeleteConversation,
  onTogglePinConversation,
  onSwipeableOpen,
  onRefresh,
  onRetry,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => messageListStyles(isDark), [isDark]);
  const trimmedSearch = search.trim();

  const keyExtractor = useCallback((item: MessageItem) => item.id, []);

  const renderItem = useCallback<ListRenderItem<MessageItem>>(
    ({ item }) => (
      <ConversationItem
        item={item}
        query={search}
        onSelect={onSelectConversation}
        onDelete={onDeleteConversation}
        onTogglePin={onTogglePinConversation}
        onSwipeableOpen={onSwipeableOpen}
      />
    ),
    [
      onDeleteConversation,
      onSelectConversation,
      onSwipeableOpen,
      onTogglePinConversation,
      search,
    ],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        {shouldShowPinned && (
          <PinnedConversations
            conversations={pinnedConversations}
            onSelect={onSelectConversation}
            onRemovePinned={onTogglePinConversation}
          />
        )}
      </View>
    ),
    [
      onSelectConversation,
      onTogglePinConversation,
      pinnedConversations,
      shouldShowPinned,
    ],
  );

  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator
            size="small"
            color={isDark ? Colors.white : Colors.black}
          />

          <Text style={styles.emptyTitle}>Loading messages</Text>
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

          <Text style={styles.emptyTitle}>Messages unavailable</Text>

          <Text style={styles.emptyText}>{error}</Text>

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
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="chatbubbles-outline"
            size={30}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>

        <Text style={styles.emptyTitle}>
          {trimmedSearch.length > 0
            ? "No conversations found"
            : "No messages yet"}
        </Text>

        <Text style={styles.emptyText}>
          {trimmedSearch.length > 0
            ? "Try searching for another username, name, or message."
            : "Your conversations will show up here once you start chatting."}
        </Text>
      </View>
    );
  }, [
    error,
    isDark,
    isLoading,
    onRetry,
    styles.emptyIconContainer,
    styles.emptyState,
    styles.emptyText,
    styles.emptyTitle,
    styles.retryButton,
    styles.retryButtonText,
    trimmedSearch.length,
  ]);

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
        ListEmptyComponent={
          shouldShowEmptyState || isLoading || error ? renderEmptyState : null
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={[
          styles.contentContainerStyle,
          (shouldShowEmptyState || isLoading || error) &&
            styles.emptyContentContainer,
        ]}
      />
    </View>
  );
}

export default MessageList;

const messageListStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    contentContainerStyle: {
      flexGrow: 1,
      paddingHorizontal: 12,
      paddingBottom: 100,
    },

    searchContainer: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
    },

    sectionTitle: {
      marginTop: 4,
      marginBottom: 10,
      fontSize: 16,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
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

    emptyIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      borderWidth: 2,
      borderColor: isDark ? Colors.white : Colors.black,
    },

    emptyTitle: {
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
      marginBottom: 6,
    },

    emptyText: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      lineHeight: 20,
    },

    retryButton: {
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 18,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryButtonText: {
      fontSize: 13,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.black : Colors.white,
    },
  });
