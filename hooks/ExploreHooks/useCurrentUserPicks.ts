import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { fetchCurrentUserPicks } from "services/fanPredictionsApi";
import type { FanPredictionPicksResponse } from "types/fanPredictions";

export function useCurrentUserPicks() {
  const { userId } = useFavoriteTeamsContext();
  const [state, setState] = useState<{
    userId: number | null;
    data: FanPredictionPicksResponse | null;
    loading: boolean;
    error: string | null;
  }>({ userId: null, data: null, loading: true, error: null });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => { controller.current?.abort(); }, [userId]);
  const refresh = useCallback(async () => {
    controller.current?.abort();
    if (!userId) {
      setState({ userId: null, data: null, loading: false, error: null });
      return;
    }
    const request = new AbortController();
    controller.current = request;
    setState(previous => ({ userId, data: previous.userId === userId ? previous.data : null, loading: true, error: null }));
    try {
      const data = await fetchCurrentUserPicks(request.signal);
      if (!request.signal.aborted) setState({ userId, data, loading: false, error: null });
    } catch {
      if (!request.signal.aborted) setState(previous => ({ ...previous, loading: false, error: "Couldn’t load your picks." }));
    }
  }, [userId]);
  useFocusEffect(useCallback(() => {
    void refresh();
    const timer = setInterval(() => {
      if (AppState.currentState === "active") void refresh();
    }, 60_000);
    const subscription = AppState.addEventListener("change", next => {
      if (next === "active") void refresh();
    });
    return () => { clearInterval(timer); subscription.remove(); controller.current?.abort(); };
  }, [refresh]));
  const sameUser = state.userId === userId;
  return { data: sameUser ? state.data : null, loading: sameUser ? state.loading : true, error: sameUser ? state.error : null, refresh };
}
