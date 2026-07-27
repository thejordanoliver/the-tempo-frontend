import { useCallback } from "react";
import { useBadgeNotificationStore } from "@/store/badgeNotificationStore";
import type { NewlyAwardedBadge } from "@/types/badges";

export function useBadgeNotifications() {
  const requestBadgeRefresh = useBadgeNotificationStore(
    (state) => state.requestBadgeRefresh,
  );

  const handleBadgeAwards = useCallback(
    (badges?: NewlyAwardedBadge[] | null) => {
      if (badges?.length) {
        requestBadgeRefresh();
      }
    },
    [requestBadgeRefresh],
  );

  const requestBadgeDataRefresh = useCallback(() => {
    requestBadgeRefresh();
  }, [requestBadgeRefresh]);

  return {
    handleBadgeAwards,
    requestBadgeDataRefresh,
  };
}
