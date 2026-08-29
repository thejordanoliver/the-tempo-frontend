import { CustomHeader } from "@/components/CustomHeader";
import { Colors, Fonts } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";

import { Ionicons } from "@expo/vector-icons";
import { Href, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type NotificationType =
  | "messages"
  | "likes"
  | "comments"
  | "badges"
  | "game"
  | "followers";

type GameSport =
  | "basketball"
  | "football"
  | "soccer"
  | "baseball"
  | "hockey"
  | "mma";

type NotificationItem = {
  id: number;
  title: string;
  text: string;
  type: NotificationType;

  // Game notifications
  gameId?: string | number;
  sport?: GameSport;

  // Message notifications
  conversationId?: string;

  // Like/comment notifications
  postId?: string | number;

  // Follower notifications
  userId?: string;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "Close Game",
    text: "🚨 Close Game: FLA v HOU. Tune in to catch the last few moments",
    type: "game",
    gameId: "401752715",
    sport: "football",
  },
  {
    id: 2,
    title: "New Message",
    text: "You just received a new message from @thewife",
    type: "messages",
    conversationId: "123",
  },
  {
    id: 3,
    title: "New Like",
    text: "@thewife just liked your post",
    type: "likes",
    postId: "456",
  },
  {
    id: 4,
    title: "New Comment",
    text: "@janedoe just commented on your post",
    type: "comments",
    postId: "456",
  },
  {
    id: 5,
    title: "Badge Earned",
    text: "You just earned the First Take Badge",
    type: "badges",
  },
  {
    id: 6,
    title: "New Follower",
    text: "@johndoe just followed you",
    type: "followers",
    userId: "789",
  },
];

const getNotificationIcon = (
  type: NotificationType,
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

const getNotificationHref = (notification: NotificationItem): Href | null => {
  switch (notification.type) {
    /*
     * Games
     *
     * app/game/basketball/[game].tsx
     * app/game/football/[game].tsx
     * app/game/soccer/[game].tsx
     * app/game/baseball/[game].tsx
     * app/game/hockey/[game].tsx
     * etc.
     */
    case "game": {
      if (!notification.gameId || !notification.sport) {
        return null;
      }

      return `/game/${notification.sport}/${notification.gameId}` as Href;
    }

    /*
     * Direct Messages
     *
     * Expected:
     * app/messages/[conversationId].tsx
     *
     * Falls back to app/messages if the notification doesn't
     * contain a conversation id.
     */
    case "messages": {
      if (notification.conversationId) {
        return `/messages/${notification.conversationId}` as Href;
      }

      return "/messages" as Href;
    }

    /*
     * Forum likes/comments
     *
     * app/post/[postId].tsx
     */
    case "likes":
    case "comments": {
      if (!notification.postId) {
        return null;
      }

      return `/post/${notification.postId}` as Href;
    }

    /*
     * Badge notifications
     *
     * Send the user to their own profile.
     */
    case "badges":
      return "/(tabs)/profile" as Href;

    /*
     * Followers
     *
     * If you have:
     * app/profile/[userId].tsx
     *
     * this sends the user to the person who followed them.
     */
    case "followers": {
      if (notification.userId) {
        return `/profile/${notification.userId}` as Href;
      }

      return "/(tabs)/profile" as Href;
    }

    default:
      return null;
  }
};

type NotificationRowProps = {
  notification: NotificationItem;
  isDark: boolean;
  onPress: (notification: NotificationItem) => void;
};

function NotificationRow({
  notification,
  isDark,
  onPress,
}: NotificationRowProps) {
  const styles = NotificationsCenterStyles(isDark);

  const { title, text, type } = notification;

  if (!title && !text) {
    return null;
  }

  const iconName = getNotificationIcon(type);
  const href = getNotificationHref(notification);
  const isPressable = href !== null;

  return (
    <Pressable
      disabled={!isPressable}
      onPress={() => onPress(notification)}
      accessibilityRole={isPressable ? "button" : undefined}
      accessibilityLabel={`${title}. ${text}`}
      style={({ pressed }) => [
        styles.notificationRow,
        pressed && isPressable && styles.notificationRowPressed,
      ]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name={iconName}
          size={20}
          color={isDark ? Colors.white : Colors.black}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.notificationHeader}>{title}</Text>

        <Text style={styles.notificationText}>{text}</Text>
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

  const handleNotificationPress = (notification: NotificationItem) => {
    const href = getNotificationHref(notification);

    if (!href) {
      return;
    }

    router.push(href);
  };

  return (
    <FlatList
      data={NOTIFICATIONS}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <NotificationRow
          notification={item}
          isDark={isDark}
          onPress={handleNotificationPress}
        />
      )}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

export const NotificationsCenterStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 80,
    },

    notificationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    notificationRowPressed: {
      opacity: 0.55,
    },

    iconWrapper: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
      borderRadius: 21,
    },

    textContainer: {
      flex: 1,
      gap: 4,
      paddingTop: 1,
    },

    notificationHeader: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    notificationText: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    chevron: {
      flexShrink: 0,
    },
  });
