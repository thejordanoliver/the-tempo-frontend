import type { NotificationCenterItem } from "@/contexts/NotificationContext";

export const MAX_CENTER_NOTIFICATIONS = 250;

const sortCenterNotifications = (items: NotificationCenterItem[]) =>
  [...items].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  );

export const normalizeNotificationUsername = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/^@+/, "");

const usernameKey = (value: unknown) =>
  normalizeNotificationUsername(value).toLowerCase();

const uniqueIds = (values: unknown[]) =>
  Array.from(
    new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)),
  );

export const uniqueNotificationUsernames = (values: unknown[]) => {
  const seen = new Set<string>();

  return values.reduce<string[]>((usernames, value) => {
    const username = normalizeNotificationUsername(value);
    const key = usernameKey(username);

    if (!username || !key || seen.has(key)) {
      return usernames;
    }

    seen.add(key);
    usernames.push(username);

    return usernames;
  }, []);
};

const formatUsername = (value: string) => {
  const normalized = normalizeNotificationUsername(value);

  return normalized ? `@${normalized}` : "";
};

export const formatLikeNotificationText = (
  usernames: string[],
  likeCount: number,
) => {
  const normalizedUsernames = uniqueNotificationUsernames(usernames);

  if (normalizedUsernames.length === 0) {
    return likeCount === 1
      ? "Someone liked your post"
      : `${likeCount} people liked your post`;
  }

  const first = formatUsername(normalizedUsernames[0]);

  if (likeCount <= 1) {
    return `${first} liked your post`;
  }

  if (likeCount === 2 && normalizedUsernames.length >= 2) {
    return `${first} and ${formatUsername(normalizedUsernames[1])} liked your post`;
  }

  const second =
    normalizedUsernames.length >= 2
      ? formatUsername(normalizedUsernames[1])
      : null;

  if (second) {
    const others = Math.max(0, likeCount - 2);

    if (others > 0) {
      return `${first}, ${second} and ${others} ${others === 1 ? "other" : "others"} liked your post`;
    }

    return `${first} and ${second} liked your post`;
  }

  const others = Math.max(0, likeCount - 1);

  if (others > 0) {
    return `${first} and ${others} ${others === 1 ? "other" : "others"} liked your post`;
  }

  return `${first} liked your post`;
};

const normalizeLikeNotification = (
  notification: NotificationCenterItem,
): NotificationCenterItem => {
  const actorUsername =
    normalizeNotificationUsername(notification.actorUsername) || null;
  const actorUsernames = uniqueNotificationUsernames([
    ...(notification.actorUsernames ?? []),
    actorUsername,
  ]);
  const actorUserIds = uniqueIds([
    ...(notification.actorUserIds ?? []),
    notification.userId,
  ]);
  const likeCount = Math.max(1, notification.likeCount ?? 1);

  return {
    ...notification,
    title: likeCount === 1 ? "New Like" : `${likeCount} new likes`,
    text: formatLikeNotificationText(actorUsernames, likeCount),
    actorUsername,
    actorUsernames,
    actorUserIds,
    likeCount,
  };
};

export const addCenterNotificationToState = (
  current: NotificationCenterItem[],
  notification: NotificationCenterItem,
  maxNotifications = MAX_CENTER_NOTIFICATIONS,
): NotificationCenterItem[] => {
  if (!notification.id) {
    return current;
  }

  const existingIndex = current.findIndex(
    (item) => item.id === notification.id,
  );

  if (existingIndex >= 0 && notification.type === "likes") {
    return current;
  }

  if (existingIndex >= 0) {
    const next = current.map((item, index) =>
      index === existingIndex
        ? {
            ...item,
            ...notification,
            readAt: notification.readAt ?? item.readAt,
          }
        : item,
    );

    return sortCenterNotifications(next).slice(0, maxNotifications);
  }

  if (
    notification.type === "messages" &&
    notification.conversationId &&
    notification.senderUsername &&
    !notification.readAt
  ) {
    const groupedIndex = current.findIndex(
      (item) =>
        item.type === "messages" &&
        !item.readAt &&
        item.conversationId === notification.conversationId &&
        item.senderUsername === notification.senderUsername,
    );

    if (groupedIndex >= 0) {
      const existing = current[groupedIndex];
      const messageCount =
        (existing.messageCount ?? 1) + (notification.messageCount ?? 1);
      const senderLabel = notification.senderUsername.startsWith("@")
        ? notification.senderUsername
        : `@${notification.senderUsername}`;

      const next = current.map((item, index) =>
        index === groupedIndex
          ? {
              ...existing,
              title: `${messageCount} new messages`,
              text: senderLabel,
              senderUsername: notification.senderUsername,
              messageCount,
              createdAt: notification.createdAt,
              readAt: null,
            }
          : item,
      );

      return sortCenterNotifications(next).slice(0, maxNotifications);
    }
  }

  if (
    notification.type === "likes" &&
    notification.postId != null &&
    !notification.readAt
  ) {
    const actorUsername = normalizeNotificationUsername(
      notification.actorUsername,
    );
    const groupedIndex = current.findIndex(
      (item) =>
        item.type === "likes" &&
        !item.readAt &&
        String(item.postId ?? "") === String(notification.postId),
    );

    if (groupedIndex >= 0) {
      const existing = current[groupedIndex];
      const existingActorUsernames = uniqueNotificationUsernames([
        ...(existing.actorUsernames ?? []),
        existing.actorUsername,
      ]);
      const existingActorUserIds = uniqueIds([
        ...(existing.actorUserIds ?? []),
        existing.userId,
      ]);
      const actorUserId = String(notification.userId ?? "").trim();
      const actorAlreadyIncluded = actorUserId
        ? existingActorUserIds.includes(actorUserId)
        : Boolean(
            actorUsername &&
              existingActorUsernames.some(
                (username) =>
                  usernameKey(username) === usernameKey(actorUsername),
              ),
          );

      if (actorAlreadyIncluded) {
        return current;
      }

      const actorUsernames = uniqueNotificationUsernames([
        ...existingActorUsernames,
        actorUsername,
      ]);
      const actorUserIds = uniqueIds([
        ...existingActorUserIds,
        actorUserId,
      ]);
      const likeCount =
        (existing.likeCount ?? 1) + (notification.likeCount ?? 1);

      const next = current.map((item, index) =>
        index === groupedIndex
          ? {
              ...existing,
              title: likeCount === 1 ? "New Like" : `${likeCount} new likes`,
              text: formatLikeNotificationText(actorUsernames, likeCount),
              actorUsername:
                actorUsername ||
                existing.actorUsername ||
                actorUsernames[0] ||
                null,
              actorUsernames,
              actorUserIds,
              likeCount,
              createdAt: notification.createdAt,
              readAt: null,
            }
          : item,
      );

      return sortCenterNotifications(next).slice(0, maxNotifications);
    }
  }

  const normalizedNotification: NotificationCenterItem = {
    ...notification,
    messageCount:
      notification.type === "messages"
        ? (notification.messageCount ?? 1)
        : notification.messageCount,
  };

  const nextNotification =
    normalizedNotification.type === "likes"
      ? normalizeLikeNotification(normalizedNotification)
      : normalizedNotification;

  return sortCenterNotifications([nextNotification, ...current]).slice(
    0,
    maxNotifications,
  );
};

export const mergeCenterNotificationStates = (
  persisted: NotificationCenterItem[],
  inMemory: NotificationCenterItem[],
  maxNotifications = MAX_CENTER_NOTIFICATIONS,
): NotificationCenterItem[] =>
  inMemory.reduce(
    (merged, notification) =>
      addCenterNotificationToState(
        merged,
        notification,
        maxNotifications,
      ),
    sortCenterNotifications(persisted).slice(0, maxNotifications),
  );

export const getUnreadCenterNotificationCount = (
  notifications: NotificationCenterItem[],
) =>
  notifications.reduce((count, notification) => {
    if (notification.readAt) return count;

    if (notification.type === "messages") {
      return count + Math.max(1, notification.messageCount ?? 1);
    }

    if (notification.type === "likes") {
      return count + Math.max(1, notification.likeCount ?? 1);
    }

    return count + 1;
  }, 0);

export const getNotificationCenterHref = (
  notification: NotificationCenterItem,
): string | null => {
  switch (notification.type) {
    case "game":
      return notification.gameId != null && notification.sport
        ? `/game/${notification.sport}/${notification.gameId}`
        : null;

    case "messages":
      return notification.conversationId
        ? `/messages/${notification.conversationId}`
        : "/messages";

    case "likes":
    case "comments":
      return notification.postId != null
        ? `/post/${notification.postId}`
        : null;

    case "badges":
      return "/(tabs)/profile";

    case "followers":
      return notification.userId
        ? `/profile/${notification.userId}`
        : "/(tabs)/profile";

    default:
      return null;
  }
};
