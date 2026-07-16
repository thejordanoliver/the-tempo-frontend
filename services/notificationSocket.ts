import { io, type Socket } from "socket.io-client";
import type { BadgeEarnedSocketPayload } from "@/types/badges";

const normalizeSocketBaseUrl = (value?: string) => {
  if (!value) return "";

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

export const getNotificationSocket = (token?: string | null) => {
  if (!token || !SOCKET_URL) return null;

  if (notificationSocket && activeToken === token) {
    if (!notificationSocket.connected) {
      notificationSocket.connect();
    }

    return notificationSocket;
  }

  notificationSocket?.disconnect();
  activeToken = token;

  const namespaceUrl = `${SOCKET_URL}/notifications`;

  if (__DEV__) {
    console.log("[BadgeSocket] creating socket", {
      socketUrl: SOCKET_URL,
      namespaceUrl,
      hasToken: Boolean(token),
      tokenLength: token.length,
    });
  }

  notificationSocket = io(namespaceUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
  });

  if (__DEV__) {
    notificationSocket.on("connect", () => {
      console.log("[BadgeSocket] connected", {
        socketId: notificationSocket?.id,
        namespace: namespaceUrl,
        transport: notificationSocket?.io.engine?.transport?.name,
      });
    });

    notificationSocket.on("disconnect", (reason) => {
      console.log("[BadgeSocket] disconnected", {
        socketId: notificationSocket?.id,
        namespace: namespaceUrl,
        reason,
      });
    });

    notificationSocket.on("connect_error", (error) => {
      console.log("[BadgeSocket] connect_error", {
        message: error.message,
        namespace: namespaceUrl,
      });
    });

    notificationSocket.io.on("reconnect_attempt", (attempt) => {
      console.log("[BadgeSocket] reconnect_attempt", {
        attempt,
        namespace: namespaceUrl,
      });
    });

    notificationSocket.io.on("reconnect", (attempt) => {
      console.log("[BadgeSocket] reconnect", {
        attempt,
        socketId: notificationSocket?.id,
        namespace: namespaceUrl,
        transport: notificationSocket?.io.engine?.transport?.name,
      });
    });
  }

  return notificationSocket;
};

export const disconnectNotificationSocket = (token?: string | null) => {
  if (token && activeToken !== token) return;

  notificationSocket?.disconnect();
  notificationSocket = null;
  activeToken = null;
};
