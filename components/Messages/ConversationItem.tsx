import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { MessageItem } from "types/messages";

type Props = {
  item: MessageItem;
  onSelect: (item: MessageItem) => void;
  onDelete?: (item: MessageItem) => void;
  onTogglePin?: (item: MessageItem) => void;
  onSwipeableOpen?: (id: string, close: () => void) => void;
  query?: string;
};

const FALLBACK_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder_nmzv2o.png";

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

  const swipeableRef = useRef<Swipeable | null>(null);

  const profileImageUrl = item.profileImageUrl?.trim() || FALLBACK_AVATAR;
  const canDelete = Boolean(onDelete) && query.length === 0;
  const canPin = Boolean(onTogglePin);

  const displayUsername = item.username || "Tempo User";
  const displayName = item.fullName || item.full_name || "Sports fan";
  const lastMessage = item.lastMessage || "Start a conversation";
  const timestamp = item.timestamp || "";

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
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.actionContainer, styles.pinAction]}
        onPress={handleTogglePin}
      >
        <Ionicons
          name={item.isPinned ? "pin" : "pin-outline"}
          size={22}
          color={Colors.white}
        />

        <Text style={styles.actionText}>{item.isPinned ? "Unpin" : "Pin"}</Text>
      </TouchableOpacity>
    );
  }, [
    canPin,
    handleTogglePin,
    item.isPinned,
    styles.actionContainer,
    styles.actionText,
    styles.pinAction,
  ]);

  const renderRightActions = useCallback(() => {
    if (!canDelete) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.actionContainer, styles.deleteAction]}
        onPress={handleDelete}
      >
        <Ionicons name="trash-outline" size={22} color={Colors.white} />

        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    );
  }, [
    canDelete,
    handleDelete,
    styles.actionContainer,
    styles.actionText,
    styles.deleteAction,
  ]);

  return (
    <View style={styles.swipeContainer}>
      <Swipeable
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
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.rowContainer}
          onPress={handleSelect}
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
                  color="#3B82F6"
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
        </TouchableOpacity>
      </Swipeable>
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
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    inlineIcon: {
      marginLeft: 5,
    },

    fullName: {
      marginTop: 2,
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    lastMessage: {
      marginTop: 3,
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
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
      fontFamily: Fonts.OSREGULAR,
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
      fontFamily: Fonts.OSBOLD,
      color: Colors.white,
    },

    actionContainer: {
      width: 92,
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
      fontFamily: Fonts.OSBOLD,
      color: Colors.white,
    },
  });
