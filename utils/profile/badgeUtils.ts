import { BADGE_DEFINITIONS } from "@/constants/badges";
import {
  BadgeProgress,
  BadgeSummary,
  EarnedBadgeRecord,
  UserForumStats,
} from "@/types/badges";

export function getTotalEngagement(stats: UserForumStats): number {
  return (
    stats.likesReceived +
    stats.commentsReceived +
    stats.sharesReceived
  );
}

export function getBadgeMetricValue(
  badge: BadgeProgress | (typeof BADGE_DEFINITIONS)[number],
  stats: UserForumStats,
): number {
  switch (badge.metric) {
    case "postsCreated":
      return stats.postsCreated;

    case "likesReceived":
      return stats.likesReceived;

    case "commentsReceived":
      return stats.commentsReceived;

    case "sharesReceived":
      return stats.sharesReceived;

    case "totalEngagement":
      return getTotalEngagement(stats);

    default:
      return 0;
  }
}

export function buildBadgeProgress(
  stats: UserForumStats,
  earnedBadgeRecords: EarnedBadgeRecord[],
): BadgeProgress[] {
  const earnedBadgeMap = new Map(
    earnedBadgeRecords.map((record) => [record.badgeId, record]),
  );

  return BADGE_DEFINITIONS.map((badge) => {
    const currentValue = getBadgeMetricValue(badge, stats);
    const earnedRecord = earnedBadgeMap.get(badge.id);

    const isEarned =
      Boolean(earnedRecord) || currentValue >= badge.threshold;

    const progressPercent = Math.min(
      (currentValue / badge.threshold) * 100,
      100,
    );

    return {
      ...badge,
      currentValue,
      progressPercent,
      remaining: Math.max(badge.threshold - currentValue, 0),
      isEarned,
      earnedAt: earnedRecord?.earnedAt ?? null,
    };
  }).sort((firstBadge, secondBadge) => {
    return firstBadge.sortOrder - secondBadge.sortOrder;
  });
}

export function getBadgeSummary(
  badges: BadgeProgress[],
): BadgeSummary {
  const earnedCount = badges.filter((badge) => badge.isEarned).length;
  const totalCount = badges.length;

  return {
    earnedCount,
    totalCount,
    completionPercent:
      totalCount > 0 ? (earnedCount / totalCount) * 100 : 0,
  };
}

export function formatBadgeNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(".0", "")}K`;
  }

  return value.toLocaleString();
}

export function capitalizeBadgeTier(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}