import type { ConversationReadPosition, DirectMessageItem, MessageItem } from "types/messages";

export const normalizeId = (value: unknown) => String(value ?? "").trim();

export const getMessageTime = (message: DirectMessageItem) => {
  if (!message.createdAt) return null;

  const time = new Date(message.createdAt).getTime();

  return Number.isNaN(time) ? null : time;
};

export const isPersistedOutgoingMessage = (message: DirectMessageItem) => {
  const id = normalizeId(message.id);
  const clientId = normalizeId(message.clientId);

  return (
    message.isCurrentUser &&
    message.status !== "pending" &&
    Boolean(id) &&
    (!clientId || id !== clientId) &&
    Boolean(message.createdAt)
  );
};

export const hasReadMessageCursor = (
  receipt: ConversationReadPosition | null | undefined,
) =>
  Boolean(
    receipt &&
    Object.prototype.hasOwnProperty.call(receipt, "lastReadMessageId"),
  );

export type ParticipantReadPosition = {
  readAt: number | null;
  lastReadMessageId?: string | null;
  hasMessageCursor: boolean;
};

const formatReadReceiptTime = (readAt: number | null | undefined) => {
  if (readAt === null || readAt === undefined) return null;

  const date = new Date(readAt);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getParticipantReadPosition = (
  conversation?: MessageItem | null,
): ParticipantReadPosition | null => {
  const otherUserId = normalizeId(conversation?.userId);

  if (!conversation || !otherUserId) return null;

  const receipt = conversation.readReceipts?.[otherUserId];
  const readAt = receipt?.readAt ?? conversation.otherParticipantLastReadAt;
  const hasMessageCursor = hasReadMessageCursor(receipt);

  if (!readAt && !hasMessageCursor) return null;

  const time = readAt ? new Date(readAt).getTime() : null;

  return {
    readAt: time === null || Number.isNaN(time) ? null : time,
    lastReadMessageId: hasMessageCursor
      ? (receipt?.lastReadMessageId ?? null)
      : undefined,
    hasMessageCursor,
  };
};

export const getMessageReceiptLabels = (
  messages: DirectMessageItem[],
  otherParticipantReadPosition: ParticipantReadPosition | null,
) => {
  let latestOutgoingMessage: DirectMessageItem | null = null;
  let latestReadOutgoingMessage: DirectMessageItem | null = null;
  const readMessageId = otherParticipantReadPosition?.hasMessageCursor
    ? normalizeId(otherParticipantReadPosition.lastReadMessageId)
    : "";

  for (const message of messages) {
    if (!isPersistedOutgoingMessage(message)) continue;

    latestOutgoingMessage = message;

    if (readMessageId) {
      if (normalizeId(message.id) === readMessageId) {
        latestReadOutgoingMessage = message;
      }

      continue;
    }

    if (otherParticipantReadPosition?.hasMessageCursor) {
      continue;
    }

    const messageTime = getMessageTime(message);

    if (
      otherParticipantReadPosition?.readAt !== null &&
      otherParticipantReadPosition?.readAt !== undefined &&
      messageTime !== null &&
      messageTime <= otherParticipantReadPosition.readAt
    ) {
      latestReadOutgoingMessage = message;
    }
  }

  const labels: Record<string, string> = {};
  const renderedReadMessageId = latestReadOutgoingMessage
    ? normalizeId(latestReadOutgoingMessage.id)
    : "";
  const sentMessageId = latestOutgoingMessage
    ? normalizeId(latestOutgoingMessage.id)
    : "";

  if (renderedReadMessageId) {
    const readTime = formatReadReceiptTime(
      otherParticipantReadPosition?.readAt,
    );

    labels[renderedReadMessageId] = readTime ? `Read ${readTime}` : "Read";
  } else if (sentMessageId) {
    labels[sentMessageId] = "Sent";
  }

  return labels;
};

