import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  getPendingBadgeNotifications,
  markBadgeNotificationsRead,
} from "@/services/badgeApi";
import {
  disconnectNotificationSocket,
  getNotificationSocket,
} from "@/services/notificationSocket";
import { useBadgeNotificationStore } from "@/store/badgeNotificationStore";
import type {
  BadgeEarnedSocketPayload,
  BadgeNotification,
} from "@/types/badges";

type UseBadgeRealtimeNotificationsOptions = {
  token?: string | null;
  userId?: number | string | null;
};

type EnqueueNotifications = (
  notifications?: BadgeNotification[] | null,
) => void;

type RetryReadOptions = {
  consumeReadRetryNotificationIds: () => string[];
  queueNotificationReadRetry: (
    notificationIds?: string[] | string | null,
  ) => void;
  markRead?: typeof markBadgeNotificationsRead;
};

export const normalizeAuthenticatedUserId = (
  userId?: number | string | null,
): number | null => {
  const normalizedUserId = Number(userId);

  return Number.isInteger(normalizedUserId) && normalizedUserId > 0
    ? normalizedUserId
    : null;
};

export const isBadgeEarnedPayloadForUser = (
  payload: unknown,
  userId?: number | string | null,
): payload is BadgeEarnedSocketPayload => {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);

  return (
    normalizedUserId !== null &&
    typeof payload === "object" &&
    payload !== null &&
    "recipientUserId" in payload &&
    Number(payload.recipientUserId) === normalizedUserId &&
    "notifications" in payload &&
    Array.isArray(payload.notifications)
  );
};

export const handleBadgeEarnedSocketPayload = (
  payload: unknown,
  userId: number,
  enqueueNotifications: EnqueueNotifications,
) => {
  if (!isBadgeEarnedPayloadForUser(payload, userId)) {
    if (
      __DEV__ &&
      typeof payload === "object" &&
      payload !== null &&
      "recipientUserId" in payload
    ) {
      console.warn("[BadgeRealtimeHook] Ignored recipient mismatch", {
        payloadRecipientUserId: payload.recipientUserId,
        currentUserId: userId,
      });
    }

    return false;
  }

  enqueueNotifications(payload.notifications);

  return true;
};

export const loadPendingBadgeNotifications = async (
  enqueueNotifications: EnqueueNotifications,
  getPending: typeof getPendingBadgeNotifications = getPendingBadgeNotifications,
) => {
  const notifications = await getPending();

  enqueueNotifications(notifications);

  return notifications;
};

export const retryBadgeNotificationReadAcks = async ({
  consumeReadRetryNotificationIds,
  queueNotificationReadRetry,
  markRead = markBadgeNotificationsRead,
}: RetryReadOptions) => {
  const retryIds = consumeReadRetryNotificationIds();

  if (!retryIds.length) {
    return [];
  }

  try {
    const acknowledgedIds = await markRead(retryIds);
    const acknowledgedIdSet = new Set(acknowledgedIds);

    const unacknowledgedIds = retryIds.filter(
      (notificationId) => !acknowledgedIdSet.has(notificationId),
    );

    if (unacknowledgedIds.length) {
      queueNotificationReadRetry(unacknowledgedIds);
    }

    return acknowledgedIds;
  } catch (error) {
    queueNotificationReadRetry(retryIds);

    if (__DEV__) {
      console.warn(
        "[BadgeRealtimeHook] Failed to retry read acknowledgments",
        error,
      );
    }

    return [];
  }
};

export function useBadgeRealtimeNotifications({
  token,
  userId,
}: UseBadgeRealtimeNotificationsOptions = {}) {
  const previousUserIdRef = useRef<number | null>(null);
  const normalizedUserId = normalizeAuthenticatedUserId(userId);

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

      return;
    }

    const socket = getNotificationSocket(token);

    if (!socket) {
      return;
    }

    let isActive = true;
    let appState: AppStateStatus = AppState.currentState;

    const recoverPendingNotifications = async () => {
      try {
        const store = useBadgeNotificationStore.getState();

        await retryBadgeNotificationReadAcks({
          consumeReadRetryNotificationIds:
            store.consumeReadRetryNotificationIds,
          queueNotificationReadRetry: store.queueNotificationReadRetry,
        });

        await loadPendingBadgeNotifications((pendingNotifications) => {
          if (!isActive) {
            return;
          }

          useBadgeNotificationStore
            .getState()
            .enqueueNotifications(pendingNotifications);
        });
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "[BadgeRealtimeHook] Failed to recover pending notifications",
            error,
          );
        }
      }
    };

    const handleBadgeEarned = (payload: BadgeEarnedSocketPayload) => {
      handleBadgeEarnedSocketPayload(
        payload,
        normalizedUserId,
        useBadgeNotificationStore.getState().enqueueNotifications,
      );
    };

    const handleConnect = () => {
      void recoverPendingNotifications();
    };

    const handleConnectError = (error: Error) => {
      if (__DEV__) {
        console.warn("[BadgeRealtimeHook] Socket connection failed", {
          message: error.message,
        });
      }
    };

    const handleReconnect = () => {
      void recoverPendingNotifications();
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasBackgrounded =
        appState === "inactive" || appState === "background";

      appState = nextAppState;

      if (wasBackgrounded && nextAppState === "active") {
        void recoverPendingNotifications();
      }
    };

    socket.on("badge:earned", handleBadgeEarned);
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect", handleReconnect);

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    if (socket.connected) {
      void recoverPendingNotifications();
    } else {
      socket.connect();
    }

    return () => {
      isActive = false;

      socket.off("badge:earned", handleBadgeEarned);
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect", handleReconnect);

      appStateSubscription.remove();

      disconnectNotificationSocket(token);
    };
  }, [normalizedUserId, token]);
}