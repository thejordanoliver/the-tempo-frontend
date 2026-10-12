import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { fetchUserPredictionPicks } from "services/fanPredictionsApi";
import type { FanPredictionPick, FanPredictionRanking } from "types/fanPredictions";

export function useProfilePredictions(userId: number | null) {
  const [state, setState] = useState<{
    owner: number | null;
    record: FanPredictionRanking | null;
    picks: FanPredictionPick[];
    loading: boolean;
    error: string | null;
  }>({ owner: null, record: null, picks: [], loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    if (!userId || !Number.isSafeInteger(userId) || userId <= 0) return;
    const request = new AbortController();
    setState(previous => ({ owner: userId, record: previous.owner === userId ? previous.record : null, picks: previous.owner === userId ? previous.picks : [], loading: true, error: null }));
    void fetchUserPredictionPicks(userId, 0, request.signal)
      .then(data => {
        if (!request.signal.aborted) setState({ owner: userId, record: data.record, picks: data.picks.slice(0, 6), loading: false, error: null });
      })
      .catch(() => {
        if (!request.signal.aborted) setState({ owner: userId, record: null, picks: [], loading: false, error: "Couldn’t load prediction stats." });
      });
    return () => request.abort();
  }, [userId, attempt]));
  return {
    record: state.owner === userId ? state.record : null,
    picks: state.owner === userId ? state.picks : [],
    loading: state.owner !== userId || state.loading,
    error: state.owner === userId ? state.error : null,
    refresh: () => setAttempt(value => value + 1),
  };
}
