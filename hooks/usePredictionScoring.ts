import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { fetchPredictionScoring } from "services/fanPredictionsApi";
import type {
  FanPredictionScoring,
  RankedPredictionContext,
} from "types/fanPredictions";

export function usePredictionScoring(
  gameId: number,
  context?: RankedPredictionContext,
) {
  const sport = context?.sport;
  const league = context?.league;

  const date = sport === "mma" ? context?.date : undefined;
  const state = context?.state;
  const enabled = Boolean(
    sport &&
    league &&
    Number.isSafeInteger(gameId) &&
    gameId > 0 &&
    (state == null || state === "pre") &&
    (sport !== "mma" || date),
  );
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([gameId, sport, league, date]);
  const [result, setResult] = useState<{
    key: string;
    scoring: FanPredictionScoring | null;
    error: boolean;
  } | null>(null);
  useEffect(() => {
    if (!enabled || !sport || !league) return;
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || AppState.currentState !== "active") return;
      pending = true;
      try {
        const scoring = await fetchPredictionScoring(gameId, { sport, league, date }, controller.signal);
        if (!controller.signal.aborted) setResult({ key, scoring, error: false });
      } catch {
        if (!controller.signal.aborted)
          setResult((previous) => ({ key, scoring: previous?.key === key ? previous.scoring : null, error: true }));
      } finally { pending = false; }
    };
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 60_000);
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") void refresh();
    });
    return () => {
      controller.abort();
      clearInterval(timer);
      subscription.remove();
    };
  }, [gameId, sport, league, date, enabled, key, attempt]);
  const retryScoring = useCallback(() => setAttempt((value) => value + 1), []);
  return {
    scoring: result?.key === key ? result.scoring : null,
    scoringError: result?.key === key && result.error,
    retryScoring,
  };
}
