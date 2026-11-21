import { useUserPredictionPicks } from "hooks/useUserPredictionPicks";

export function useProfilePredictions(userId: number | null) {
  const { data, loading, error, refresh } = useUserPredictionPicks(userId ?? 0);

  return {
    record: data?.record ?? null,
    picks: data?.picks.slice(0, 6) ?? [],
    // Background updates must not replace a loaded profile with skeletons.
    loading: loading && data == null,
    error: data == null ? error : null,
    refresh,
  };
}
