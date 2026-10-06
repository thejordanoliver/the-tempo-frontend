import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { fetchUserPredictionPicks } from "services/fanPredictionsApi";
import type { FanPredictionPicksResponse, FanPredictionSortOrder } from "types/fanPredictions";

export function useUserPredictionPicks(userId: number, sort: FanPredictionSortOrder = "newest") {
  const [state, setState] = useState<{ owner: number; sort: FanPredictionSortOrder; data: FanPredictionPicksResponse | null; loading: boolean; error: string | null }>({ owner: userId, sort, data: null, loading: true, error: null });
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(async (offset = 0) => {
    if (offset > 0 && controller.current) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setState(previous => ({ owner: userId, sort, data: previous.owner === userId ? (previous.sort === sort ? previous.data : previous.data ? { ...previous.data, picks: [], nextOffset: null } : null) : null, loading: true, error: null }));
    try {
      if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Invalid fan");
      const data = await fetchUserPredictionPicks(userId, offset, request.signal, sort);
      if (!request.signal.aborted) setState(previous => ({ owner: userId, sort, data: { ...data, picks: offset > 0 ? [...(previous.data?.picks ?? []), ...data.picks] : data.picks }, loading: false, error: null }));
    } catch {
      if (!request.signal.aborted) setState(previous => ({ ...previous, loading: false, error: "Couldn’t load these predictions. Please try again." }));
    } finally {
      if (controller.current === request) controller.current = null;
    }
  }, [userId, sort]);
  useFocusEffect(useCallback(() => {
    void load();
    return () => controller.current?.abort();
  }, [load]));
  const sameHistory = state.owner === userId && state.sort === sort;
  const data = sameHistory ? state.data : state.owner === userId && state.data ? { ...state.data, picks: [], nextOffset: null } : null;
  return { data, loading: !sameHistory || state.loading, error: sameHistory ? state.error : null,
    refresh: () => { void load(); },
    loadMore: () => { if (data?.nextOffset != null) void load(data.nextOffset); } };
}
