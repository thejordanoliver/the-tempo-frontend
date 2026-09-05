import { CustomHeader } from "@/components/CustomHeader";
import { Colors } from "@/constants/styles";
import {
  type NotificationCenterItem,
  type NotificationCenterType,
  useNotifications,
} from "@/contexts/NotificationContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { NotificationsCenterStyles } from "@/styles/NotificationCenterStyles";
import { getNotificationCenterHref } from "@/utils/notificationCenter";
import { Ionicons } from "@expo/vector-icons";
import { Href, useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const getNotificationIcon = (
  type: NotificationCenterType,
): React.ComponentProps<typeof Ionicons>["name"] => {
  switch (type) {
    case "game":
      return "alert";

    case "likes":
      return "heart-outline";

    case "comments":
      return "chatbubble-ellipses-outline";

    case "messages":
      return "chatbubbles-outline";

    case "badges":
      return "ribbon-outline";

    case "followers":
      return "people-outline";

    default:
      return "notifications-outline";
  }
};

type NotificationRowProps = {
  notification: NotificationCenterItem;
  isDark: boolean;
  onPress: (notification: NotificationCenterItem) => void;
};

function NotificationRow({
  notification,
  isDark,
  onPress,
}: NotificationRowProps) {
  const styles = NotificationsCenterStyles(isDark);

  const { title, text, type, readAt } = notification;

  if (!title && !text) {
    return null;
  }

  const iconName = getNotificationIcon(type);
  const href = getNotificationCenterHref(notification);
  const isPressable = href !== null;
  const isUnread = !readAt;

  return (
    <Pressable
      disabled={!isPressable}
      onPress={() => onPress(notification)}
      accessibilityRole={isPressable ? "button" : undefined}
      accessibilityLabel={`${title}. ${text}`}
      accessibilityHint={
        isPressable ? "Opens the related notification." : undefined
      }
      style={({ pressed }) => [
        styles.notificationRow,
        isUnread && styles.notificationRowUnread,
        pressed && isPressable && styles.notificationRowPressed,
      ]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name={iconName}
          size={20}
          color={isDark ? Colors.white : Colors.black}
        />

        {isUnread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.notificationHeader} numberOfLines={1}>
          {title}
        </Text>

        <Text style={styles.notificationText} numberOfLines={3}>
          {text}
        </Text>
      </View>

      {isPressable && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDark ? Colors.lightGray : Colors.darkGray}
          style={styles.chevron}
        />
      )}
    </Pressable>
  );
}

export default function NotificationsCenter() {
  const { resolvedColorScheme } = usePreferences();

  const {
    centerNotifications,
    markCenterNotificationRead,
    markAllCenterNotificationsRead,
  } = useNotifications();

  const isDark = resolvedColorScheme === "dark";

  const styles = NotificationsCenterStyles(isDark);

  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader tabName="Notifications" onBack={() => router.back()} />
      ),
    });
  }, [navigation, router]);

  const handleNotificationPress = useCallback(
    (notification: NotificationCenterItem) => {
      if (!notification.readAt) {
        markCenterNotificationRead(notification.id);
      }

      const href = getNotificationCenterHref(notification);

      if (!href) {
        return;
      }

      router.push(href as Href);
    },
    [markCenterNotificationRead, router],
  );

  const handleMarkAllRead = useCallback(() => {
    markAllCenterNotificationsRead();
  }, [markAllCenterNotificationsRead]);

  const hasUnreadNotifications = centerNotifications.some(
    (notification) => !notification.readAt,
  );

  return (
    <FlatList
      data={centerNotifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationRow
          notification={item}
          isDark={isDark}
          onPress={handleNotificationPress}
        />
      )}
      ListHeaderComponent={
        hasUnreadNotifications ? (
          <View style={styles.listHeader}>
            <Pressable
              onPress={handleMarkAllRead}
              accessibilityRole="button"
              accessibilityLabel="Mark all notifications as read"
              hitSlop={8}
              style={({ pressed }) => [
                styles.markAllButton,
                pressed && styles.markAllButtonPressed,
              ]}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </Pressable>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons
            name="notifications-outline"
            size={34}
            color={isDark ? Colors.lightGray : Colors.darkGray}
          />

          <Text style={styles.emptyTitle}>No notifications yet</Text>

          <Text style={styles.emptyText}>
            New messages, likes, comments, and other activity will appear here.
          </Text>
        </View>
      }
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.container,
        centerNotifications.length === 0 && styles.emptyContainer,
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}
