import { create } from "zustand";
import type {
  BadgeCategory,
  BadgeMetric,
  BadgeNotification,
  BadgeTier,
} from "@/types/badges";

export type BadgeNotificationState = {
  currentNotification: BadgeNotification | null;
  queuedNotifications: BadgeNotification[];
  knownNotificationIds: string[];
  knownBadgeIds: string[];
  readRetryNotificationIds: string[];
  refreshVersion: number;
  enqueueNotifications: (
    notifications?: BadgeNotification[] | null,
  ) => void;
  dismissCurrentNotification: () => void;
  queueNotificationReadRetry: (
    notificationIds?: string[] | string | null,
  ) => void;
  consumeReadRetryNotificationIds: () => string[];
  clearBadgeNotifications: () => void;
  requestBadgeRefresh: () => void;
};

const VALID_CATEGORIES: BadgeCategory[] = [
  "posting",
  "likes",
  "comments",
  "shares",
  "community",
];

const VALID_METRICS: BadgeMetric[] = [
  "postsCreated",
  "likesReceived",
  "commentsReceived",
  "sharesReceived",
  "totalEngagement",
];

const METRIC_ALIASES: Record<string, BadgeMetric> = {
  postsCreated: "postsCreated",
  posts_created: "postsCreated",
  likesReceived: "likesReceived",
  likes_received: "likesReceived",
  commentsReceived: "commentsReceived",
  comments_received: "commentsReceived",
  sharesReceived: "sharesReceived",
  shares_received: "sharesReceived",
  totalEngagement: "totalEngagement",
  total_engagement: "totalEngagement",
};

const VALID_TIERS: BadgeTier[] = ["bronze", "silver", "gold", "platinum"];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const normalizeNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const normalized = String(value).trim();

  return normalized.length > 0 ? normalized : null;
};

const normalizeNotificationId = (value: unknown): string | null => {
  return normalizeNonEmptyString(value);
};

const normalizeMetric = (value: unknown): BadgeMetric | null => {
  if (typeof value !== "string") return null;

  return METRIC_ALIASES[value.trim()] ?? null;
};

const normalizeNotification = (
  notification: unknown,
): BadgeNotification | null => {
  if (!isRecord(notification)) {
    return null;
  }

  const notificationId = normalizeNotificationId(
    notification.notificationId ?? notification.notification_id ?? notification.id,
  );
  const userId = Number(notification.userId ?? notification.user_id);
  const badge = isRecord(notification.badge)
    ? notification.badge
    : notification;
  const rawCreatedAt = notification.createdAt ?? notification.created_at;
  const createdAt =
    typeof rawCreatedAt === "string"
      ? rawCreatedAt
      : null;

  const badgeId = normalizeNonEmptyString(badge.badgeId ?? badge.badge_id);
  const name = normalizeNonEmptyString(badge.name);
  const description =
    normalizeNonEmptyString(badge.description) ?? "You unlocked a new badge.";
  const category =
    typeof badge.category === "string" &&
    VALID_CATEGORIES.includes(badge.category as BadgeCategory)
      ? (badge.category as BadgeCategory)
      : "community";
  const metric = normalizeMetric(badge.metric) ?? "totalEngagement";
  const tier =
    typeof badge.tier === "string" &&
    VALID_TIERS.includes(badge.tier as BadgeTier)
      ? (badge.tier as BadgeTier)
      : null;
  const threshold = Number(badge.threshold);
  const symbol = normalizeNonEmptyString(badge.symbol) ?? "🏆";
  const rawEarnedAt = badge.earnedAt ?? badge.earned_at;
  const earnedAt =
    typeof rawEarnedAt === "string" || rawEarnedAt === null
      ? rawEarnedAt
      : null;
  const normalizedCreatedAt = createdAt ?? earnedAt ?? new Date().toISOString();

  if (
    !notificationId ||
    !Number.isInteger(userId) ||
    userId <= 0 ||
    !badgeId ||
    !name ||
    !tier ||
    !VALID_METRICS.includes(metric)
  ) {
    return null;
  }

  return {
    notificationId,
    userId,
    badge: {
      badgeId,
      name,
      description,
      category,
      metric,
      tier,
      threshold: Number.isFinite(threshold) && threshold > 0 ? threshold : 1,
      symbol,
      earnedAt,
    },
    createdAt: normalizedCreatedAt,
  };
};

const warnInvalidNotification = (notification: unknown) => {
  if (__DEV__) {
    console.warn("Ignoring malformed badge notification:", notification);
  }
};

export const useBadgeNotificationStore = create<BadgeNotificationState>(
  (set, get) => ({
    currentNotification: null,
    queuedNotifications: [],
    knownNotificationIds: [],
    knownBadgeIds: [],
    readRetryNotificationIds: [],
    refreshVersion: 0,

    enqueueNotifications: (notifications) => {
      if (__DEV__) {
        console.log("[BadgeStore] incoming", notifications);
      }

      if (!Array.isArray(notifications) || notifications.length === 0) return;

      set((state) => {
        if (__DEV__) {
          console.log("[BadgeStore] state before", state);
        }

        const knownNotificationIds = new Set([
          ...state.knownNotificationIds,
          ...(state.currentNotification
            ? [state.currentNotification.notificationId]
            : []),
          ...state.queuedNotifications.map(
            (notification) => notification.notificationId,
          ),
        ]);
        const knownBadgeIds = new Set([
          ...state.knownBadgeIds,
          ...(state.currentNotification
            ? [state.currentNotification.badge.badgeId]
            : []),
          ...state.queuedNotifications.map(
            (notification) => notification.badge.badgeId,
          ),
        ]);
        const validNewNotifications: BadgeNotification[] = [];

        notifications.forEach((notification) => {
          const normalizedNotification = normalizeNotification(notification);

          if (!normalizedNotification) {
            warnInvalidNotification(notification);
            return;
          }

          const { notificationId } = normalizedNotification;
          const { badgeId } = normalizedNotification.badge;

          if (
            knownNotificationIds.has(notificationId) ||
            knownBadgeIds.has(badgeId)
          ) {
            return;
          }

          knownNotificationIds.add(notificationId);
          knownBadgeIds.add(badgeId);
          validNewNotifications.push(normalizedNotification);
        });

        if (validNewNotifications.length === 0) {
          if (__DEV__) {
            console.log("[BadgeStore] state after", state);
          }

          return state;
        }

        const [nextCurrentNotification, ...remainingNotifications] =
          validNewNotifications;
        const nextKnownNotificationIds = [
          ...state.knownNotificationIds,
          ...validNewNotifications.map(
            (notification) => notification.notificationId,
          ),
        ];
        const nextKnownBadgeIds = [
          ...state.knownBadgeIds,
          ...validNewNotifications.map(
            (notification) => notification.badge.badgeId,
          ),
        ];

        const nextState = {
          currentNotification:
            state.currentNotification ?? nextCurrentNotification,
          queuedNotifications: state.currentNotification
            ? [...state.queuedNotifications, ...validNewNotifications]
            : [...state.queuedNotifications, ...remainingNotifications],
          knownNotificationIds: nextKnownNotificationIds,
          knownBadgeIds: nextKnownBadgeIds,
          refreshVersion: state.refreshVersion + 1,
        };

        if (__DEV__) {
          console.log("[BadgeStore] state after", nextState);
        }

        return nextState;
      });
    },

    dismissCurrentNotification: () => {
      set((state) => {
        const [nextCurrentNotification, ...remainingNotifications] =
          state.queuedNotifications;

        return {
          currentNotification: nextCurrentNotification ?? null,
          queuedNotifications: remainingNotifications,
        };
      });
    },

    queueNotificationReadRetry: (notificationIds) => {
      const ids = Array.isArray(notificationIds)
        ? notificationIds
        : notificationIds
          ? [notificationIds]
          : [];

      if (!ids.length) return;

      set((state) => {
        const knownIds = new Set(state.readRetryNotificationIds);
        const nextIds = [...state.readRetryNotificationIds];

        ids.forEach((notificationId) => {
          const normalizedId = normalizeNotificationId(notificationId);

          if (!normalizedId || knownIds.has(normalizedId)) {
            return;
          }

          knownIds.add(normalizedId);
          nextIds.push(normalizedId);
        });

        if (nextIds.length === state.readRetryNotificationIds.length) {
          return state;
        }

        return {
          readRetryNotificationIds: nextIds,
        };
      });
    },

    consumeReadRetryNotificationIds: () => {
      const retryIds = get().readRetryNotificationIds;

      if (!retryIds.length) return [];

      set({
        readRetryNotificationIds: [],
      });

      return retryIds;
    },

    clearBadgeNotifications: () => {
      set({
        currentNotification: null,
        queuedNotifications: [],
        knownNotificationIds: [],
        knownBadgeIds: [],
        readRetryNotificationIds: [],
        refreshVersion: 0,
      });
    },

    requestBadgeRefresh: () => {
      set((state) => ({
        refreshVersion: state.refreshVersion + 1,
      }));
    },
  }),
);

export const enqueueDebugBadgeNotification = () => {
  if (!__DEV__) return;

  useBadgeNotificationStore.getState().enqueueNotifications([
    {
      notificationId: `debug-${Date.now()}`,
      userId: 1,
      badge: {
        badgeId: "debug-badge",
        name: "Badge Test",
        description: "You unlocked a Tempo badge.",
        category: "community",
        metric: "totalEngagement",
        tier: "bronze",
        threshold: 1,
        symbol: "*",
        earnedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    },
  ]);
};
