import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { fetchCurrentUserPicks } from "services/fanPredictionsApi";
import type { FanPredictionPicksResponse } from "types/fanPredictions";
import { subscribePredictionPicksChanged } from "services/predictionUpdates";
import { subscribeSportsLive } from "services/liveSportsSocket";

export function useCurrentUserPicks() {
  const { userId } = useFavoriteTeamsContext();
  const [state, setState] = useState<{
    userId: number | null;
    data: FanPredictionPicksResponse | null;
    loading: boolean;
    error: string | null;
  }>({ userId: null, data: null, loading: true, error: null });
  const controller = useRef<AbortController | null>(null);
  const refreshQueued = useRef(false);
  useEffect(() => { controller.current?.abort(); }, [userId]);
  const refresh = useCallback(async (): Promise<void> => {
    if (controller.current && !controller.current.signal.aborted) {
      refreshQueued.current = true;
      return;
    }
    refreshQueued.current = false;
    if (!userId) {
      setState({ userId: null, data: null, loading: false, error: null });
      return;
    }
    const request = new AbortController();
    controller.current = request;
    setState(previous => ({ userId, data: previous.userId === userId ? previous.data : null, loading: previous.userId !== userId || !previous.data, error: null }));
    try {
      const data = await fetchCurrentUserPicks(request.signal);
      if (!request.signal.aborted) setState({ userId, data, loading: false, error: null });
    } catch {
      if (!request.signal.aborted) setState(previous => ({ ...previous, loading: false, error: "Couldn’t load your picks." }));
    } finally {
      if (controller.current === request) controller.current = null;
      if (!request.signal.aborted && refreshQueued.current) void refresh();
    }
  }, [userId]);
  useFocusEffect(useCallback(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polling = false;
    const poll = async () => {
      if (disposed || polling || AppState.currentState !== "active" || !userId) return;
      polling = true;
      clearTimeout(timer);
      try { await refresh(); }
      finally {
        polling = false;
        if (!disposed && AppState.currentState === "active") timer = setTimeout(() => { void poll(); }, 60_000);
      }
    };
    if (userId) void poll();
    else void refresh();
    const unsubscribeUpdates = subscribePredictionPicksChanged(changedUserId => {
      if (!disposed && userId && (changedUserId === undefined || changedUserId === userId) && AppState.currentState === "active") void refresh();
    });
    const subscription = AppState.addEventListener("change", next => {
      clearTimeout(timer);
      if (next === "active") void poll();
      else controller.current?.abort();
    });
    return () => { disposed = true; clearTimeout(timer); subscription.remove(); unsubscribeUpdates(); controller.current?.abort(); };
  }, [refresh, userId]));
  const sameUser = state.userId === userId;
  const pendingGamesKey = JSON.stringify(sameUser ? state.data?.picks
    .filter(pick => pick.outcome === "pending")
    .map(pick => ({ sport: pick.sport, league: pick.league, gameId: pick.gameId })) ?? [] : []);
  useFocusEffect(useCallback(() => {
    const games = JSON.parse(pendingGamesKey) as { sport: FanPredictionPicksResponse["picks"][number]["sport"]; league: string; gameId: string }[];
    // Share subscriptions with game screens; the API owns pick-specific shaping.
    const unsubscribers = games.map(payload => subscribeSportsLive({
      kind: "game", payload,
      listener: () => { if (AppState.currentState === "active") void refresh(); },
    }));
    return () => { unsubscribers.forEach(unsubscribe => unsubscribe()); };
  }, [pendingGamesKey, refresh]));
  return { data: sameUser ? state.data : null, loading: sameUser ? state.loading : true, error: sameUser ? state.error : null, refresh };
}
