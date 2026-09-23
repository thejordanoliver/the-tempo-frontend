import AuthorizedMessageImage from "@/components/Messages/AuthorizedMessageImage";
import { ConversationScreenStyles } from "@/styles/MessageStyles/ConversationScreenStyles";
import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafetyActions } from "hooks/useSafetyActions";
import type { DirectMessageItem } from "types/messages";
import { getContrastingTextColor } from "utils/color";
import { getReadableGradientTextColor } from "utils/messageTheme";

type ConversationMessageStyles = ReturnType<typeof ConversationScreenStyles>;

interface ConversationMessageItemProps {
  item: DirectMessageItem;
  styles: ConversationMessageStyles;
  receiptLabel?: string;
  conversationProfileImageUrl?: string | null;
  fallbackAvatar: string;
  primaryAccent: string;
  secondaryAccent: string;
  usesCustomMessageAccent: boolean;
  usesGradient: boolean;
  onBlocked?: () => void;
}

function ConversationMessageItem({
  item,
  styles,
  receiptLabel,
  conversationProfileImageUrl,
  fallbackAvatar,
  primaryAccent,
  secondaryAccent,
  usesCustomMessageAccent,
  usesGradient,
  onBlocked,
}: ConversationMessageItemProps) {
  const hasText = item.text.trim().length > 0;
  const hasAttachment = Boolean(item.attachment);
  const safety = useSafetyActions({
    userId: item.senderId,
    username: item.senderUsername,
    targetType: "dm_message",
    targetId: item.id,
    onBlocked,
  });

  const customBubbleColor = item.isCurrentUser
    ? primaryAccent
    : secondaryAccent;

  const gradientColors = item.isCurrentUser
    ? ([primaryAccent, secondaryAccent] as const)
    : ([secondaryAccent, primaryAccent] as const);

  const customTextColor = usesGradient
    ? getReadableGradientTextColor(gradientColors[0], gradientColors[1])
    : usesCustomMessageAccent
      ? getContrastingTextColor(customBubbleColor)
      : undefined;

  const avatarUrl =
    item.senderProfileImageUrl || conversationProfileImageUrl || fallbackAvatar;
  const bubbleStyle = [
    styles.messageBubble,
    hasAttachment && styles.attachmentMessageBubble,
    item.isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
    usesCustomMessageAccent &&
      !usesGradient && { backgroundColor: customBubbleColor },
    usesGradient && {
      experimental_backgroundImage: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
    },
  ];

  const bubbleContent = (
    <>
      {item.attachment && (
        <AuthorizedMessageImage
          attachment={item.attachment}
          style={styles.messageAttachment}
          contentFit="cover"
        />
      )}

      {hasText && (
        <Text
          style={[
            styles.messageText,
            hasAttachment && styles.attachmentCaptionText,
            item.isCurrentUser &&
              !usesCustomMessageAccent &&
              styles.currentUserMessageText,
            (usesCustomMessageAccent || usesGradient) && {
              color: customTextColor,
            },
          ]}
        >
          {item.text}
        </Text>
      )}

      <Text
        style={[
          styles.messageTime,
          hasAttachment && styles.attachmentMessageTime,
          item.isCurrentUser &&
            !usesCustomMessageAccent &&
            styles.currentUserMessageTime,
          (usesCustomMessageAccent || usesGradient) && {
            color: customTextColor,
            opacity: 0.72,
          },
        ]}
      >
        {item.timestamp}
      </Text>
    </>
  );

  return (
    <View
      style={[
        styles.messageRow,
        item.isCurrentUser ? styles.currentUserRow : styles.otherUserRow,
      ]}
    >
      {!item.isCurrentUser && (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.messageAvatar}
          contentFit="cover"
        />
      )}

      <View
        style={[
          styles.messageStack,
          item.isCurrentUser
            ? styles.currentUserMessageStack
            : styles.otherUserMessageStack,
        ]}
      >
        <Pressable
          style={bubbleStyle}
          onLongPress={item.isCurrentUser ? undefined : safety.open}
          delayLongPress={350}
          accessibilityHint={item.isCurrentUser ? undefined : "Long press for safety actions"}
        >
          {bubbleContent}
        </Pressable>

        {item.isCurrentUser && Boolean(receiptLabel) && (
          <Text style={styles.messageReceiptText}>{receiptLabel}</Text>
        )}
      </View>
    </View>
  );
}

export default memo(ConversationMessageItem);
