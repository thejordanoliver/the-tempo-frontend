import { useCallback, useEffect, useState } from "react";
import { fetchPredictionScoring } from "services/fanPredictionsApi";
import type { FanPredictionScoring, RankedPredictionContext } from "types/fanPredictions";

export function usePredictionScoring(gameId: number, context?: RankedPredictionContext) {
  const sport = context?.sport;
  const league = context?.league;
  const date = context?.date;
  const state = context?.state;
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([gameId, sport, league, date, state, attempt]);
  const [result, setResult] = useState<{ key: string; scoring: FanPredictionScoring | null; error: boolean } | null>(null);
  useEffect(() => {
    if (!sport || !league || state !== "pre") return;
    const controller = new AbortController();
    void fetchPredictionScoring(gameId, { sport, league, date }, controller.signal)
      .then(scoring => {
        if (!controller.signal.aborted) setResult({ key, scoring, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, scoring: null, error: true });
      });
    return () => controller.abort();
  }, [gameId, sport, league, date, state, key]);
  const retryScoring = useCallback(() => setAttempt(value => value + 1), []);
  return { scoring: result?.key === key ? result.scoring : null,
    scoringError: result?.key === key && result.error, retryScoring };
}
