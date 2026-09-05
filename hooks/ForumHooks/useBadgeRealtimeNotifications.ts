import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  getPendingBadgeNotifications,
  markBadgeNotificationsRead,
} from "@/services/badgeApi";
import {
  disconnectNotificationSocket,
  getNotificationSocket,
  type LikeNotificationSocketPayload,
  type NotificationSocket,
} from "@/services/notificationSocket";
import { useBadgeNotificationStore } from "@/store/badgeNotificationStore";
import type {
  BadgeEarnedSocketPayload,
  BadgeNotification,
} from "@/types/badges";
import { getAccessToken } from "@/utils/apiClient";
import {
  type NotificationCenterItem,
  useNotifications,
} from "@/contexts/NotificationContext";

type UseBadgeRealtimeNotificationsOptions = {
  token?: string | null;
  userId?: number | string | null;
};

type EnqueueNotifications = (
  notifications?: BadgeNotification[] | null,
) => void;

type AddCenterNotification = (notification: NotificationCenterItem) => void;

type RetryReadOptions = {
  consumeReadRetryNotificationIds: () => string[];
  queueNotificationReadRetry: (
    notificationIds?: string[] | string | null,
  ) => void;
  markRead?: typeof markBadgeNotificationsRead;
};

type PrepareNotificationSocketAccessOptions = {
  token: string;
  recoverPendingNotifications: () => Promise<unknown>;
  getStoredAccessToken?: typeof getAccessToken;
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

export const isLikeNotificationPayloadForUser = (
  payload: unknown,
  userId?: number | string | null,
): payload is LikeNotificationSocketPayload => {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);

  if (
    normalizedUserId === null ||
    typeof payload !== "object" ||
    payload === null
  ) {
    return false;
  }

  const notification = payload as Record<string, unknown>;
  const actorUserId = normalizeAuthenticatedUserId(
    notification.actorUserId as number | string | null,
  );

  return (
    Number(notification.recipientUserId) === normalizedUserId &&
    actorUserId !== null &&
    actorUserId !== normalizedUserId &&
    typeof notification.id === "string" &&
    Boolean(notification.id.trim()) &&
    typeof notification.postId === "string" &&
    Boolean(notification.postId.trim()) &&
    typeof notification.actorUsername === "string" &&
    Boolean(notification.actorUsername.trim().replace(/^@+/, "")) &&
    typeof notification.createdAt === "string" &&
    Number.isFinite(Date.parse(notification.createdAt))
  );
};

export const handleLikeNotificationSocketPayload = (
  payload: unknown,
  userId: number,
  addCenterNotification: AddCenterNotification,
) => {
  if (!isLikeNotificationPayloadForUser(payload, userId)) {
    if (
      __DEV__ &&
      typeof payload === "object" &&
      payload !== null &&
      "recipientUserId" in payload
    ) {
      console.warn("[BadgeRealtimeHook] Ignored invalid like notification", {
        payloadRecipientUserId: payload.recipientUserId,
        currentUserId: userId,
      });
    }

    return false;
  }

  addCenterNotification({
    id: `like:${payload.id}`,
    type: "likes",
    title: "New Like",
    text: "",
    postId: payload.postId,
    userId: String(payload.actorUserId),
    actorUsername: payload.actorUsername,
    actorUsernames: [payload.actorUsername],
    actorUserIds: [String(payload.actorUserId)],
    likeCount: 1,
    readAt: null,
    createdAt: payload.createdAt,
  });

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

export const prepareNotificationSocketAccess = async ({
  token,
  recoverPendingNotifications,
  getStoredAccessToken = getAccessToken,
}: PrepareNotificationSocketAccessOptions): Promise<string | null> => {
  await recoverPendingNotifications();

  const latestToken = await getStoredAccessToken();

  return latestToken && latestToken === token ? latestToken : null;
};

export function useBadgeRealtimeNotifications({
  token,
  userId,
}: UseBadgeRealtimeNotificationsOptions = {}) {
  const { addCenterNotification } = useNotifications();
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

    let isActive = true;
    let appState: AppStateStatus = AppState.currentState;
    let activeSocket: NotificationSocket | null = null;
    let activeSocketToken: string | null = null;
    let hasLoggedConnectError = false;
    let appStateSubscription: ReturnType<
      typeof AppState.addEventListener
    > | null = null;

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

    const handleLikeNotification = (payload: LikeNotificationSocketPayload) => {
      const accepted = handleLikeNotificationSocketPayload(
        payload,
        normalizedUserId,
        addCenterNotification,
      );

      if (__DEV__) {
        console.log("[NotificationRealtime] like:new received", {
          accepted,
          recipientUserId: payload?.recipientUserId,
          actorUserId: payload?.actorUserId,
          postId: payload?.postId,
        });
      }
    };

    const handleConnect = () => {
      hasLoggedConnectError = false;

      if (__DEV__) {
        console.log("[NotificationRealtime] socket connected", {
          socketId: activeSocket?.id,
          userId: normalizedUserId,
        });
      }

      void recoverPendingNotifications();
    };

    const handleNotificationsReady = (payload: { userId: number }) => {
      if (__DEV__) {
        console.log("[NotificationRealtime] recipient room ready", {
          socketId: activeSocket?.id,
          userId: payload.userId,
        });
      }
    };

    const handleDisconnect = (reason: string) => {
      if (__DEV__) {
        console.log("[NotificationRealtime] socket disconnected", {
          reason,
          userId: normalizedUserId,
        });
      }
    };

    const handleConnectError = (error: Error) => {
      if (__DEV__ && !hasLoggedConnectError) {
        hasLoggedConnectError = true;
        console.warn("[BadgeRealtimeHook] Socket connection failed", {
          message: error.message,
        });
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasBackgrounded =
        appState === "inactive" || appState === "background";

      appState = nextAppState;

      if (wasBackgrounded && nextAppState === "active") {
        void reconnectAfterForeground();
      }
    };

    const reconnectAfterForeground = async () => {
      const latestToken = await prepareNotificationSocketAccess({
        token,
        recoverPendingNotifications,
      });

      if (
        !isActive ||
        !latestToken ||
        latestToken !== activeSocketToken ||
        !activeSocket ||
        activeSocket.connected
      ) {
        return;
      }

      activeSocket.connect();
    };

    const initializeSocket = async () => {
      const latestToken = await prepareNotificationSocketAccess({
        token,
        // This authenticated request refreshes an expired persisted access token
        // before Socket.IO attempts its one-shot namespace authentication.
        recoverPendingNotifications,
      });

      if (!isActive || !latestToken) {
        return;
      }

      const socket = getNotificationSocket(latestToken);

      if (!socket) {
        return;
      }

      activeSocket = socket;
      activeSocketToken = latestToken;

      socket.on("badge:earned", handleBadgeEarned);
      socket.on("like:new", handleLikeNotification);
      socket.on("notifications:ready", handleNotificationsReady);
      socket.on("connect", handleConnect);
      socket.on("connect_error", handleConnectError);
      socket.on("disconnect", handleDisconnect);

      if (socket.connected) {
        void recoverPendingNotifications();
      } else {
        socket.connect();
      }
    };

    appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    void initializeSocket();

    return () => {
      isActive = false;

      activeSocket?.off("badge:earned", handleBadgeEarned);
      activeSocket?.off("like:new", handleLikeNotification);
      activeSocket?.off("notifications:ready", handleNotificationsReady);
      activeSocket?.off("connect", handleConnect);
      activeSocket?.off("connect_error", handleConnectError);
      activeSocket?.off("disconnect", handleDisconnect);

      appStateSubscription?.remove();

      disconnectNotificationSocket(activeSocketToken);
    };
  }, [addCenterNotification, normalizedUserId, token]);
}
