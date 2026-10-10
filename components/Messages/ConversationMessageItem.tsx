import AuthorizedMessageImage from "@/components/Messages/AuthorizedMessageImage";
import MessageImageViewer from "@/components/Messages/MessageImageViewer";
import ConfirmModal from "components/ConfirmModal";
import { activeOpacity } from "constants/styles";
import SafetyActionsModal from "components/SafetyActionsModal";
import { ConversationScreenStyles } from "@/styles/MessageStyles/ConversationScreenStyles";
import { Image } from "expo-image";
import { useScopedRouter } from "hooks/useScopedRouter";
import { getSharedForumPostId } from "utils/forumPostShare";
import { memo, useRef, useState } from "react";
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
  onUnsend?: (item: DirectMessageItem) => Promise<void>;
  onRetry?: (item: DirectMessageItem) => void;
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
  onUnsend,
  onRetry,
  onBlocked,
}: ConversationMessageItemProps) {
  const router = useScopedRouter();
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const unsendingRef = useRef(false);
  const [unsendModalVisible, setUnsendModalVisible] = useState(false);
  const [unsendFailed, setUnsendFailed] = useState(false);
  const canUnsend = item.isCurrentUser && Boolean(onUnsend) &&
    item.status !== "pending" && item.status !== "failed";

  const openMessageActions = () => {
    if (!item.isCurrentUser) {
      safety.open();
      return;
    }
    if (!canUnsend || unsendingRef.current) return;

    setUnsendFailed(false);
    setUnsendModalVisible(true);
  };

  const handleUnsend = async () => {
    if (!onUnsend || unsendingRef.current) return;
    unsendingRef.current = true;
    try {
      await onUnsend(item);
      setUnsendModalVisible(false);
    } catch {
      setUnsendFailed(true);
    } finally {
      unsendingRef.current = false;
    }
  };
  const sharedPostId = getSharedForumPostId(item.text);
  const messageText = sharedPostId
    ? item.text.trim().split("\n").slice(0, -1).join("\n").trim()
    : item.text;
  const hasText = messageText.trim().length > 0;
  const hasAttachment = Boolean(item.attachment);
  const showsBubble = !hasAttachment || hasText || Boolean(sharedPostId);
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
    hasAttachment && styles.mediaCaptionBubble,
    item.isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
    usesCustomMessageAccent &&
      !usesGradient && { backgroundColor: customBubbleColor },
    usesGradient && {
      experimental_backgroundImage: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
    },
  ];

  const timestamp = (
    <Text
      style={[
        styles.messageTime,
        showsBubble && item.isCurrentUser && !usesCustomMessageAccent && styles.currentUserMessageTime,
        showsBubble && (usesCustomMessageAccent || usesGradient) && {
          color: customTextColor,
          opacity: 0.72,
        },
      ]}
    >
      {item.timestamp}
    </Text>
  );

  const bubbleContent = (
    <>
      {hasText && (
        <Text
          style={[
            styles.messageText,
            showsBubble &&
              item.isCurrentUser &&
              !usesCustomMessageAccent &&
              styles.currentUserMessageText,
            showsBubble && (usesCustomMessageAccent || usesGradient) && {
              color: customTextColor,
            },
          ]}
        >
          {messageText}
        </Text>
      )}

      {sharedPostId && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Open shared forum post"
          onPress={() => router.push({ pathname: "/post/[postId]", params: { postId: sharedPostId } })}
          style={{ paddingVertical: 8 }}
        >
          <Text style={[styles.messageText, { textDecorationLine: "underline" },
            showsBubble && item.isCurrentUser && !usesCustomMessageAccent && styles.currentUserMessageText,
            showsBubble && (usesCustomMessageAccent || usesGradient) && { color: customTextColor },
          ]}>View post in Tempo →</Text>
        </Pressable>
      )}

      {timestamp}
    </>
  );

  return (
    <>
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
        {item.attachment && (
          <Pressable
            style={({ pressed }) => pressed && { opacity: activeOpacity }}
            onPress={() => setImageViewerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open full-screen image"
            onLongPress={openMessageActions}
            delayLongPress={350}
            accessibilityHint={canUnsend ? "Long press to unsend" : item.isCurrentUser ? undefined : "Long press for safety actions"}
          >
            <AuthorizedMessageImage
              attachment={item.attachment}
              style={styles.messageAttachment}
              contentFit="cover"
            />
          </Pressable>
        )}
        {hasAttachment && showsBubble && <View style={styles.mediaCaptionSpacer} />}
        {showsBubble ? (
          <Pressable
            style={({ pressed }) => [bubbleStyle, pressed && { opacity: activeOpacity }]}
            onLongPress={openMessageActions}
            delayLongPress={350}
            accessibilityHint={canUnsend ? "Long press to unsend" : item.isCurrentUser ? undefined : "Long press for safety actions"}
          >
            {bubbleContent}
          </Pressable>
        ) : timestamp}

        {item.isCurrentUser && item.status === "pending" && (
          <Text style={styles.messageReceiptText}>Sending...</Text>
        )}
        {item.isCurrentUser && item.status === "failed" && (
          <Pressable accessibilityRole="button" accessibilityLabel="Retry failed message" onPress={() => onRetry?.(item)}>
            <Text style={styles.messageReceiptText}>Failed to send. Tap to retry</Text>
          </Pressable>
        )}
        {item.isCurrentUser && item.status !== "pending" && item.status !== "failed" && Boolean(receiptLabel) && (
          <Text style={styles.messageReceiptText}>{receiptLabel}</Text>
        )}
      </View>
    </View>
    {imageViewerVisible && item.attachment && (
      <MessageImageViewer
        attachment={item.attachment}
        onClose={() => setImageViewerVisible(false)}
      />
    )}
    <ConfirmModal
      visible={unsendModalVisible}
      title={unsendFailed ? "Couldn't unsend message" : "Unsend message?"}
      message={unsendFailed ? "Please try again." : "This message will be removed for everyone."}
      confirmText={unsendFailed ? "Retry" : "Unsend"}
      cancelText="Cancel"
      variant="danger"
      onCancel={() => setUnsendModalVisible(false)}
      onConfirm={handleUnsend}
    />
    <SafetyActionsModal {...safety.modalProps} />
    </>
  );
}

export default memo(ConversationMessageItem);
