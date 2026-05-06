export type ChatReactionMap = Record<string, string[]>;

export type ChatMessageItem = {
  id: string;
  clientId?: string;
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
  user?: unknown;
  message?: unknown;
  time?: unknown;
  profile_image?: unknown;
  gif_url?: unknown;
  reactions?: unknown;
  gameId?: unknown;
};
