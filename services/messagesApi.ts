import { apiClient } from "utils/apiClient";
import {
  ConversationReadPayload,
  ConversationReadPosition,
  DirectMessageItem,
  MessageAttachment,
  MessageItem,
  MessageThemePreference,
  SendDirectMessagePayload,
} from "types/messages";
import { normalizeMessageThemePreference } from "utils/messageTheme";

type RawRecord = Record<string, any>;
type ApiRequestError = {
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
};

export type CreateConversationResponse = {
  success?: boolean;
  created?: boolean;
  conversationId?: string;
  conversation?: MessageItem | null;
  id?: string;
};

export type PaginatedConversationsResponse = {
  items: MessageItem[];
  nextCursor: string | null;
};

export type PaginatedMessagesResponse = {
  messages: DirectMessageItem[];
  nextCursor: string | null;
};

const getFirstArray = (payload: any, keys: string[]) => {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload?.data)) return payload.data;

  return [];
};

const getFirstObject = (payload: any, keys: string[]) => {
  if (!payload || Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (payload[key] && typeof payload[key] === "object") {
      return payload[key];
    }
  }

  return payload.data && typeof payload.data === "object"
    ? payload.data
    : payload;
};

const getRawThemePreference = (
  raw: RawRecord = {},
  currentUserId?: number | string | null,
) => {
  const directPreference =
    raw.messageThemePreference ??
    raw.message_theme_preference ??
    raw.themePreference ??
    raw.theme_preference;

  if (directPreference) return directPreference;

  const directMember =
    raw.currentUserMember ??
    raw.current_user_member ??
    raw.member ??
    raw.membership ??
    raw.conversationMember ??
    raw.conversation_member;

  const getMemberPreference = (member?: RawRecord | null) =>
    member?.messageThemePreference ??
    member?.message_theme_preference ??
    member?.themePreference ??
    member?.theme_preference;

  const directMemberPreference = getMemberPreference(directMember);

  if (directMemberPreference) return directMemberPreference;

  const rawMembers =
    raw.members ??
    raw.conversationMembers ??
    raw.conversation_members ??
    raw.participants ??
    raw.users;

  if (!Array.isArray(rawMembers)) return null;

  const currentMember =
    rawMembers.find((member) =>
      Boolean(
        member?.isCurrentUser ??
          member?.is_current_user ??
          member?.currentUser ??
          member?.current_user,
      ),
    ) ??
    rawMembers.find((member) => {
      if (currentUserId == null) return false;

      const memberUserId =
        member?.userId ??
        member?.user_id ??
        member?.profileId ??
        member?.profile_id ??
        member?.user?.id;

      return String(memberUserId) === String(currentUserId);
    });

  return getMemberPreference(currentMember);
};

const formatTimestamp = (value?: string | number | Date | null) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const normalizeDateTime = (value?: string | number | Date | null) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
};

const normalizeAttachment = (
  raw?: RawRecord | null,
): MessageAttachment | null => {
  if (!raw) return null;

  const id = String(raw.id ?? raw.attachmentId ?? raw.attachment_id ?? "").trim();
  const uri = raw.uri ?? raw.url ?? raw.imageUrl ?? raw.gifUrl;
  const type = raw.type;

  if ((!id && !uri) || (type !== "image" && type !== "gif")) return null;

  return {
    ...(id ? { id } : {}),
    type,
    ...(uri ? { uri: String(uri) } : {}),
    mimeType: raw.mimeType ?? raw.mime_type ?? null,
    sizeBytes: raw.sizeBytes ?? raw.size_bytes ?? null,
    width: raw.width ?? null,
    height: raw.height ?? null,
  };
};

const getMemberUserId = (member?: RawRecord | null) =>
  member?.userId ??
  member?.user_id ??
  member?.readerId ??
  member?.reader_id ??
  member?.profileId ??
  member?.profile_id ??
  member?.user?.id;

const getMemberReadAt = (member?: RawRecord | null) =>
  member?.readAt ??
  member?.read_at ??
  member?.lastReadAt ??
  member?.last_read_at;

const getFirstExistingValue = (
  record: RawRecord | null | undefined,
  keys: string[],
) => {
  if (!record) return undefined;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
  }

  return undefined;
};

const getMemberLastReadMessageId = (member?: RawRecord | null) =>
  getFirstExistingValue(member, [
    "lastReadMessageId",
    "last_read_message_id",
    "messageId",
    "message_id",
  ]);

const addReadPosition = (
  receipts: Record<string, ConversationReadPosition>,
  userId: unknown,
  readAt: unknown,
  lastReadMessageId?: unknown,
) => {
  const normalizedUserId = String(userId ?? "").trim();

  if (!normalizedUserId) return;

  const receipt: ConversationReadPosition = {
    userId: userId as string | number,
    readAt: normalizeDateTime(readAt as string | number | Date | null),
  };

  if (lastReadMessageId !== undefined) {
    receipt.lastReadMessageId =
      lastReadMessageId === null ? null : String(lastReadMessageId);
  }

  receipts[normalizedUserId] = receipt;
};

const normalizeReadReceipts = (
  raw: RawRecord = {},
  currentUserId?: number | string | null,
) => {
  const receipts: Record<string, ConversationReadPosition> = {};
  const rawReceipts =
    raw.readReceipts ??
    raw.read_receipts ??
    raw.readPositions ??
    raw.read_positions;

  if (Array.isArray(rawReceipts)) {
    rawReceipts.forEach((receipt) => {
      addReadPosition(
        receipts,
        getMemberUserId(receipt),
        getMemberReadAt(receipt),
        getMemberLastReadMessageId(receipt),
      );
    });
  } else if (rawReceipts && typeof rawReceipts === "object") {
    Object.entries(rawReceipts).forEach(([key, value]) => {
      const receipt = value as RawRecord | null;

      addReadPosition(
        receipts,
        getMemberUserId(receipt) ?? key,
        getMemberReadAt(receipt),
        getMemberLastReadMessageId(receipt),
      );
    });
  }

  const currentMember =
    raw.currentMember ??
    raw.current_member ??
    raw.currentUserMember ??
    raw.current_user_member ??
    raw.member ??
    raw.membership ??
    raw.conversationMember ??
    raw.conversation_member;

  addReadPosition(
    receipts,
    getMemberUserId(currentMember) ?? currentUserId,
    getMemberReadAt(currentMember) ??
      raw.currentUserLastReadAt ??
      raw.current_user_last_read_at,
    getMemberLastReadMessageId(currentMember),
  );

  const otherMember =
    raw.otherMember ??
    raw.other_member ??
    raw.otherParticipant ??
    raw.other_participant ??
    raw.participant ??
    raw.user ??
    raw.recipient;

  addReadPosition(
    receipts,
    getMemberUserId(otherMember) ??
      raw.userId ??
      raw.user_id ??
      raw.recipientId ??
      raw.recipient_id,
    getMemberReadAt(otherMember) ??
      raw.otherParticipantLastReadAt ??
      raw.other_participant_last_read_at ??
      raw.otherLastReadAt ??
      raw.other_last_read_at,
    getMemberLastReadMessageId(otherMember),
  );

  return receipts;
};

export const normalizeConversationReadPayload = (
  payload: any,
): ConversationReadPayload | null => {
  const raw = getFirstObject(payload, [
    "readReceipt",
    "read_receipt",
    "receipt",
  ]) as RawRecord;

  const conversationId = String(
    raw?.conversationId ?? raw?.conversation_id ?? "",
  ).trim();
  const readerId =
    raw?.readerId ?? raw?.reader_id ?? raw?.userId ?? raw?.user_id;
  const readAt = normalizeDateTime(
    raw?.readAt ?? raw?.read_at ?? raw?.lastReadAt ?? raw?.last_read_at,
  );
  const lastReadMessageId = getFirstExistingValue(raw, [
    "lastReadMessageId",
    "last_read_message_id",
    "lastReadMessageID",
  ]);

  if (!conversationId || !String(readerId ?? "").trim() || !readAt) {
    return null;
  }

  const normalized: ConversationReadPayload = {
    conversationId,
    readerId,
    readAt,
  };

  if (lastReadMessageId !== undefined) {
    normalized.lastReadMessageId =
      lastReadMessageId === null ? null : String(lastReadMessageId);
  }

  return normalized;
};

export const normalizeConversation = (
  raw: RawRecord = {},
  currentUserId?: number | string | null,
): MessageItem => {
  const participant = raw.participant ?? raw.user ?? raw.recipient ?? {};
  const lastMessage = raw.lastMessage;

  const lastMessageText =
    typeof lastMessage === "string"
      ? lastMessage
      : lastMessage?.text ?? raw.lastMessageText ?? "";

  const fullName =
    raw.fullName ??
    raw.full_name ??
    participant.fullName ??
    participant.full_name ??
    "";

  const timestampSource =
    raw.timestamp ??
    raw.lastMessageAt ??
    raw.updatedAt ??
    lastMessage?.createdAt ??
    raw.createdAt;
  const readReceipts = normalizeReadReceipts(raw, currentUserId);

  return {
    id: String(raw.id ?? raw.conversationId ?? raw._id ?? ""),
    dmKey: raw.dmKey ?? raw.dm_key,
    userId:
      raw.userId ??
      raw.recipientId ??
      raw.participantId ??
      participant.id ??
      participant.userId,
    username: raw.username ?? participant.username ?? "Tempo User",
    fullName,
    full_name: fullName,
    profileImageUrl:
      raw.profileImageUrl ??
      raw.profile_image ??
      participant.profileImageUrl ??
      participant.profile_image ??
      "",
    isVerified: Boolean(raw.isVerified ?? participant.isVerified),
    isOnline: Boolean(raw.isOnline ?? participant.isOnline),
    isPinned: Boolean(raw.isPinned ?? raw.pinned),
    type: raw.type ?? "user",
    lastMessage: lastMessageText,
    timestamp: raw.timestampLabel ?? formatTimestamp(timestampSource),
    unreadCount: Number(raw.unreadCount ?? raw.unread_count ?? 0),
    lastMessageAt: raw.lastMessageAt ?? lastMessage?.createdAt,
    updatedAt: raw.updatedAt,
    activityAt: raw.activityAt,
    currentUserLastReadAt: normalizeDateTime(
      raw.currentUserLastReadAt ?? raw.current_user_last_read_at,
    ),
    otherParticipantLastReadAt: normalizeDateTime(
      raw.otherParticipantLastReadAt ??
        raw.other_participant_last_read_at ??
        raw.otherLastReadAt ??
        raw.other_last_read_at,
    ),
    readReceipts,
    messageThemePreference: normalizeMessageThemePreference(
      getRawThemePreference(raw, currentUserId),
    ),
  };
};

const normalizeMessageStatus = (
  status: unknown,
): DirectMessageItem["status"] => {
  if (status === "pending" || status === "sent" || status === "failed") {
    return status;
  }

  return undefined;
};

export const normalizeMessage = (raw: RawRecord = {}): DirectMessageItem => {
  const createdAt = raw.createdAt ?? raw.timestamp;

  return {
    id: String(raw.id ?? raw.messageId ?? raw._id ?? raw.clientId ?? ""),
    conversationId: String(raw.conversationId ?? raw.conversation_id ?? ""),
    text: raw.text ?? raw.body ?? raw.message ?? "",
    attachment: normalizeAttachment(raw.attachment),
    timestamp: raw.timestampLabel ?? formatTimestamp(createdAt),
    createdAt,
    isCurrentUser: Boolean(raw.isCurrentUser ?? raw.isOwnMessage ?? raw.own),
    senderId: raw.senderId ?? raw.sender?.id,
    senderUsername: raw.senderUsername ?? raw.sender?.username,
    senderProfileImageUrl:
      raw.senderProfileImageUrl ?? raw.sender?.profileImageUrl ?? "",
    clientId: raw.clientId,
    status: normalizeMessageStatus(raw.status),
  };
};

/**
 * Paginated conversations: matches backend `{ items, nextCursor }`
 */
export const getConversations = async (
  search?: string,
  cursor?: string,
  limit: number = 50,
  currentUserId?: number | string | null,
): Promise<PaginatedConversationsResponse> => {
  const params: Record<string, any> = {};

  const trimmed = search?.trim();
  if (trimmed) params.search = trimmed;
  if (cursor) params.cursor = cursor;
  params.limit = limit;

  let response;

  try {
    response = await apiClient.get("/api/messages/conversations", {
      params,
    });
  } catch (error) {
    if (__DEV__) {
      const requestError = error as ApiRequestError;

      console.error("Failed to fetch conversations", {
        status: requestError.response?.status,
        data: requestError.response?.data,
        message: requestError.message,
      });
    }

    throw error;
  }

  const data = response.data ?? {};
  const rawItems = getFirstArray(data, ["items", "conversations"]);

  const items = rawItems.map((raw: RawRecord) =>
    normalizeConversation(raw, currentUserId),
  );

  const nextCursor = data.nextCursor ?? null;

  return {
    items,
    nextCursor,
  };
};

export const getConversation = async (
  conversationId: string,
  currentUserId?: number | string | null,
): Promise<MessageItem | null> => {
  const response = await apiClient.get(
    `/api/messages/conversations/${conversationId}`,
  );

  const rawConversation = getFirstObject(response.data, ["conversation"]);

  if (!rawConversation) return null;

  return normalizeConversation(rawConversation as RawRecord, currentUserId);
};

export const createConversation = async (
  recipientId: number | string,
): Promise<CreateConversationResponse> => {
  const response = await apiClient.post("/api/messages/conversations", {
    recipientId,
  });

  const rawConversation = response.data?.conversation;
  const conversation = rawConversation
    ? normalizeConversation(rawConversation)
    : null;

  const conversationId =
    response.data?.conversationId ??
    conversation?.id ??
    response.data?.id;

  return {
    success: response.data?.success,
    created: response.data?.created,
    conversationId: conversationId ? String(conversationId) : undefined,
    conversation,
    id: conversationId ? String(conversationId) : undefined,
  };
};

export const getMessages = async (
  conversationId: string,
  options?: { limit?: number; before?: string },
): Promise<DirectMessageItem[]> => {
  const response = await getMessagesPage(conversationId, options);

  return response.messages;
};

export const getMessagesPage = async (
  conversationId: string,
  options?: { limit?: number; before?: string; cursor?: string },
): Promise<PaginatedMessagesResponse> => {
  const response = await apiClient.get(
    `/api/messages/conversations/${conversationId}/messages`,
    { params: options },
  );

  return {
    messages: getFirstArray(response.data, ["messages"]).map(normalizeMessage),
    nextCursor: response.data?.nextCursor ?? null,
  };
};

export const sendMessageRest = async (
  conversationId: string,
  payload: SendDirectMessagePayload,
): Promise<DirectMessageItem> => {
  const response = await apiClient.post(
    `/api/messages/conversations/${conversationId}/messages`,
    payload,
  );

  return normalizeMessage(
    getFirstObject(response.data, ["message"]) as RawRecord,
  );
};

export const markConversationRead = async (
  conversationId: string,
): Promise<ConversationReadPayload | null> => {
  const response = await apiClient.patch(
    `/api/messages/conversations/${conversationId}/read`,
  );

  return normalizeConversationReadPayload(response.data);
};

export const updateConversationThemePreference = async (
  conversationId: string,
  preference: MessageThemePreference,
): Promise<MessageThemePreference> => {
  const normalizedPreference = normalizeMessageThemePreference(preference);
  const response = await apiClient.patch(
    `/api/messages/conversations/${conversationId}/theme`,
    { messageThemePreference: normalizedPreference },
  );
  const responseData = response.data?.data ?? response.data;

  const rawPreference =
    responseData?.messageThemePreference ??
    responseData?.message_theme_preference ??
    responseData?.themePreference ??
    responseData?.theme_preference ??
    getRawThemePreference(responseData) ??
    (responseData?.mode ? responseData : null);

  return normalizeMessageThemePreference(rawPreference ?? normalizedPreference);
};

export const pinConversation = async (
  conversationId: string,
  isPinned: boolean,
): Promise<MessageItem> => {
  const response = await apiClient.patch(
    `/api/messages/conversations/${conversationId}/pin`,
    { isPinned },
  );

  return normalizeConversation(
    getFirstObject(response.data, ["conversation"]) as RawRecord,
  );
};

export const deleteConversation = async (conversationId: string) => {
  await apiClient.delete(`/api/messages/conversations/${conversationId}`);
};

export const uploadMessageImage = async (
  conversationId: string,
  image: { uri: string; name?: string; type?: string },
): Promise<MessageAttachment & { id: string }> => {
  const filename = image.name || image.uri.split("/").pop() || "message.jpg";
  const mimeType = image.type || "image/jpeg";
  const formData = new FormData();

  formData.append("image", {
    uri: image.uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const response = await apiClient.post(
    `/api/messages/conversations/${conversationId}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  const attachment = normalizeAttachment(response.data?.attachment);

  if (!attachment?.id) {
    throw new Error("Image upload response was missing an attachment.");
  }

  return { ...attachment, id: attachment.id };
};

export const uploadMessageGif = async (
  conversationId: string,
  giphyId: string,
): Promise<MessageAttachment & { id: string }> => {
  const response = await apiClient.post(
    `/api/messages/conversations/${conversationId}/attachments`,
    { giphyId },
  );

  const attachment = normalizeAttachment(response.data?.attachment);

  if (!attachment?.id || attachment.type !== "gif") {
    throw new Error("GIF upload response was missing an attachment.");
  }

  return { ...attachment, id: attachment.id };
};
