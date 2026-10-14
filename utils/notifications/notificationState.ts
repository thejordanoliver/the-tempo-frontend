import type { AppNotification } from "@/types/notifications";

const compareCanonicalIdsDescending = (first: string, second: string) => {
  if (/^\d+$/.test(first) && /^\d+$/.test(second)) {
    if (first.length !== second.length) return second.length - first.length;
    if (first === second) return 0;
    return second > first ? 1 : -1;
  }

  return second.localeCompare(first);
};

const sortNotifications = (notifications: AppNotification[]) =>
  [...notifications].sort((first, second) => {
    const timeDifference = Date.parse(second.createdAt) - Date.parse(first.createdAt);
    return timeDifference || compareCanonicalIdsDescending(first.id, second.id);
  });

export const mergeNotifications = (
  current: AppNotification[],
  incoming: AppNotification[],
) => {
  const byId = new Map(current.map((notification) => [notification.id, notification]));
  incoming.forEach((notification) => {
    const existing = byId.get(notification.id);
    if (!existing) {
      byId.set(notification.id, notification);
      return;
    }

    const incomingIsNewer =
      Date.parse(notification.updatedAt) >= Date.parse(existing.updatedAt);
    const merged = incomingIsNewer
      ? { ...existing, ...notification }
      : { ...notification, ...existing };

    // Read/archive transitions are monotonic; an older REST or socket payload
    // must never resurrect an unread or archived notification.
    byId.set(notification.id, {
      ...merged,
      readAt: notification.readAt ?? existing.readAt,
      archivedAt: notification.archivedAt ?? existing.archivedAt,
    });
  });
  return sortNotifications(Array.from(byId.values()));
};

export const isNotificationForSession = (
  notification: AppNotification,
  userId: number | null,
) =>
  Boolean(
    notification?.id &&
      !notification.archivedAt &&
      userId &&
      notification.recipientUserId === userId,
  );

export const reconcileHydratedUnreadCount = ({
  authoritativeCount,
  requestStartIds,
  hydratedPage,
  currentNotifications,
}: {
  authoritativeCount: number;
  requestStartIds: ReadonlySet<string>;
  hydratedPage: AppNotification[];
  currentNotifications: AppNotification[];
}) => {
  const pageIds = new Set(hydratedPage.map((notification) => notification.id));
  const unseenRealtimeUnread = currentNotifications.filter(
    (notification) =>
      !requestStartIds.has(notification.id) &&
      !pageIds.has(notification.id) &&
      !notification.readAt &&
      !notification.archivedAt,
  ).length;

  return Math.max(0, authoritativeCount) + unseenRealtimeUnread;
};
