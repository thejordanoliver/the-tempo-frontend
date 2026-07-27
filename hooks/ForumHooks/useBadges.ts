import { BadgeApiResponse } from "@/types/badges";
import {
  buildBadgeProgress,
  getBadgeSummary,
} from "@/utils/badgeUtils";
import {
  EMPTY_BADGE_RESPONSE,
  getBadgeApiErrorMessage,
  getMyBadges,
  getUserBadges,
} from "@/services/badgeApi";
import { useBadgeNotificationStore } from "@/store/badgeNotificationStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseBadgesOptions = {
  userId?: number | string | null;
  enabled?: boolean;
};

const getEarnedSortValue = (earnedAt: string | null): number => {
  if (!earnedAt) return Number.NEGATIVE_INFINITY;

  const timestamp = new Date(earnedAt).getTime();

  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
};

export function useBadges(options: UseBadgesOptions = {}) {
  const { userId = null, enabled = true } = options;
  const refreshVersion = useBadgeNotificationStore(
    (state) => state.refreshVersion,
  );

  const [badgeResponse, setBadgeResponse] =
    useState<BadgeApiResponse>(EMPTY_BADGE_RESPONSE);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestSequenceRef = useRef(0);
  const inFlightKeyRef = useRef<string | null>(null);

  const targetKey = userId == null ? "me" : String(userId);

  const loadBadges = useCallback(
    async (isRefresh = false) => {
      if (!enabled) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (inFlightKeyRef.current === targetKey) {
        return;
      }

      const sequence = requestSequenceRef.current + 1;
      requestSequenceRef.current = sequence;
      inFlightKeyRef.current = targetKey;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response =
          userId == null ? await getMyBadges() : await getUserBadges(userId);

        if (requestSequenceRef.current === sequence) {
          setBadgeResponse(response);
        }
      } catch (requestError) {
        if (requestSequenceRef.current === sequence) {
          setError(getBadgeApiErrorMessage(requestError));
        }
      } finally {
        if (requestSequenceRef.current === sequence) {
          setLoading(false);
          setRefreshing(false);
          inFlightKeyRef.current = null;
        }
      }
    },
    [enabled, targetKey, userId],
  );

  useEffect(() => {
    void loadBadges(false);

    return () => {
      requestSequenceRef.current += 1;
      inFlightKeyRef.current = null;
    };
  }, [loadBadges, refreshVersion]);

  const badges = useMemo(() => {
    return buildBadgeProgress(
      badgeResponse.stats,
      badgeResponse.earnedBadges,
    );
  }, [badgeResponse]);

  const earnedBadges = useMemo(() => {
    return badges.filter((badge) => badge.isEarned);
  }, [badges]);

  const lockedBadges = useMemo(() => {
    return badges.filter((badge) => !badge.isEarned);
  }, [badges]);

  const nextBadges = useMemo(() => {
    return [...lockedBadges]
      .sort((firstBadge, secondBadge) => {
        return (
          secondBadge.progressPercent -
          firstBadge.progressPercent
        );
      })
      .slice(0, 3);
  }, [lockedBadges]);

  const featuredBadges = useMemo(() => {
    const mostRecentEarned = [...earnedBadges]
      .sort((firstBadge, secondBadge) => {
        const firstDate = firstBadge.earnedAt
          ? getEarnedSortValue(firstBadge.earnedAt)
          : firstBadge.sortOrder;

        const secondDate = secondBadge.earnedAt
          ? getEarnedSortValue(secondBadge.earnedAt)
          : secondBadge.sortOrder;

        return secondDate - firstDate;
      })
      .slice(0, 2);

    return [...mostRecentEarned, ...nextBadges].slice(0, 3);
  }, [earnedBadges, nextBadges]);

  const summary = useMemo(() => {
    return getBadgeSummary(badges);
  }, [badges]);

  return {
    badges,
    earnedBadges,
    lockedBadges,
    nextBadges,
    featuredBadges,
    summary,
    stats: badgeResponse.stats,
    loading,
    refreshing,
    error,
    refresh: () => loadBadges(true),
    refetch: () => loadBadges(false),
  };
}
