import { io, type Socket } from "socket.io-client";
import type { BadgeEarnedSocketPayload } from "@/types/badges";

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
    if (!notificationSocket.connected) {
      notificationSocket.connect();
    }

    return notificationSocket;
  }

  notificationSocket?.disconnect();

  activeToken = token;

  const namespaceUrl = `${SOCKET_URL}/notifications`;

  notificationSocket = io(namespaceUrl, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    autoConnect: true,
    // Keep this connection attempt one-shot. A later authenticated lifecycle
    // call can explicitly try again without Socket.IO retrying forever.
    reconnection: false,
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
