import { CustomHeader } from "@/components/CustomHeader";
import { Colors, Fonts } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { goBack } from "expo-router/build/global-state/routing";
import { useLayoutEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

// If game should be able to tap on notification to got to game app/game/basketball/[game].tsx / app/game/footbal/[game].tsx / app/game/soccer/[game].tsx / app/game/baseball/[game].tsx etc.
// If message should be able to tap on notification to got directly to conversation app/messages
// If likes/comments should be able to tap on notification to got directly to forum post app/post/[postId].tsx
// If badges should be able to tap on notification to got directly to profile.tsx

type NotificationType =
  | "messages"
  | "likes"
  | "comments"
  | "badges"
  | "game"
  | "followers";

type NotificationItemProps = {
  id: number;
  title: string;
  text: string;
  type: NotificationType;
};
const NOTIFICATIONS: NotificationItemProps[] = [
  {
    id: 1,
    title: "Close Game",
    text: "🚨 Close Game: FLA v HOU. Tune in to catch the last few moments",
    type: "game",
  },
  {
    id: 2,
    title: "New Message",
    text: "You just recieved a new message from @thewife",
    type: "messages",
  },
  {
    id: 3,
    title: "New Like",
    text: "@thewife just liked your post",
    type: "likes",
  },
  {
    id: 4,
    title: "New Comment",
    text: "@janedoe just commented on your post",
    type: "comments",
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
  },
];

export default function NotificationsCenter() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = NotificationsCenterStyles(isDark);
  const navigation = useNavigation();

  const NotificationItem = ({
    id,
    title,
    text,
    type,
  }: NotificationItemProps) => {
    const isMessages = type === "messages";
    const isLikes = type === "likes";
    const isBadges = type === "badges";
    const isComments = type === "comments";
    const isGame = type === "game";
    const isFollower = type === "followers";

    const notificationIcon = () => {
      if (isGame)
        return (
          <Ionicons
            name={"alert"}
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        );
      if (isLikes)
        return (
          <Ionicons
            name={"heart-outline"}
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        );
      if (isComments)
        return (
          <Ionicons
            name={"chatbubble-ellipses-outline"}
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        );
      if (isMessages)
        return (
          <Ionicons
            name={"chatbubbles-outline"}
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        );
      if (isBadges)
        return (
          <Ionicons
            name={"ribbon-outline"}
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        );
      if (isFollower)
        return (
          <Ionicons
            name={"people-outline"}
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        );
    };

    if (!title && !text) return null;

    return (
      <View key={id} style={styles.notficationRow}>
        <View style={styles.iconWrapper}>{notificationIcon()}</View>
        <View style={styles.textContainer}>
          <Text style={styles.notficationHeader}>{title}</Text>
          <Text style={styles.notficationText}>{text}</Text>
        </View>
      </View>
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeader tabName="Notifications" onBack={goBack} />,
    });
  }, [navigation]);

  return (
    <FlatList
      data={NOTIFICATIONS}
      renderItem={({ item }) => <NotificationItem {...item} />}
      contentContainerStyle={styles.container}
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

    notficationRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
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

    notficationHeader: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    notficationText: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });