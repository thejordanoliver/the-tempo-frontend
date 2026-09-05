import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { usePathname } from "expo-router";
import {
  getPendingBadgeNotifications,
  markBadgeNotificationsRead,
} from "@/services/badgeApi";
import {
  disconnectNotificationSocket,
  getNotificationSocket,
  type NotificationSocket,
} from "@/services/notificationSocket";
import { useBadgeNotificationStore } from "@/store/badgeNotificationStore";
import type {
  BadgeEarnedSocketPayload,
  BadgeNotification,
} from "@/types/badges";
import type { AppNotification } from "@/types/notifications";
import { getAccessToken } from "@/utils/apiClient";
import { useNotifications } from "@/contexts/NotificationContext";

type Options = {
  token?: string | null;
  userId?: number | string | null;
};

type RetryReadOptions = {
  consumeReadRetryNotificationIds: () => string[];
  queueNotificationReadRetry: (ids?: string[] | string | null) => void;
  markRead?: typeof markBadgeNotificationsRead;
};

export const normalizeAuthenticatedUserId = (
  userId?: number | string | null,
): number | null => {
  const normalized = Number(userId);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
};

export const isBadgeEarnedPayloadForUser = (
  payload: unknown,
  userId?: number | string | null,
): payload is BadgeEarnedSocketPayload => {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);
  return Boolean(
    normalizedUserId &&
      payload &&
      typeof payload === "object" &&
      "recipientUserId" in payload &&
      Number(payload.recipientUserId) === normalizedUserId &&
      "notifications" in payload &&
      Array.isArray(payload.notifications),
  );
};

export const handleBadgeEarnedSocketPayload = (
  payload: unknown,
  userId: number,
  enqueue: (notifications?: BadgeNotification[] | null) => void,
) => {
  if (!isBadgeEarnedPayloadForUser(payload, userId)) return false;
  enqueue(payload.notifications);
  return true;
};

export const loadPendingBadgeNotifications = async (
  enqueue: (notifications?: BadgeNotification[] | null) => void,
  getPending: typeof getPendingBadgeNotifications = getPendingBadgeNotifications,
) => {
  const notifications = await getPending();
  enqueue(notifications);
  return notifications;
};

export const retryBadgeNotificationReadAcks = async ({
  consumeReadRetryNotificationIds,
  queueNotificationReadRetry,
  markRead = markBadgeNotificationsRead,
}: RetryReadOptions) => {
  const ids = consumeReadRetryNotificationIds();
  if (!ids.length) return [];
  try {
    const acknowledgedIds = await markRead(ids);
    const acknowledged = new Set(acknowledgedIds);
    const retry = ids.filter((id) => !acknowledged.has(id));
    if (retry.length) queueNotificationReadRetry(retry);
    return acknowledgedIds;
  } catch {
    queueNotificationReadRetry(ids);
    return [];
  }
};

const isCanonicalNotificationForUser = (
  payload: unknown,
  userId: number,
): payload is AppNotification =>
  Boolean(
    payload &&
      typeof payload === "object" &&
      "id" in payload &&
      typeof payload.id === "string" &&
      "recipientUserId" in payload &&
      Number(payload.recipientUserId) === userId &&
      "type" in payload &&
      typeof payload.type === "string",
  );

const activeConversationFromPath = (pathname: string | null) => {
  const match = pathname?.match(/^\/messages\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
};

export function useBadgeRealtimeNotifications({ token, userId }: Options = {}) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const normalizedUserId = normalizeAuthenticatedUserId(userId);
  const previousUserIdRef = useRef<number | null>(null);
  const {
    initializeNotifications,
    refreshNotifications,
    mergeRealtimeNotification,
    applyRealtimeRead,
    applyRealtimeArchive,
    applyRealtimeUnreadCount,
    markConversationNotificationsRead,
    clearCenterNotifications,
  } = useNotifications();

  useEffect(() => {
    if (previousUserIdRef.current !== normalizedUserId) {
      useBadgeNotificationStore.getState().clearBadgeNotifications();
      previousUserIdRef.current = normalizedUserId;
    }
  }, [normalizedUserId]);

  useEffect(() => {
    if (!token || !normalizedUserId) {
      disconnectNotificationSocket();
      useBadgeNotificationStore.getState().clearBadgeNotifications();
      clearCenterNotifications();
      return;
    }

    let active = true;
    let appState: AppStateStatus = AppState.currentState;
    let socket: NotificationSocket | null = null;
    let socketToken: string | null = null;
    let initialHydration: Promise<boolean> | null = null;
    let hasConnected = false;

    const recoverBadges = async () => {
      const store = useBadgeNotificationStore.getState();
      await retryBadgeNotificationReadAcks({
        consumeReadRetryNotificationIds: store.consumeReadRetryNotificationIds,
        queueNotificationReadRetry: store.queueNotificationReadRetry,
      });
      await loadPendingBadgeNotifications((pending) => {
        if (active) useBadgeNotificationStore.getState().enqueueNotifications(pending);
      });
    };

    const handleBadgeEarned = (payload: BadgeEarnedSocketPayload) => {
      handleBadgeEarnedSocketPayload(
        payload,
        normalizedUserId,
        useBadgeNotificationStore.getState().enqueueNotifications,
      );
    };

    const handleNew = (payload: AppNotification) => {
      if (!isCanonicalNotificationForUser(payload, normalizedUserId)) return;
      const activeConversationId = activeConversationFromPath(pathnameRef.current);
      const conversationId = String(payload.data?.conversationId ?? "");
      const isOpenConversation =
        payload.type === "message" &&
        Boolean(activeConversationId) &&
        conversationId === activeConversationId;

      mergeRealtimeNotification(payload, { showBanner: !isOpenConversation });
      if (isOpenConversation) {
        void markConversationNotificationsRead(conversationId);
      }
    };

    const handleRead = (payload: AppNotification) => {
      if (isCanonicalNotificationForUser(payload, normalizedUserId)) {
        applyRealtimeRead(payload);
      }
    };

    const handleArchive = (payload: { id: string }) => {
      if (typeof payload?.id === "string") applyRealtimeArchive(payload.id);
    };

    const handleUnreadCount = (payload: { unreadCount: number }) => {
      applyRealtimeUnreadCount(Number(payload?.unreadCount));
    };

    const handleConnect = () => {
      const hydration = initialHydration;
      const isReconnect = hasConnected;
      hasConnected = true;
      void (hydration ? hydration.catch(() => false) : Promise.resolve()).then(
        () => Promise.all([
          refreshNotifications(),
          isReconnect ? recoverBadges() : Promise.resolve(),
        ]),
      );
    };

    const connect = async () => {
      // Begin REST catch-up first so the context accepts realtime events for
      // this user, then connect while hydration is in flight. The first socket
      // connection performs one post-connect catch-up to close the pre-connect
      // delivery gap; canonical IDs make both responses idempotent.
      initialHydration = initializeNotifications(normalizedUserId);
      const latestToken = await getAccessToken();
      if (!active || !latestToken || latestToken !== token) return;

      socketToken = latestToken;
      socket = getNotificationSocket(latestToken);
      if (!socket) return;
      socket.on("notification:new", handleNew);
      socket.on("notification:read", handleRead);
      socket.on("notification:archived", handleArchive);
      socket.on("notification:unread-count", handleUnreadCount);
      socket.on("badge:earned", handleBadgeEarned);
      socket.on("connect", handleConnect);
      if (!socket.connected) socket.connect();
      await Promise.all([initialHydration, recoverBadges()]);
    };

    const handleAppState = (nextState: AppStateStatus) => {
      const returning =
        (appState === "inactive" || appState === "background") && nextState === "active";
      appState = nextState;
      if (!returning) return;
      void Promise.all([refreshNotifications(), recoverBadges()]).then(async () => {
        const latestToken = await getAccessToken();
        if (active && latestToken === socketToken && socket && !socket.connected) {
          socket.connect();
        }
      });
    };

    const appStateSubscription = AppState.addEventListener("change", handleAppState);
    void connect();

    return () => {
      active = false;
      socket?.off("notification:new", handleNew);
      socket?.off("notification:read", handleRead);
      socket?.off("notification:archived", handleArchive);
      socket?.off("notification:unread-count", handleUnreadCount);
      socket?.off("badge:earned", handleBadgeEarned);
      socket?.off("connect", handleConnect);
      appStateSubscription.remove();
      disconnectNotificationSocket(socketToken);
    };
  }, [
    applyRealtimeArchive,
    applyRealtimeRead,
    applyRealtimeUnreadCount,
    clearCenterNotifications,
    initializeNotifications,
    markConversationNotificationsRead,
    mergeRealtimeNotification,
    normalizedUserId,
    refreshNotifications,
    token,
  ]);
}
