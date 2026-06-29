import { apiClient } from "utils/apiClient";
import {
  DirectMessageItem,
  MessageAttachment,
  MessageItem,
  MessageThemePreference,
  SendDirectMessagePayload,
} from "types/messages";
import { normalizeMessageThemePreference } from "utils/messageTheme";

type RawRecord = Record<string, any>;

export type CreateConversationResponse = {
  success?: boolean;
  created?: boolean;
  conversationId?: string;
  conversation?: MessageItem | null;
  id?: string;
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

const normalizeAttachment = (
  raw?: RawRecord | null,
): MessageAttachment | null => {
  if (!raw) return null;

  const uri = raw.uri ?? raw.url ?? raw.imageUrl ?? raw.gifUrl;
  const type = raw.type;

  if (!uri || (type !== "image" && type !== "gif")) return null;

  return {
    type,
    uri,
  };
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

  return {
    id: String(raw.id ?? raw.conversationId ?? raw._id ?? ""),
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

export const getConversations = async (
  search?: string,
): Promise<MessageItem[]> => {
  const response = await apiClient.get("/api/messages/conversations", {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });

  return getFirstArray(response.data, ["conversations"]).map(
    normalizeConversation,
  );
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
  const response = await apiClient.get(
    `/api/messages/conversations/${conversationId}/messages`,
    { params: options },
  );

  return getFirstArray(response.data, ["messages"]).map(normalizeMessage);
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

export const markConversationRead = async (conversationId: string) => {
  await apiClient.patch(`/api/messages/conversations/${conversationId}/read`);
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
