import type {
  ChatMessageItem,
  ChatReactionMap,
  IncomingChatMessage,
} from "types/chat";
import { BASE_URL } from "utils/apiClient";
import { buildChatPayload, type ChatSendPayload } from "utils/chatPayload";

const ECHO_DEDUPE_WINDOW_MS = 1500;

type CreateClientMessageOptions = {
  userName: string;
  profileImage?: unknown;
  gameId: string | number;
  now?: number;
};

type FlexibleIncomingChatMessage = IncomingChatMessage & {
  text?: unknown;
  body?: unknown;
  username?: unknown;
  name?: unknown;
  profileImage?: unknown;
  avatar_url?: unknown;
  game_id?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
  message_id?: unknown;
  gifUrl?: unknown;
  gifURL?: unknown;
  gif?: unknown;
  giphyUrl?: unknown;
  payload?: {
    text?: unknown;
    message?: unknown;
    body?: unknown;
    gif_url?: unknown;
    gifUrl?: unknown;
    gifURL?: unknown;
    gif?: unknown;
    giphyUrl?: unknown;
  };
};

const normalizeString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const normalizeId = (value: unknown) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
};

const normalizeTime = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const numericTime = Number(value);
    if (Number.isFinite(numericTime)) return numericTime;

    const parsedTime = Date.parse(value);
    if (Number.isFinite(parsedTime)) return parsedTime;
  }

  return Date.now();
};

const normalizeGameId = (value: unknown) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
};

const normalizeReactions = (value: unknown): ChatReactionMap | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const reactions = Object.entries(value as Record<string, unknown>).reduce<
    ChatReactionMap
  >((acc, [emoji, users]) => {
    if (!Array.isArray(users)) return acc;

    const normalizedUsers = Array.from(
      new Set(
        users
          .map((user) => normalizeString(user))
          .filter((user): user is string => Boolean(user)),
      ),
    );

    if (normalizedUsers.length > 0) {
      acc[emoji] = normalizedUsers;
    }

    return acc;
  }, {});

  return Object.keys(reactions).length > 0 ? reactions : undefined;
};

export const normalizeProfileImage = (value: unknown) => {
  const image = normalizeString(value);
  if (!image) return undefined;

  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("//")) return `https:${image}`;

  return `${BASE_URL}/${image.replace(/^\/+/, "")}`;
};

const getMessageText = (message: IncomingChatMessage) => {
  const raw = message as FlexibleIncomingChatMessage;

  return (
    normalizeString(raw.message) ??
    normalizeString(raw.text) ??
    normalizeString(raw.body) ??
    normalizeString(raw.payload?.message) ??
    normalizeString(raw.payload?.text) ??
    normalizeString(raw.payload?.body) ??
    ""
  );
};

const getMessageGifUrl = (message: IncomingChatMessage) => {
  const raw = message as FlexibleIncomingChatMessage;

  return (
    normalizeString(raw.gif_url) ??
    normalizeString(raw.gifUrl) ??
    normalizeString(raw.gifURL) ??
    normalizeString(raw.gif) ??
    normalizeString(raw.giphyUrl) ??
    normalizeString(raw.payload?.gif_url) ??
    normalizeString(raw.payload?.gifUrl) ??
    normalizeString(raw.payload?.gifURL) ??
    normalizeString(raw.payload?.gif) ??
    normalizeString(raw.payload?.giphyUrl)
  );
};

const getMessageUser = (message: IncomingChatMessage) => {
  const raw = message as FlexibleIncomingChatMessage;

  return (
    normalizeString(raw.user) ??
    normalizeString(raw.username) ??
    normalizeString(raw.name) ??
    "Anonymous"
  );
};

const getMessageTime = (message: IncomingChatMessage) => {
  const raw = message as FlexibleIncomingChatMessage;

  return normalizeTime(raw.time ?? raw.created_at ?? raw.createdAt);
};

const getMessageGameId = (message: IncomingChatMessage) => {
  const raw = message as FlexibleIncomingChatMessage;

  return normalizeGameId(raw.gameId ?? raw.game_id);
};

const getMessageProfileImage = (message: IncomingChatMessage) => {
  const raw = message as FlexibleIncomingChatMessage;

  return normalizeProfileImage(
    raw.profile_image ?? raw.profileImage ?? raw.avatar_url,
  );
};

export const getFallbackMessageId = (message: IncomingChatMessage) =>
  [
    getMessageUser(message),
    getMessageTime(message),
    getMessageText(message),
    getMessageGifUrl(message) ?? "",
  ].join(":");

export const createMessageKey = (
  message: ChatMessageItem | IncomingChatMessage,
) =>
  normalizeId(message.clientId) ??
  normalizeId(message.id) ??
  getFallbackMessageId(message as IncomingChatMessage);

export const normalizeMessage = (
  message: IncomingChatMessage,
): ChatMessageItem | null => {
  const raw = message as FlexibleIncomingChatMessage;

  const cleanText = getMessageText(message);
  const gifUrl = getMessageGifUrl(message);

  if (!cleanText && !gifUrl) return null;

  return {
    id:
      normalizeId(raw.id) ??
      normalizeId(raw.message_id) ??
      createMessageKey(message),
    clientId: normalizeId(raw.clientId),
    user: getMessageUser(message),
    message: cleanText,
    time: getMessageTime(message),
    profile_image: getMessageProfileImage(message),
    gif_url: gifUrl,
    reactions: normalizeReactions(raw.reactions),
    gameId: getMessageGameId(message),
  };
};

export const areSameChatMessage = (
  a: ChatMessageItem,
  b: ChatMessageItem,
) => {
  if (
    a.id === b.id ||
    Boolean(a.clientId && b.clientId && a.clientId === b.clientId) ||
    Boolean(a.clientId && a.clientId === b.id) ||
    Boolean(b.clientId && b.clientId === a.id)
  ) {
    return true;
  }

  return (
    a.user === b.user &&
    a.message === b.message &&
    a.gif_url === b.gif_url &&
    Math.abs(a.time - b.time) <= ECHO_DEDUPE_WINDOW_MS
  );
};

const areChatMessagesEqual = (a: ChatMessageItem, b: ChatMessageItem) =>
  a.id === b.id &&
  a.clientId === b.clientId &&
  a.user === b.user &&
  a.message === b.message &&
  a.time === b.time &&
  a.profile_image === b.profile_image &&
  a.gif_url === b.gif_url &&
  a.reactions === b.reactions &&
  a.gameId === b.gameId;

export const mergeChatMessages = (
  existing: ChatMessageItem,
  incoming: ChatMessageItem,
) => {
  const merged: ChatMessageItem = {
    ...existing,
    ...incoming,
    clientId: existing.clientId ?? incoming.clientId,
    profile_image: incoming.profile_image ?? existing.profile_image,
    gif_url: incoming.gif_url ?? existing.gif_url,
    reactions: incoming.reactions ?? existing.reactions,
    gameId: incoming.gameId ?? existing.gameId,
  };

  return areChatMessagesEqual(existing, merged) ? existing : merged;
};

export const dedupeMessages = (messages: ChatMessageItem[]) =>
  messages.reduce<ChatMessageItem[]>((uniqueMessages, message) => {
    const existingIndex = uniqueMessages.findIndex((existing) =>
      areSameChatMessage(existing, message),
    );

    if (existingIndex === -1) {
      return [...uniqueMessages, message];
    }

    const nextMessages = [...uniqueMessages];
    nextMessages[existingIndex] = mergeChatMessages(
      nextMessages[existingIndex],
      message,
    );
    return nextMessages;
  }, []);

export const createClientMessage = (
  payload: ChatSendPayload,
  {
    userName,
    profileImage,
    gameId,
    now = Date.now(),
  }: CreateClientMessageOptions,
) => {
  const normalizedPayload = buildChatPayload(payload.text ?? "", payload.gifUrl);
  if (!normalizedPayload) return null;

  const clientId = [
    userName || "Anonymous",
    String(gameId),
    String(now),
    Math.random().toString(36).slice(2, 8),
  ].join("-");

  return {
    id: clientId,
    clientId,
    user: userName || "Anonymous",
    message: normalizedPayload.text ?? "",
    time: now,
    profile_image: normalizeProfileImage(profileImage),
    gif_url: normalizedPayload.gifUrl,
    gameId,
  } satisfies ChatMessageItem;
};

export const createSendPayloadKey = (payload: ChatSendPayload) =>
  [payload.text ?? "", payload.gifUrl ?? ""].join("\u0000");