import { useCallback, useEffect, useState } from "react";
import { fetchPredictionScoring } from "services/fanPredictionsApi";
import type { FanPredictionScoring, RankedPredictionContext } from "types/fanPredictions";

export function usePredictionScoring(gameId: number, context?: RankedPredictionContext) {
  const sport = context?.sport;
  const league = context?.league;
  // Only fights need a date to resolve their game. Other dates arrive with
  // details and must not restart an already-running scoring request.
  const date = sport === "mma" ? context?.date : undefined;
  const state = context?.state;
  const enabled = Boolean(sport && league && Number.isSafeInteger(gameId) && gameId > 0 &&
    (state == null || state === "pre") && (sport !== "mma" || date));
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([gameId, sport, league, date, attempt]);
  const [result, setResult] = useState<{ key: string; scoring: FanPredictionScoring | null; error: boolean } | null>(null);
  useEffect(() => {
    if (!enabled || !sport || !league) return;
    const controller = new AbortController();
    void fetchPredictionScoring(gameId, { sport, league, date }, controller.signal)
      .then(scoring => {
        if (!controller.signal.aborted) setResult({ key, scoring, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, scoring: null, error: true });
      });
    return () => controller.abort();
  }, [gameId, sport, league, date, enabled, key]);
  const retryScoring = useCallback(() => setAttempt(value => value + 1), []);
  return { scoring: result?.key === key ? result.scoring : null,
    scoringError: result?.key === key && result.error, retryScoring };
}
