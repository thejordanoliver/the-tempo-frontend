import AuthorizedMessageImage from "@/components/Messages/AuthorizedMessageImage";
import { ConversationScreenStyles } from "@/styles/MessageStyles/ConversationScreenStyles";
import { Image } from "expo-image";
import { memo } from "react";
import { Text, View } from "react-native";
import type { DirectMessageItem } from "types/messages";
import { getContrastingTextColor } from "utils/color";

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
}: ConversationMessageItemProps) {
  const hasText = item.text.trim().length > 0;
  const hasAttachment = Boolean(item.attachment);

  const customBubbleColor = item.isCurrentUser
    ? primaryAccent
    : secondaryAccent;

  const customTextColor = usesCustomMessageAccent
    ? getContrastingTextColor(customBubbleColor)
    : undefined;

  const avatarUrl =
    item.senderProfileImageUrl || conversationProfileImageUrl || fallbackAvatar;

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
        <View
          style={[
            styles.messageBubble,
            hasAttachment && styles.attachmentMessageBubble,
            item.isCurrentUser
              ? styles.currentUserBubble
              : styles.otherUserBubble,
            usesCustomMessageAccent && {
              backgroundColor: customBubbleColor,
            },
          ]}
        >
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
                usesCustomMessageAccent && {
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
              usesCustomMessageAccent && {
                color: customTextColor,
                opacity: 0.72,
              },
            ]}
          >
            {item.timestamp}
          </Text>
        </View>

        {item.isCurrentUser && Boolean(receiptLabel) && (
          <Text style={styles.messageReceiptText}>{receiptLabel}</Text>
        )}
      </View>
    </View>
  );
}

export default memo(ConversationMessageItem);
