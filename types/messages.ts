export type MessageAttachmentType = "image" | "gif";

export type MessageAttachment = {
  id?: string;
  type: MessageAttachmentType;
  uri?: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  width?: number | null;
  height?: number | null;
};

export type MessageThemePreference = {
  mode: "default" | "favorite_team" | "manual";
  league: string | null;
  teamId: string | number | null;
  primaryColor: string | null;
  secondaryColor: string | null;
};

export type MessageAccent = {
  primary: string;
  secondary: string;
};

export type ConversationReadPosition = {
  userId: number | string;
  readAt: string | null;
  lastReadMessageId?: string | null;
};

export type ConversationReadPayload = {
  conversationId: string;
  readerId: number | string;
  readAt: string;
  lastReadMessageId?: string | null;
};

export type MessageItem = {
  id: string;
  dmKey?: string;
  userId?: number | string;
  username: string;
  fullName?: string;
  full_name?: string;
  profileImageUrl?: string;
  isVerified?: boolean;
  isOnline: boolean;
  isPinned?: boolean;
  type?: "user" | "group" | string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  lastMessageAt?: string;
  updatedAt?: string;
  activityAt?: string;
  currentUserLastReadAt?: string | null;
  otherParticipantLastReadAt?: string | null;
  readReceipts?: Record<string, ConversationReadPosition>;
  messageThemePreference?: MessageThemePreference;
};

export type DirectMessageItem = {
  id: string;
  conversationId: string;
  text: string;
  attachment?: MessageAttachment | null;
  timestamp: string;
  createdAt?: string;
  isCurrentUser: boolean;
  senderId?: number | string;
  senderUsername?: string;
  senderProfileImageUrl?: string;
  clientId?: string;
  status?: "pending" | "sent" | "failed";
};

export type SendDirectMessagePayload = {
  text?: string;
  attachmentId?: string;
  clientId?: string;
};

export type ComposeDirectMessagePayload = {
  text?: string;
  attachment?: MessageAttachment | null;
};
