export type ChatReactionMap = Record<string, string[]>;

export type ChatMessageItem = {
  id: string;
  clientId?: string;
  cursor?: string;
  senderId?: number | null;
  user: string;
  message: string;
  time: number;
  profile_image?: string;
  gif_url?: string;
  reactions?: ChatReactionMap;
  reactionVersion?: number;
  gameId?: string | number;
  delivery?: "pending" | "sent" | "failed";
  error?: string;
  receivedAt?: number;
};

export type IncomingChatMessage = {
  id?: unknown;
  clientId?: unknown;
  cursor?: unknown;
  senderId?: unknown;
  sender_id?: unknown;
  user?: unknown;
  message?: unknown;
  time?: unknown;
  profile_image?: unknown;
  gif_url?: unknown;
  reactions?: unknown;
  reactionVersion?: unknown;
  gameId?: unknown;
};

export type GameChatHistoryResponse = {
  viewerUserId: number;
  messages: IncomingChatMessage[];
  nextCursor?: string;
  hasMore?: boolean;
};

export type SendGameChatMessagePayload = {
  gameId: string;
  clientId: string;
  text?: string;
  gifUrl?: string;
};

export type SendGameChatMessageAck =
  | {
      ok: true;
      message: IncomingChatMessage;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export type ToggleGameChatReactionPayload = {
  messageId: string;
  emoji: string;
  active: boolean;
  gameId: string;
};

export type ToggleGameChatReactionAck =
  | {
      ok: true;
      messageId: string;
      reactions: ChatReactionMap;
      reactionVersion?: number;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export type GameChatReactionUpdate = {
  gameId: string;
  messageId: string;
  reactions: ChatReactionMap;
  reactionVersion?: number;
};
