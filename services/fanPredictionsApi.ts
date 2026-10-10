import { apiClient } from "utils/apiClient";
import { notifyPredictionPicksChanged } from "services/predictionUpdates";
import type { FanPredictionSortOrder, FanPredictionScoring, FanPredictionPicksResponse, FanPredictionRankingsResponse, RankedPredictionContext } from "types/fanPredictions";
export async function fetchCurrentUserPicks(signal?: AbortSignal) {
  const { data } = await apiClient.get<FanPredictionPicksResponse>("/api/predictions/me/picks", { signal });
  return data;
}
export async function fetchPredictionRankings(signal?: AbortSignal) {
  const { data } = await apiClient.get<FanPredictionRankingsResponse>("/api/predictions/rankings", { signal });
  return data;
}
export async function castRankedPrediction(gameId: number, teamId: string | number, context: RankedPredictionContext) {
  await apiClient.post("/api/predictions", { gameId, teamId, sport: context.sport, league: context.league, date: context.date });
  notifyPredictionPicksChanged();
}

export async function fetchPredictionScoring(gameId: number, context: RankedPredictionContext, signal?: AbortSignal) {
  const { data } = await apiClient.get<FanPredictionScoring>("/api/predictions/scoring", {
    params: { gameId, sport: context.sport, league: context.league, date: context.date }, signal,
  });
  return data;
}

export async function fetchUserPredictionPicks(userId: number, offset: number, signal?: AbortSignal, sort: FanPredictionSortOrder = "newest") {
  const { data } = await apiClient.get<FanPredictionPicksResponse>(`/api/predictions/users/${userId}/picks`, {
    params: { offset, sort }, signal,
  });
  return data;
}
