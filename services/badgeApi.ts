import { isAxiosError } from "axios";
import { apiClient } from "@/utils/apiClient";
import type {
  BadgeApiResponse,
  BadgeCategory,
  BadgeMetric,
  BadgeNotification,
  BadgeNotificationBadge,
  BadgeTier,
  EarnedBadgeRecord,
  UserForumStats,
} from "@/types/badges";

export const EMPTY_BADGE_STATS: UserForumStats = {
  postsCreated: 0,
  likesReceived: 0,
  commentsReceived: 0,
  sharesReceived: 0,
};

export const EMPTY_BADGE_RESPONSE: BadgeApiResponse = {
  stats: EMPTY_BADGE_STATS,
  earnedBadges: [],
};

type BadgeErrorPayload = {
  error?: string;
  message?: string;
};

const BADGE_CATEGORIES: BadgeCategory[] = [
  "posting",
  "likes",
  "comments",
  "shares",
  "community",
];

const BADGE_METRICS: BadgeMetric[] = [
  "postsCreated",
  "likesReceived",
  "commentsReceived",
  "sharesReceived",
  "totalEngagement",
];

const BADGE_METRIC_ALIASES: Record<string, BadgeMetric> = {
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

const BADGE_TIERS: BadgeTier[] = ["bronze", "silver", "gold", "platinum"];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const toSafeNumber = (value: unknown): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const normalizeStats = (value: unknown): UserForumStats => {
  if (!isRecord(value)) {
    return { ...EMPTY_BADGE_STATS };
  }

  return {
    postsCreated: toSafeNumber(value.postsCreated),
    likesReceived: toSafeNumber(value.likesReceived),
    commentsReceived: toSafeNumber(value.commentsReceived),
    sharesReceived: toSafeNumber(value.sharesReceived),
  };
};

const normalizeEarnedBadge = (value: unknown): EarnedBadgeRecord | null => {
  if (!isRecord(value) || typeof value.badgeId !== "string") {
    return null;
  }

  return {
    badgeId: value.badgeId,
    earnedAt: typeof value.earnedAt === "string" ? value.earnedAt : "",
  };
};

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const normalized = String(value).trim();

  return normalized.length > 0 ? normalized : null;
};

const normalizeIsoString = (value: unknown): string | null => {
  return typeof value === "string" ? value : null;
};

const normalizeMetric = (value: unknown): BadgeMetric | null => {
  if (typeof value !== "string") return null;

  return BADGE_METRIC_ALIASES[value.trim()] ?? null;
};

const normalizeNotificationBadge = (
  value: unknown,
): BadgeNotificationBadge | null => {
  if (!isRecord(value)) return null;

  const badgeId = normalizeString(value.badgeId ?? value.badge_id);
  const name = normalizeString(value.name);
  const description =
    normalizeString(value.description) ?? "You unlocked a new badge.";
  const category =
    typeof value.category === "string" &&
    BADGE_CATEGORIES.includes(value.category as BadgeCategory)
      ? (value.category as BadgeCategory)
      : "community";
  const metric = normalizeMetric(value.metric) ?? "totalEngagement";
  const tier =
    typeof value.tier === "string" &&
    BADGE_TIERS.includes(value.tier as BadgeTier)
      ? (value.tier as BadgeTier)
      : null;
  const threshold = Number(value.threshold);
  const symbol = normalizeString(value.symbol) ?? "🏆";
  const rawEarnedAt = value.earnedAt ?? value.earned_at;
  const earnedAt =
    typeof rawEarnedAt === "string" || rawEarnedAt === null
      ? rawEarnedAt
      : null;

  if (
    !badgeId ||
    !name ||
    !tier ||
    !BADGE_METRICS.includes(metric)
  ) {
    return null;
  }

  return {
    badgeId,
    name,
    description,
    category,
    metric,
    tier,
    threshold: Number.isFinite(threshold) && threshold > 0 ? threshold : 1,
    symbol,
    earnedAt,
  };
};

export const normalizeBadgeNotification = (
  value: unknown,
): BadgeNotification | null => {
  if (!isRecord(value)) return null;

  const notificationId = normalizeString(
    value.notificationId ?? value.notification_id ?? value.id,
  );
  const userId = Number(value.userId ?? value.user_id);
  const badge = normalizeNotificationBadge(
    isRecord(value.badge) ? value.badge : value,
  );
  const rawCreatedAt = value.createdAt ?? value.created_at;
  const createdAt =
    normalizeIsoString(rawCreatedAt) ??
    badge?.earnedAt ??
    new Date().toISOString();

  if (
    !notificationId ||
    !Number.isInteger(userId) ||
    userId <= 0 ||
    !badge ||
    !createdAt
  ) {
    return null;
  }

  return {
    notificationId,
    userId,
    badge,
    createdAt,
  };
};

export const normalizeBadgeNotifications = (
  value: unknown,
): BadgeNotification[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((notification) => {
    const normalized = normalizeBadgeNotification(notification);
    return normalized ? [normalized] : [];
  });
};

export function normalizeBadgeOverview(value: unknown): BadgeApiResponse {
  if (!isRecord(value)) {
    return { ...EMPTY_BADGE_RESPONSE, stats: { ...EMPTY_BADGE_STATS } };
  }

  const earnedBadges = Array.isArray(value.earnedBadges)
    ? value.earnedBadges.flatMap((record) => {
        const normalized = normalizeEarnedBadge(record);
        return normalized ? [normalized] : [];
      })
    : [];

  return {
    stats: normalizeStats(value.stats),
    earnedBadges,
  };
}

export function getBadgeApiErrorMessage(
  error: unknown,
  fallback = "Failed to load badges",
): string {
  if (isAxiosError<BadgeErrorPayload>(error)) {
    if (error.response?.status === 404) {
      return "User badge profile not found";
    }

    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export async function getMyBadges(): Promise<BadgeApiResponse> {
  const response = await apiClient.get<unknown>("/api/badges/me");

  return normalizeBadgeOverview(response.data);
}

export async function getUserBadges(
  userId: number | string,
): Promise<BadgeApiResponse> {
  const response = await apiClient.get<unknown>(
    `/api/badges/user/${encodeURIComponent(String(userId))}`,
  );

  return normalizeBadgeOverview(response.data);
}

export async function getPendingBadgeNotifications(): Promise<
  BadgeNotification[]
> {
  const response = await apiClient.get<unknown>(
    "/api/badges/notifications/pending",
  );

  const notifications = isRecord(response.data)
    ? response.data.notifications
    : [];

  return normalizeBadgeNotifications(notifications);
}

export async function markBadgeNotificationsRead(
  notificationIds: string[],
): Promise<string[]> {
  const normalizedIds = notificationIds
    .map((notificationId) => notificationId.trim())
    .filter(Boolean);

  if (!normalizedIds.length) return [];

  const response = await apiClient.post<unknown>(
    "/api/badges/notifications/read",
    {
      notificationIds: normalizedIds,
    },
  );

  if (!isRecord(response.data) || !Array.isArray(response.data.notificationIds)) {
    return [];
  }

  return response.data.notificationIds.flatMap((notificationId) => {
    const normalizedId = normalizeString(notificationId);

    return normalizedId ? [normalizedId] : [];
  });
}
