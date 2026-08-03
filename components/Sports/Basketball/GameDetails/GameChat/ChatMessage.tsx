import { Colors, Fonts, activeOpacity } from "constants/styles";
import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ChatMessageItem } from "types/chat";

interface Props {
  item: ChatMessageItem;
  userName: string;
  isDark: boolean;
  emojis: string[];
  onReaction: (messageId: string, emoji: string) => void;
}

const profilePlaceholder =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393764/BannerPlaceholder_som0xw.png";

function ChatMessage({ item, userName, isDark, emojis, onReaction }: Props) {
  const styles = useMemo(() => chatMessageStyles(isDark), [isDark]);

  const time = new Date(item.time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasText = Boolean(item.message?.trim());
  const gifUrl = item.gif_url;
  const hasGif = Boolean(gifUrl);

  const isCurrentUser = item.user === userName;
  const profileImage = item.profile_image ?? profilePlaceholder;

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      <View
        style={[styles.userWrapper, isCurrentUser && styles.currentUserWrapper]}
      >
        <Image source={{ uri: profileImage }} style={styles.image} />

        <Text style={styles.user} numberOfLines={1}>
          {item.user}
        </Text>
      </View>

      <View
        style={[
          styles.messageWrapper,
          isCurrentUser && styles.currentUserMessageWrapper,
          hasGif && !hasText && styles.gifOnlyMessageWrapper,
        ]}
      >
        {hasGif && gifUrl && (
          <Image
            source={{ uri: gifUrl }}
            style={styles.gif}
            contentFit="cover"
          />
        )}

        {hasText && (
          <Text
            style={[styles.message, isCurrentUser && styles.currentUserText]}
          >
            {item.message}
          </Text>
        )}

        <Text style={[styles.time, isCurrentUser && styles.currentUserTime]}>
          {time}
        </Text>
      </View>

      <View
        style={[
          styles.reactionContainer,
          isCurrentUser && styles.currentUserReactionContainer,
        ]}
      >
        {emojis.map((emoji) => {
          const count = item.reactions?.[emoji]?.length ?? 0;
          const selected = item.reactions?.[emoji]?.includes(userName) ?? false;

          return (
            <TouchableOpacity
              key={emoji}
              activeOpacity={activeOpacity}
              onPress={() => onReaction(item.id, emoji)}
              style={[
                styles.reactionButtonWrapper,
                selected && styles.reactionButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.reactionButtonText,
                  selected && styles.reactionButtonTextSelected,
                ]}
              >
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
    prevProps.isDark === nextProps.isDark &&
    prevProps.emojis === nextProps.emojis &&
    prevProps.onReaction === nextProps.onReaction,
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
      maxWidth: "86%",
      marginBottom: 5,
    },
    currentUserWrapper: {
      flexDirection: "row-reverse",
    },
    user: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      flexShrink: 1,
      fontSize: 12,
    },
    image: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    messageWrapper: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      maxWidth: "86%",
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    currentUserMessageWrapper: {
      alignSelf: "flex-end",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    gifOnlyMessageWrapper: {
      padding: 6,
    },
    message: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      flexShrink: 1,
      lineHeight: 19,
      fontSize: 14,
    },
    currentUserText: {
      color: isDark ? Colors.white : Colors.black,
    },
    gif: {
      width: 220,
      height: 180,
      borderRadius: 14,
      marginBottom: 6,
      backgroundColor: isDark ? Colors.black : Colors.lightGray,
    },
    time: {
      fontSize: 11,
      marginTop: 6,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      alignSelf: "flex-end",
      fontFamily: Fonts.OSREGULAR,
    },
    currentUserTime: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    reactionContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 6,
      gap: 7,
      maxWidth: "86%",
    },
    currentUserReactionContainer: {
      alignSelf: "flex-end",
      justifyContent: "flex-end",
    },
    reactionButtonWrapper: {
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    reactionButtonSelected: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    reactionButtonText: {
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSREGULAR,
    },
    reactionButtonTextSelected: {
      color: isDark ? Colors.black : Colors.white,
    },
  });
