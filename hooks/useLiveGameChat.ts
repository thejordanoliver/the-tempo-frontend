import { isAxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { io, type Socket } from "socket.io-client";
import type { ChatMessageItem, GameChatHistoryResponse, GameChatReactionUpdate, IncomingChatMessage, SendGameChatMessageAck, ToggleGameChatReactionAck } from "types/chat";
import { apiClient, getAccessToken, subscribeAuthSession } from "utils/apiClient";
import { getSocketNamespaceUrl } from "utils/apiConfig";
import { buildChatPayload, type ChatSendPayload } from "utils/chatPayload";
import { createClientMessage, createSendPayloadKey, normalizeMessage, normalizeProfileImage } from "utils/chatUtils";
import { boundedChatMessages, chatCacheKey, CHAT_CACHE_TTL_MS, CHAT_EMOJIS, reconcileChatSnapshot, selectUnconfirmedChatMessages, keepNewestChatReactions } from "utils/gameChatState";

export type GameChatContext = { sport: string; league: string; date?: string };
const SOCKET_URL = getSocketNamespaceUrl("");
const ACK_TIMEOUT = 10_000;

export function useLiveGameChat(gameId: string | number, context: GameChatContext) {
  const { user } = useAuth();
  const roomId = String(gameId);
  const userId = user?.id;
  const currentUserName = user?.username?.trim() || "Anonymous";
  const contextKey = JSON.stringify({ sport: context.sport, league: context.league, ...(context.date ? { date: context.date } : {}) });
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionVersion, setSessionVersion] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesRef = useRef(messages);
  const generation = useRef(0);
  const blockedIds = useRef(new Set<number>());
  const reactionInFlight = useRef(new Set<string>());
  const sendInFlight = useRef(new Set<string>());
  const identityRef = useRef("");
  const verifiedIdentityRef = useRef("");
  const recentSendRef = useRef<{ key: string; time: number } | null>(null);
  const deletedIds = useRef(new Set<string>());
  const syncRef = useRef<(() => Promise<void>) | null>(null);
  messagesRef.current = messages;

  useEffect(() => subscribeAuthSession(({ accessToken }) => {
    generation.current += 1;
    socketRef.current?.disconnect();
    setIsReady(false);
    if (!accessToken) {
      verifiedIdentityRef.current = "";
      setMessages([]);
      setIsReady(false);
      setUserCount(0);
    }
    setSessionVersion((value) => value + 1);
  }), []);

  const upsert = useCallback((raw: IncomingChatMessage) => {
    const message = normalizeMessage(raw);
    if (!message || deletedIds.current.has(message.id) || String(message.gameId) !== roomId || (message.senderId && blockedIds.current.has(message.senderId))) return;
    setMessages((current) => boundedChatMessages([
      ...current.filter((row) => row.id !== message.id && !(message.clientId && row.clientId === message.clientId && row.senderId === message.senderId)),
      { ...keepNewestChatReactions(message, current.find((row) => row.id === message.id)), delivery: "sent", receivedAt: Date.now() },
    ]));
  }, [roomId]);

  useEffect(() => {
    const run = ++generation.current;
    const controller = new AbortController();
    let socket: Socket | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let refreshing = false;
    let restoredDrafts: ChatMessageItem[] = [];
    let starting = false;
    let joined = false;
    let joining = false;
    let rejoin: (() => void) | undefined;
    const active = () => generation.current === run && !controller.signal.aborted;
    const params = JSON.parse(contextKey) as GameChatContext;
    const identity = `${userId}:${roomId}`;
    const identityChanged = identityRef.current !== identity;
    identityRef.current = identity;
    if (identityChanged) { blockedIds.current.clear(); deletedIds.current.clear(); verifiedIdentityRef.current = ""; recentSendRef.current = null; }
    sendInFlight.current.clear();
    reactionInFlight.current.clear();
    setIsReady(false);
    setUserCount(0);
    setMessages((rows) => identityChanged ? [] : rows.map((row) => row.delivery === "pending" ?
      { ...row, delivery: "failed", error: "Connection changed before delivery was confirmed. Tap to retry." } : row));
    setError(null);

    const sync = async (catchUp = false) => {
      if (!userId || !active() || refreshing) return;
      refreshing = true;
      const startedAt = Date.now();
      try {
        if (catchUp) {
          const last = messagesRef.current.filter((row) => row.delivery === "sent").at(-1);
          let cursor = last ? last.cursor ?? `${new Date(last.time).toISOString()}|${last.id}` : undefined;
          // Replay missed events with a stable (time, ID) cursor, then reconcile the visible window.
          for (let page = 0; cursor && page < 5; page += 1) {
            const missed = await apiClient.get<GameChatHistoryResponse>(`/api/game-chat/${encodeURIComponent(roomId)}/messages`, {
              params: { ...params, limit: 100, after: cursor }, signal: controller.signal,
            });
            if (!active() || missed.data.viewerUserId !== userId) return;
            missed.data.messages.forEach(upsert);
            if (!missed.data.hasMore || missed.data.nextCursor === cursor) break;
            cursor = missed.data.nextCursor;
          }
        }
        const response = await apiClient.get<GameChatHistoryResponse>(`/api/game-chat/${encodeURIComponent(roomId)}/messages`, {
          params: { ...params, limit: 300 }, signal: controller.signal,
        });
        if (!active()) return;
        if (response.data.viewerUserId !== userId) throw new Error("Chat account changed");
        verifiedIdentityRef.current = identity;
        const server = response.data.messages.map(normalizeMessage).filter((row): row is ChatMessageItem =>
          row !== null && !deletedIds.current.has(row.id) && String(row.gameId) === roomId && (!row.senderId || !blockedIds.current.has(row.senderId)))
          .map((row) => ({ ...row, delivery: "sent" as const }));
        const drafts = restoredDrafts;
        restoredDrafts = [];
        setMessages((local) => reconcileChatSnapshot(server, [...local, ...drafts], startedAt));
      } catch (failure) {
        if (active()) {
          if (isAxiosError(failure) && [401, 403].includes(failure.response?.status ?? 0)) { joined = false; setIsReady(false); }
          setError(isAxiosError(failure) && typeof failure.response?.data?.error === "string" ? failure.response.data.error :
            failure instanceof Error ? failure.message : "Unable to load chat");
        }
        throw failure;
      } finally { refreshing = false; }
    };
    syncRef.current = sync;

    const start = async () => {
      if (!userId || !SOCKET_URL || starting) return;
      starting = true;
      try {
        const keys = await AsyncStorage.getAllKeys();
        if (!active()) return;
        const legacyKeys = keys.filter((key) => key.startsWith("chat_"));
        if (legacyKeys.length) await AsyncStorage.multiRemove(legacyKeys);
        const saved = await AsyncStorage.getItem(chatCacheKey(userId, roomId));
        if (!active()) return;
        if (saved) {
          const cache: unknown = JSON.parse(saved);
          if (cache && typeof cache === "object" && "savedAt" in cache && "messages" in cache &&
              typeof cache.savedAt === "number" && Date.now() - cache.savedAt < CHAT_CACHE_TTL_MS && Array.isArray(cache.messages)) {
            // Persist only the account's own unconfirmed sends, never server history.
            restoredDrafts = cache.messages.filter((entry) => entry && typeof entry === "object" &&
              (entry.delivery === "pending" || entry.delivery === "failed"))
              .map(normalizeMessage).filter((row): row is ChatMessageItem => row !== null && row.senderId === userId &&
                Boolean(row.clientId) && String(row.gameId) === roomId)
              .map((row) => ({ ...row, delivery: "failed", error: "Delivery was not confirmed. Tap to retry." }));
          }
        }
      } catch { /* A corrupt cache never prevents loading server history. */ }
      try {
        await sync(); // The shared API client refreshes expired credentials first.
        if (!active()) return;
        socket = io(SOCKET_URL, {
          autoConnect: false, forceNew: true, transports: ["websocket", "polling"], reconnection: true,
          auth: (callback) => { void getAccessToken().then((token) => callback({ token })).catch(() => callback({ token: null })); },
        });
        socketRef.current = socket;
        const join = () => {
          if (joining || !socket?.connected) return;
          joining = true;
          socket.timeout(ACK_TIMEOUT).emit("joinGame", { ...params, gameId: roomId }, (timeout: Error | null, response?: { ok: boolean; error?: string }) => {
            joining = false;
            if (!active()) return;
            joined = !timeout && response?.ok === true;
            setIsReady(joined);
            setError(timeout ? "Unable to join chat. Reconnecting…" : response?.ok ? null : response?.error ?? "Unable to join chat");
            if (!timeout && response?.ok) void sync(true).catch(() => {});
          });
        };
        socket.on("connect", join);
        rejoin = join;
        socket.on("disconnect", (reason) => {
          if (!active()) return;
          joined = false;
          joining = false;
          setIsReady(false);
          setError("Chat disconnected. Reconnecting…");
          // A server expiry disconnect needs an explicit reconnect after HTTP refresh.
          if (reason === "io server disconnect") void sync().then(() => { if (active()) socket?.connect(); }).catch(() => {});
        });
        socket.on("connect_error", () => {
          if (active()) { setIsReady(false); setError("Unable to connect to chat"); }
        });
        socket.on("receiveMessage", (message: IncomingChatMessage) => { if (active()) upsert(message); });
        socket.on("messageDeleted", (payload: { gameId: string; messageId: string }) => {
          if (active() && payload.gameId === roomId) {
            deletedIds.current.add(payload.messageId);
            setMessages((rows) => rows.filter((row) => row.id !== payload.messageId));
          }
        });
        socket.on("chatVisibilityChanged", (payload: { userIds: number[]; blocked: boolean }) => {
          if (!active()) return;
          const otherId = payload.userIds.find((id) => id !== userId);
          if (!otherId) return;
          if (payload.blocked) {
            blockedIds.current.add(otherId);
            setMessages((rows) => rows.filter((row) => row.senderId !== otherId));
          } else blockedIds.current.delete(otherId);
          void sync().catch(() => {});
        });
        socket.on("reactionUpdated", (update: GameChatReactionUpdate) => {
          if (active() && update.gameId === roomId) setMessages((rows) => rows.map((row) => row.id === update.messageId && (update.reactionVersion ?? 0) >= (row.reactionVersion ?? 0) ? { ...row, reactions: update.reactions, reactionVersion: update.reactionVersion } : row));
        });
        socket.on("userCount", (count: number) => { if (active()) setUserCount(count); });
        socket.connect();
      } catch { /* sync exposes the error, periodic sync retries startup. */ }
      finally { starting = false; }
    };
    void start();
    timer = setInterval(() => {
      if (AppState.currentState !== "active" || !active()) return;
      if (!socket) void start();
      else void sync().then(() => { if (active() && !socket?.connected) socket?.connect(); else if (active() && !joined) rejoin?.(); }).catch(() => {});
    }, 30_000);
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active" && active()) {
        if (!socket) void start();
        else void sync().then(() => { if (active() && !socket?.connected) socket?.connect(); else if (active() && !joined) rejoin?.(); }).catch(() => {});
      }
    });
    return () => {
      controller.abort();
      clearInterval(timer);
      appState.remove();
      socket?.removeAllListeners();
      socket?.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
      syncRef.current = null;
    };
  }, [roomId, userId, contextKey, sessionVersion, upsert]);

  useEffect(() => {
    if (!userId || verifiedIdentityRef.current !== `${userId}:${roomId}`) return;
    const run = generation.current;
    const timer = setTimeout(() => {
      if (run !== generation.current) return;
      const persisted = selectUnconfirmedChatMessages(messages, userId, roomId);
      void AsyncStorage.setItem(chatCacheKey(userId, roomId), JSON.stringify({ savedAt: Date.now(), messages: persisted }))
        .catch(() => {});
    }, 750);
    return () => clearTimeout(timer);
  }, [messages, userId, roomId, isReady]);

  const deliver = useCallback(async (message: ChatMessageItem): Promise<boolean> => {
    const socket = socketRef.current;
    if (!socket?.connected || !isReady || !message.clientId || sendInFlight.current.has(message.clientId)) return false;
    const run = generation.current;
    const clientId = message.clientId;
    sendInFlight.current.add(clientId);
    setMessages((rows) => boundedChatMessages([...rows.filter((row) => row.id !== message.id), { ...message, delivery: "pending", error: undefined }]));
    let response: SendGameChatMessageAck | undefined;
    try {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          response = await socket.timeout(ACK_TIMEOUT).emitWithAck("sendMessage", {
            gameId: roomId, clientId, text: message.message, gifUrl: message.gif_url,
          }) as SendGameChatMessageAck;
          break;
        } catch { if (!socket.connected || run !== generation.current) break; }
      }
      if (run !== generation.current) return false;
      if (response?.ok) { upsert(response.message); setError(null); return true; }
      const reason = response && !response.ok ? response.error : "Message delivery could not be confirmed. Tap to retry.";
      setMessages((rows) => rows.map((row) => row.clientId === clientId ? { ...row, delivery: "failed", error: reason } : row));
      setError(reason);
      return false;
    } finally { sendInFlight.current.delete(clientId); }
  }, [isReady, roomId, upsert]);

  const sendMessage = useCallback((input: ChatSendPayload): boolean => {
    const payload = buildChatPayload(input.text ?? "", input.gifUrl);
    if (!payload || !userId || !isReady || !socketRef.current?.connected) return false;
    const message = createClientMessage(payload, { userName: currentUserName, profileImage: normalizeProfileImage(user?.profile_image), gameId: roomId });
    if (!message) return false;
    const now = Date.now();
    const key = createSendPayloadKey(payload);
    if (recentSendRef.current?.key === key && now - recentSendRef.current.time < 800) return false;
    recentSendRef.current = { key, time: now };
    void deliver({ ...message, senderId: userId, delivery: "pending" });
    return true;
  }, [userId, isReady, currentUserName, user?.profile_image, roomId, deliver]);

  const retryMessage = useCallback((id: string) => {
    const message = messagesRef.current.find((row) => row.id === id && row.delivery === "failed");
    if (message) void deliver(message);
  }, [deliver]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    const socket = socketRef.current;
    const message = messagesRef.current.find((row) => row.id === messageId);
    const key = `${messageId}:${emoji}`;
    if (!socket?.connected || !isReady || !message || message.delivery !== "sent" || !CHAT_EMOJIS.includes(emoji) || reactionInFlight.current.has(key)) return;
    const run = generation.current;
    reactionInFlight.current.add(key);
    try {
      const active = !(message.reactions?.[emoji] ?? []).includes(String(userId));
      const response = await socket.timeout(ACK_TIMEOUT).emitWithAck("toggleReaction", { gameId: roomId, messageId, emoji, active }) as ToggleGameChatReactionAck;
      if (run !== generation.current) return;
      if (!response.ok) throw new Error(response.error);
      setMessages((rows) => rows.map((row) => row.id === messageId && (response.reactionVersion ?? 0) >= (row.reactionVersion ?? 0) ? { ...row, reactions: response.reactions, reactionVersion: response.reactionVersion } : row));
    } catch (failure) {
      if (run === generation.current) { setError(failure instanceof Error ? failure.message : "Unable to update reaction"); void syncRef.current?.().catch(() => {}); }
    } finally { reactionInFlight.current.delete(key); }
  }, [isReady, roomId, userId]);

  const hideBlockedUser = useCallback((id: number) => {
    blockedIds.current.add(id);
    setMessages((rows) => rows.filter((row) => row.senderId !== id));
    void syncRef.current?.().catch(() => {});
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    const run = generation.current;
    try {
      await apiClient.delete(`/api/game-chat/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(id)}`, { params: JSON.parse(contextKey) });
      if (generation.current === run) { deletedIds.current.add(id); setMessages((rows) => rows.filter((row) => row.id !== id)); }
    } catch { if (generation.current === run) setError("Unable to delete message"); }
  }, [roomId, contextKey]);

  return { messages, userCount, currentUserName, currentUserId: userId, isReady, error, sendMessage, retryMessage, deleteMessage, addReaction, hideBlockedUser };
}
