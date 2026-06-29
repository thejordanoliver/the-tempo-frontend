export type MessageAttachmentType = "image" | "gif";

export type MessageAttachment = {
  type: MessageAttachmentType;
  uri: string;
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

export type MessageItem = {
  id: string;
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
  attachment?: MessageAttachment | null;
  clientId?: string;
};
