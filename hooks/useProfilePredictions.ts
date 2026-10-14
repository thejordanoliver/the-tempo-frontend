import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { fetchUserPredictionPicks } from "services/fanPredictionsApi";
import type {
  FanPredictionPick,
  FanPredictionRanking,
} from "types/fanPredictions";

export function useProfilePredictions(userId: number | null) {
  const [state, setState] = useState<{
    owner: number | null;
    record: FanPredictionRanking | null;
    picks: FanPredictionPick[];
    loading: boolean;
    error: string | null;
  }>({ owner: null, record: null, picks: [], loading: true, error: null });
  const requestRef = useRef<AbortController | null>(null);
  const loadPredictions = useCallback(() => {
    if (!userId || !Number.isSafeInteger(userId) || userId <= 0) return;
    requestRef.current?.abort();
    const request = new AbortController();
    requestRef.current = request;
    setState((previous) => ({
      owner: userId,
      record: previous.owner === userId ? previous.record : null,
      picks: previous.owner === userId ? previous.picks : [],
      loading: true,
      error: null,
    }));
    void fetchUserPredictionPicks(userId, 0, request.signal)
      .then((data) => {
        if (!request.signal.aborted)
          setState({
            owner: userId,
            record: data.record,
            picks: data.picks.slice(0, 6),
            loading: false,
            error: null,
          });
      })
      .catch(() => {
        if (!request.signal.aborted)
          setState({
            owner: userId,
            record: null,
            picks: [],
            loading: false,
            error: "Couldn’t load prediction stats.",
          });
      });
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadPredictions();
      return () => {
        requestRef.current?.abort();
        requestRef.current = null;
      };
    }, [loadPredictions]),
  );

  const refresh = useCallback(() => {
    // A request controller exists only while this screen is focused.
    if (requestRef.current) loadPredictions();
  }, [loadPredictions]);

  return {
    record: state.owner === userId ? state.record : null,
    picks: state.owner === userId ? state.picks : [],
    loading: state.owner !== userId || state.loading,
    error: state.owner === userId ? state.error : null,
    refresh,
  };
}
