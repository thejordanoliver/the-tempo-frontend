import { MessageListItemStyles } from "@/styles/MessageStyles/MessageListItemStyles";
import { Ionicons } from "@expo/vector-icons";
import { Colors, PLACEHOLDER_AVATAR } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo, useRef } from "react";
import { Image, Pressable, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { MessageItem } from "types/messages";

type Props = {
  item: MessageItem;
  onSelect: (item: MessageItem) => void;
  onDelete?: (item: MessageItem) => void;
  onTogglePin?: (item: MessageItem) => void;
  onSwipeableOpen?: (id: string, close: () => void) => void;
  query?: string;
};

type MessageItemWithDates = MessageItem & {
  lastMessageAt?: string | number | Date | null;
  updatedAt?: string | number | Date | null;
  createdAt?: string | number | Date | null;
  timestamp?: string | number | Date | null;
};

function formatConversationTimestamp(item: MessageItem): string {
  const dateValue =
    (item as MessageItemWithDates).lastMessageAt ??
    (item as MessageItemWithDates).updatedAt ??
    (item as MessageItemWithDates).createdAt ??
    (item as MessageItemWithDates).timestamp;

  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return "Yesterday";
  }

  const sameYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export default function MessageListItem({
  item,
  onSelect,
  onDelete,
  onTogglePin,
  onSwipeableOpen,
  query = "",
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => MessageListItemStyles(isDark), [isDark]);

  const swipeableRef = useRef<SwipeableMethods | null>(null);

  const profileImageUrl = item.profileImageUrl?.trim() || PLACEHOLDER_AVATAR;
  const canDelete = Boolean(onDelete) && query.trim().length === 0;
  const canPin = Boolean(onTogglePin);

  const displayUsername = item.username;
  const lastMessage = item.lastMessage || "Start a conversation";
  const timestamp = formatConversationTimestamp(item);

  const closeSwipeable = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const handleSelect = useCallback(() => {
    closeSwipeable();
    onSelect(item);
  }, [closeSwipeable, item, onSelect]);

  const handleDelete = useCallback(() => {
    closeSwipeable();
    onDelete?.(item);
  }, [closeSwipeable, item, onDelete]);

  const handleTogglePin = useCallback(() => {
    closeSwipeable();
    onTogglePin?.(item);
  }, [closeSwipeable, item, onTogglePin]);

  const handleSwipeableOpen = useCallback(() => {
    onSwipeableOpen?.(item.id, closeSwipeable);
  }, [closeSwipeable, item.id, onSwipeableOpen]);

  const renderLeftActions = useCallback(() => {
    if (!canPin) return null;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.actionContainer,
          styles.pinAction,
          pressed && styles.pressed,
        ]}
        onPress={handleTogglePin}
        accessibilityRole="button"
        accessibilityLabel={
          item.isPinned ? "Unpin conversation" : "Pin conversation"
        }
      >
        <Ionicons
          name={item.isPinned ? "pin" : "pin-outline"}
          size={22}
          color={Colors.white}
        />

        <Text style={styles.actionText}>{item.isPinned ? "Unpin" : "Pin"}</Text>
      </Pressable>
    );
  }, [
    canPin,
    handleTogglePin,
    item.isPinned,
    styles.actionContainer,
    styles.actionText,
    styles.pinAction,
    styles.pressed,
  ]);

  const renderRightActions = useCallback(() => {
    if (!canDelete) return null;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.actionContainer,
          styles.deleteAction,
          pressed && styles.pressed,
        ]}
        onPress={handleDelete}
        accessibilityRole="button"
        accessibilityLabel="Delete conversation"
      >
        <Ionicons name="trash-outline" size={22} color={Colors.white} />
        <Text style={styles.actionText}>Delete</Text>
      </Pressable>
    );
  }, [
    canDelete,
    handleDelete,
    styles.actionContainer,
    styles.actionText,
    styles.deleteAction,
    styles.pressed,
  ]);

  return (
    <Animated.View
      collapsable={false}
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.duration(180)}
    >
      <View style={styles.swipeContainer}>
        <ReanimatedSwipeable
          ref={swipeableRef}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          onSwipeableOpen={handleSwipeableOpen}
          overshootLeft={false}
          overshootRight={false}
          friction={2}
          rightThreshold={42}
          leftThreshold={42}
        >
          <Pressable
            style={({ pressed }) => [
              styles.rowContainer,
              pressed && styles.pressed,
            ]}
            onPress={handleSelect}
            accessibilityRole="button"
            accessibilityLabel={`Open conversation with ${displayUsername}`}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />

              {item.isOnline && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.middleContent}>
              <View style={styles.nameRow}>
                <Text style={styles.username} numberOfLines={1}>
                  {displayUsername}
                </Text>

                {item.isVerified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color={isDark ? Colors.dark.blue : Colors.light.blue}
                    style={styles.inlineIcon}
                  />
                )}

                {item.isPinned && (
                  <Ionicons
                    name="pin"
                    size={14}
                    color="#F59E0B"
                    style={styles.inlineIcon}
                  />
                )}
              </View>

              <Text style={styles.lastMessage} numberOfLines={1}>
                {lastMessage}
              </Text>
            </View>

            <View style={styles.metaContent}>
              {!!timestamp && (
                <Text style={styles.timestamp} numberOfLines={1}>
                  {timestamp}
                </Text>
              )}

              {!!item.unreadCount && item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {item.unreadCount > 99 ? "99+" : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </ReanimatedSwipeable>
      </View>
    </Animated.View>
  );
}
