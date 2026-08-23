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

type NotificationType = "messages" | "likes" | "comments" | "badges" | "game";

type NotificationItemProps = {
  id: number;
  title: string;
  text: string;
  type: NotificationType;
};
const NOTIFICATIONS: NotificationItemProps[] = [
  {
    id: 1,
    title: "Title",
    text: "Text",
    type: "game",
  },
  {
    id: 2,
    title: "Title",
    text: "Text",
    type: "messages",
  },
  {
    id: 3,
    title: "Title",
    text: "Text",
    type: "likes",
  },
  {
    id: 4,
    title: "Title",
    text: "Text",
    type: "comments",
  },
  {
    id: 5,
    title: "Title",
    text: "Text",
    type: "badges",
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
            name={"heart"}
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
    };

    if (!title && !text) return null;

    return (
      <View key={id} style={styles.notficationRow}>
        <View style={styles.iconWrapper}>{notificationIcon()}</View>
        <View>
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
      style={styles.container}
    ></FlatList>
  );
}

export const NotificationsCenterStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: 80,
    },

    wrapper: { paddingHorizontal: 12 },

    notficationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.white : Colors.black,
    },

    iconWrapper: {
      padding: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 999,
    },
    notficationHeader: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    notficationText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      letterSpacing: 0.5,
      color: isDark ? Colors.white : Colors.black,
    },
  });
