import { memo } from "react";
import { Colors, Fonts } from "constants/styles";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Message {
  id: string;
  user: string;
  message: string;
  time: number;
  profile_image?: string | number;
  gif_url?: string;
  reactions?: Record<string, string[]>;
}

interface Props {
  item: Message;
  index: number;
  userName: string;
  isDark: boolean;
  baseUrl: string;
  emojis: string[];
  onReaction: (messageId: string, emoji: string) => void;
}

const profilePlaceholder = "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393764/BannerPlaceholder_som0xw.png";

function ChatMessage({
  item,
  userName,
  isDark,
  baseUrl,
  emojis,
  onReaction,
}: Props) {
  const styles = chatMessageStyles(isDark);

  const time = new Date(item.time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const profileSource =
    typeof item.profile_image === "number"
      ? item.profile_image
      : {
          uri:
            typeof item.profile_image === "string"
              ? item.profile_image.startsWith("http")
                ? item.profile_image
                : `${baseUrl}/${item.profile_image.replace(/^\/+/, "")}`
              : profilePlaceholder,
        };

  const hasText = Boolean(item.message?.trim());
  const hasGif = Boolean(item.gif_url);

  const isCurrentUser = item.user === userName;

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      <View style={styles.userWrapper}>
        <Image source={profileSource} style={styles.image} />
        <Text style={styles.user}>{item.user}</Text>
      </View>

      <View
        style={[
          styles.messageWrapper,
          isCurrentUser && styles.currentUserMessageWrapper,
        ]}
      >
        {hasGif && <Image source={{ uri: item.gif_url! }} style={styles.gif} />}

        {hasText && <Text style={styles.message}>{item.message}</Text>}

        <Text style={styles.time}>{time}</Text>
      </View>

      <View
        style={[
          styles.reactionContainer,
          isCurrentUser && styles.currentUserReactionContainer,
        ]}
      >
        {emojis.map((emoji) => {
          const count = item.reactions?.[emoji]?.length ?? 0;

          return (
            <TouchableOpacity
              key={emoji}
              onPress={() => onReaction(item.id, emoji)}
              style={styles.reactionButtonWrapper}
            >
              <Text style={styles.reactionButtonText}>
                {emoji} {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default memo(
  ChatMessage,
  (prevProps, nextProps) =>
    prevProps.item === nextProps.item &&
    prevProps.userName === nextProps.userName &&
    prevProps.isDark === nextProps.isDark,
);

const chatMessageStyles = (isDark: boolean) =>
  StyleSheet.create({
    messageContainer: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      width: "100%",
    },
    currentUserContainer: {
      alignItems: "flex-end",
    },
    otherUserContainer: {
      alignItems: "flex-start",
    },
    userWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 4,
    },
    user: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    messageWrapper: {
      padding: 10,
      maxWidth: "86%",
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    currentUserMessageWrapper: {
      alignSelf: "flex-end",
    },
    message: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    gif: {
      width: 220,
      height: 220,
      borderRadius: 12,
      marginBottom: 6,
    },
    time: {
      fontSize: 12,
      marginTop: 6,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      alignSelf: "flex-end",
    },
    image: {
      width: 28,
      height: 28,
      borderRadius: 100,
    },
    reactionContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 6,
      gap: 8,
      maxWidth: "86%",
    },
    currentUserReactionContainer: {
      alignSelf: "flex-end",
      justifyContent: "flex-end",
    },
    reactionButtonWrapper: {
      borderRadius: 100,
      paddingVertical: 4,
      paddingHorizontal: 10,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    reactionButtonText: {
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
  });
