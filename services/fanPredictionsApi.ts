import { apiClient } from "utils/apiClient";
import type { FanPredictionPicksResponse, FanPredictionRankingsResponse, RankedPredictionContext } from "types/fanPredictions";
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
}
