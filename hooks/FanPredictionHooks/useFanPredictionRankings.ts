import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPredictionRankings } from "services/fanPredictionsApi";
import type {
  FanPredictionRankingsResponse,
  FanPredictionSportFilter,
} from "types/fanPredictions";

type RankingsState = {
  sport: FanPredictionSportFilter;
  data: FanPredictionRankingsResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

export function useFanPredictionRankings(
  sport: FanPredictionSportFilter = "all",
) {
  const [state, setState] = useState<RankingsState>({
    sport,
    data: null,
    loading: true,
    refreshing: false,
    error: null,
  });
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(
    (refreshing = false) => {
      controller.current?.abort();
      const request = new AbortController();
      controller.current = request;
      setState((previous) => ({
        sport,
        data: previous.sport === sport ? previous.data : null,
        loading: previous.sport !== sport || previous.data == null,
        refreshing,
        error: null,
      }));
      return fetchPredictionRankings(
        request.signal,
        sport === "all" ? undefined : sport,
      )
        .then((result) => {
          if (!request.signal.aborted)
            setState({
              sport,
              data: result,
              loading: false,
              refreshing: false,
              error: null,
            });
        })
        .catch(() => {
          if (!request.signal.aborted)
            setState((previous) => ({
              ...previous,
              loading: false,
              refreshing: false,
              error: "We couldn't load fan rankings. Try again.",
            }));
        })
        .finally(() => {
          if (controller.current === request) controller.current = null;
        });
    },
    [sport],
  );
  useEffect(() => {
    void load();
    return () => controller.current?.abort();
  }, [load]);
  const refresh = useCallback(() => {
    void load(true);
  }, [load]);
  const sameSport = state.sport === sport;
  return {
    data: sameSport ? state.data : null,
    loading: !sameSport || state.loading,
    refreshing: sameSport && state.refreshing,
    error: sameSport ? state.error : null,
    refresh,
  };
}
