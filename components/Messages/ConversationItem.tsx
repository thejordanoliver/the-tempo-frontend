import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, PLACEHOLDER_AVATAR } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { useCallback, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
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

export default function ConversationItem({
  item,
  onSelect,
  onDelete,
  onTogglePin,
  onSwipeableOpen,
  query = "",
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => conversationItemStyles(isDark), [isDark]);

  const swipeableRef = useRef<SwipeableMethods | null>(null);

  const profileImageUrl = item.profileImageUrl?.trim() || PLACEHOLDER_AVATAR;
  const canDelete = Boolean(onDelete) && query.trim().length === 0;
  const canPin = Boolean(onTogglePin);

  const displayUsername = item.username || "Tempo User";
  const displayName = item.fullName || item.full_name || "Sports fan";
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
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: profileImageUrl }}
              style={styles.avatar}
              contentFit="cover"
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

            <Text style={styles.fullName} numberOfLines={1}>
              {displayName}
            </Text>

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
  );
}

const conversationItemStyles = (isDark: boolean) =>
  StyleSheet.create({
    swipeContainer: {
      borderRadius: 18,
      marginBottom: 10,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
    },

    rowContainer: {
      minHeight: 82,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    avatarWrapper: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },

    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    onlineDot: {
      position: "absolute",
      right: 1,
      bottom: 1,
      width: 13,
      height: 13,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: isDark ? Colors.black : Colors.white,
      backgroundColor: Colors.dark.leafGreen,
    },

    middleContent: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },

    username: {
      maxWidth: "82%",
      fontSize: 15,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    inlineIcon: {
      marginLeft: 5,
    },

    fullName: {
      marginTop: 2,
      fontSize: 13,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    lastMessage: {
      marginTop: 3,
      fontSize: 13,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
      opacity: 0.72,
    },

    metaContent: {
      alignItems: "flex-end",
      justifyContent: "center",
      marginLeft: 10,
      minWidth: 48,
    },

    timestamp: {
      fontSize: 11,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginBottom: 8,
    },

    unreadBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      paddingHorizontal: 7,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    unreadText: {
      fontSize: 11,
      fontFamily: Fonts.BOLD,
      color: Colors.white,
    },

    actionContainer: {
      width: 92,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    pinAction: {
      backgroundColor: isDark ? Colors.dark.orange : Colors.light.orange,
    },

    deleteAction: {
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    actionText: {
      marginTop: 4,
      fontSize: 12,
      fontFamily: Fonts.BOLD,
      color: Colors.white,
    },
    pressed: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
  });
