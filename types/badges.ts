export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export type BadgeCategory =
  | "posting"
  | "likes"
  | "comments"
  | "shares"
  | "community";

export type BadgeMetric =
  | "postsCreated"
  | "likesReceived"
  | "commentsReceived"
  | "sharesReceived"
  | "totalEngagement";

export type BadgeFilter = "all" | "earned" | "locked";

export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  metric: BadgeMetric;
  tier: BadgeTier;
  threshold: number;
  symbol: string;
  sortOrder: number;
};

export type EarnedBadgeRecord = {
  badgeId: string;
  earnedAt: string | null;
};

export type NewlyAwardedBadge = {
  badgeId: string;
  name: string;
  tier: BadgeTier;
  earnedAt: string | null;
};

export type BadgeNotificationBadge = {
  badgeId: string;
  name: string;
  description: string;
  category: BadgeCategory;
  metric: BadgeMetric;
  tier: BadgeTier;
  threshold: number;
  symbol: string;
  earnedAt: string | null;
};

export type BadgeNotification = {
  notificationId: string;
  userId: number;
  badge: BadgeNotificationBadge;
  createdAt: string;
};

export type BadgeEarnedSocketPayload = {
  recipientUserId: number;
  notifications: BadgeNotification[];
  emittedAt: string;
};

export type UserForumStats = {
  postsCreated: number;
  likesReceived: number;
  commentsReceived: number;
  sharesReceived: number;
};

export type BadgeApiResponse = {
  stats: UserForumStats;
  earnedBadges: EarnedBadgeRecord[];
};

export type BadgeAwardResponse = {
  newlyAwardedBadges?: NewlyAwardedBadge[];
};

export type BadgeMutationResponse = BadgeAwardResponse;

export type ForumPostCreateResponse<TPost = unknown, TPoll = unknown> =
  BadgeMutationResponse & {
    post: TPost;
    poll?: TPoll | null;
  };

export type ForumCommentCreateResponse<TComment = unknown> =
  BadgeMutationResponse & {
    message?: string;
    comment: TComment;
  };

export type ForumLikeMutationResponse<TPost = unknown> =
  BadgeMutationResponse & {
    post: TPost;
    didChangeLike: boolean;
  };

export type ForumShareMutationResponse<TPost = unknown> =
  BadgeMutationResponse & {
    post: TPost;
    didCreateShare: boolean;
  };

export type ForumDeleteMutationResponse<TDeleted = unknown> = {
  message?: string;
  comment?: TDeleted;
};

export type BadgeProgress = BadgeDefinition & {
  currentValue: number;
  progressPercent: number;
  remaining: number;
  isEarned: boolean;
  earnedAt: string | null;
};

export type BadgeSummary = {
  earnedCount: number;
  totalCount: number;
  completionPercent: number;
};
