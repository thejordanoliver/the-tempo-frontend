export type ChatReactionMap = Record<string, string[]>;

export type ChatMessageItem = {
  id: string;
  clientId?: string;
  senderId?: number | null;
  user: string;
  message: string;
  time: number;
  profile_image?: string;
  gif_url?: string;
  reactions?: ChatReactionMap;
  gameId?: string | number;
};

export type IncomingChatMessage = {
  id?: unknown;
  clientId?: unknown;
  senderId?: unknown;
  sender_id?: unknown;
  user?: unknown;
  message?: unknown;
  time?: unknown;
  profile_image?: unknown;
  gif_url?: unknown;
  reactions?: unknown;
  gameId?: unknown;
};

export type GameChatHistoryResponse = {
  messages: IncomingChatMessage[];
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
};

export type ToggleGameChatReactionAck =
  | {
      ok: true;
      messageId: string;
      reactions: ChatReactionMap;
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
};
