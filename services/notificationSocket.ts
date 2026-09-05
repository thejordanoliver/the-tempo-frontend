import { io, type Socket } from "socket.io-client";
import type { BadgeEarnedSocketPayload } from "@/types/badges";

export type LikeNotificationSocketPayload = {
  id: string;
  recipientUserId: number;
  postId: string;
  actorUserId: number;
  actorUsername: string;
  createdAt: string;
};

const normalizeSocketBaseUrl = (value?: string) => {
  if (!value) {
    return "";
  }

  return value.replace(/\/+$/, "").replace(/\/api$/i, "");
};

const SOCKET_URL =
  normalizeSocketBaseUrl(process.env.EXPO_PUBLIC_SOCKET_URL) ||
  normalizeSocketBaseUrl(process.env.EXPO_PUBLIC_API_URL) ||
  "";

type NotificationServerEvents = {
  "badge:earned": (payload: BadgeEarnedSocketPayload) => void;
  "like:new": (payload: LikeNotificationSocketPayload) => void;
  "notifications:ready": (payload: { userId: number }) => void;
};

type NotificationClientEvents = {
  "notifications:join": (
    payload?: Record<string, never>,
    callback?: (response: { ok: boolean; userId?: number }) => void,
  ) => void;
};

export type NotificationSocket = Socket<
  NotificationServerEvents,
  NotificationClientEvents
>;

let notificationSocket: NotificationSocket | null = null;
let activeToken: string | null = null;

export const getNotificationSocket = (
  token?: string | null,
): NotificationSocket | null => {
  if (!token || !SOCKET_URL) {
    return null;
  }

  if (notificationSocket && activeToken === token) {
    return notificationSocket;
  }

  notificationSocket?.disconnect();

  activeToken = token;

  const namespaceUrl = `${SOCKET_URL}/notifications`;

  notificationSocket = io(namespaceUrl, {
    auth: {
      token,
    },
    // Expo Go can reject a direct WebSocket handshake on local networks even
    // when ordinary HTTP requests work. Start with polling, then upgrade to
    // WebSocket, and allow Engine.IO to try the next transport on failure.
    transports: ["polling", "websocket"],
    tryAllTransports: true,
    // The root realtime bridge attaches every listener before starting the
    // connection, so startup events cannot race listener registration.
    autoConnect: false,
    reconnection: true,
  });

  return notificationSocket;
};

export const disconnectNotificationSocket = (
  token?: string | null,
) => {
  if (token && activeToken !== token) {
    return;
  }

  notificationSocket?.disconnect();
  notificationSocket = null;
  activeToken = null;
};
