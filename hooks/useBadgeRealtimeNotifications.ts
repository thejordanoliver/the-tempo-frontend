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
import type { BadgeEarnedSocketPayload, BadgeNotification } from "@/types/badges";

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
      console.log("[BadgeRealtimeHook] ignored recipient mismatch", {
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

  if (!retryIds.length) return [];

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
      console.warn("Failed to retry badge notification read acknowledgments:", error);
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
    if (__DEV__) {
      console.log("[BadgeRealtimeHook] auth state", {
        hasToken: Boolean(token),
        userId,
      });
    }
  }, [token, userId]);

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

    if (!socket) return;

    let isActive = true;
    let appState: AppStateStatus = AppState.currentState;

    const recoverPendingNotifications = async (reason: string) => {
      try {
        await retryBadgeNotificationReadAcks({
          consumeReadRetryNotificationIds:
            useBadgeNotificationStore.getState()
              .consumeReadRetryNotificationIds,
          queueNotificationReadRetry:
            useBadgeNotificationStore.getState().queueNotificationReadRetry,
        });

        const notifications = await loadPendingBadgeNotifications(
          (pendingNotifications) => {
            if (isActive) {
              useBadgeNotificationStore
                .getState()
                .enqueueNotifications(pendingNotifications);
            }
          },
        );

        if (__DEV__) {
          console.log("[BadgeRealtimeHook] pending response", notifications);
          console.log("[BadgeSocket] pending", {
            reason,
            count: notifications.length,
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to recover badge notifications:", error);
        }
      }
    };

    const handleBadgeEarned = (payload: BadgeEarnedSocketPayload) => {
      if (__DEV__) {
        console.log("[BadgeRealtimeHook] badge:earned", payload);
      }

      handleBadgeEarnedSocketPayload(
        payload,
        normalizedUserId,
        useBadgeNotificationStore.getState().enqueueNotifications,
      );
    };

    const handleReady = (payload: { userId: number }) => {
      if (__DEV__) {
        console.log("[BadgeRealtimeHook] notifications:ready", payload);
      }
    };

    const handleConnect = () => {
      if (__DEV__) {
        console.log("[BadgeSocket] connected");
      }

      void recoverPendingNotifications("connect");
    };

    const handleDisconnect = (reason: string) => {
      if (__DEV__) {
        console.log("[BadgeRealtimeHook] disconnect", { reason });
      }
    };

    const handleConnectError = (error: Error) => {
      if (__DEV__) {
        console.log("[BadgeRealtimeHook] connect_error", {
          message: error.message,
        });
      }
    };

    const handleReconnect = () => {
      void recoverPendingNotifications("reconnect");
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasBackgrounded =
        appState === "inactive" || appState === "background";

      appState = nextAppState;

      if (wasBackgrounded && nextAppState === "active") {
        void recoverPendingNotifications("foreground");
      }
    };

    socket.on("badge:earned", handleBadgeEarned);
    socket.on("notifications:ready", handleReady);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect", handleReconnect);

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    if (socket.connected) {
      void recoverPendingNotifications("already-connected");
    } else {
      socket.connect();
    }

    return () => {
      isActive = false;
      socket.off("badge:earned", handleBadgeEarned);
      socket.off("notifications:ready", handleReady);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect", handleReconnect);
      appStateSubscription.remove();
      disconnectNotificationSocket(token);
    };
  }, [
    normalizedUserId,
    token,
  ]);
}
