import type { ChatMessageItem } from "../types/chat";
export const MAX_CHAT_MESSAGES = 300;
export const CHAT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const CHAT_EMOJIS = ["😂", "😱", "😳", "🔥"];
export const chatCacheKey = (userId: number, gameId: string) => `gameChat:v2:${userId}:${gameId}`;

export function boundedChatMessages(messages: ChatMessageItem[]): ChatMessageItem[] {
  const unique = new Map<string, ChatMessageItem>();
  for (const message of messages) unique.set(message.id, message);
  return [...unique.values()].sort((a, b) => a.time - b.time || a.id.localeCompare(b.id)).slice(-MAX_CHAT_MESSAGES);
}

export function reconcileChatSnapshot(server: ChatMessageItem[], local: ChatMessageItem[], startedAt: number): ChatMessageItem[] {
  const serverClientIds = new Set(server.filter((message) => message.clientId).map((message) => `${message.senderId}:${message.clientId}`));
  // Server snapshot is authoritative; retain only local sends and events arriving during the request.
  const retained = local.filter((message) =>
    !serverClientIds.has(`${message.senderId}:${message.clientId}`) && (message.delivery === "pending" || message.delivery === "failed" ||
      (message.receivedAt != null && message.receivedAt >= startedAt)));
  const current = new Map(local.map((message) => [message.id, message]));
  const authoritative = server.map((message) => keepNewestChatReactions(message, current.get(message.id)));
  return boundedChatMessages([...retained, ...authoritative]);
}

export function selectUnconfirmedChatMessages(messages: ChatMessageItem[], userId: number, gameId: string): ChatMessageItem[] {
  return boundedChatMessages(messages.filter((message) => message.senderId === userId && String(message.gameId) === gameId &&
    Boolean(message.clientId) && (message.delivery === "pending" || message.delivery === "failed")));
}

export function keepNewestChatReactions(incoming: ChatMessageItem, existing?: ChatMessageItem): ChatMessageItem {
  return existing && (existing.reactionVersion ?? 0) > (incoming.reactionVersion ?? 0) ?
    { ...incoming, reactions: existing.reactions, reactionVersion: existing.reactionVersion } : incoming;
}

export function chatMessageKey(message: Pick<ChatMessageItem, "id" | "clientId" | "senderId" | "gameId">): string {
  const id = message.senderId == null ? message.id : message.clientId ?? message.id;
  return `${message.gameId ?? ""}:${message.senderId ?? "unknown"}:${id}`;
}
