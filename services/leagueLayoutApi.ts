import { apiClient } from "utils/apiClient";
import { isLeagueLayout, type LeagueLayout } from "types/preferences";

type LeagueLayoutResponse = { leagueLayout: LeagueLayout; userId: number };
function parseResponse(data: LeagueLayoutResponse) {
  if (!isLeagueLayout(data.leagueLayout)) throw new Error("Invalid league layout response");
  return data;
}
export async function getLeagueLayout(signal?: AbortSignal) {
  const { data } = await apiClient.get<LeagueLayoutResponse>("/api/users/me/league-layout", { signal });
  return parseResponse(data);
}
export async function saveLeagueLayout(leagueLayout: LeagueLayout) {
  const { data } = await apiClient.patch<LeagueLayoutResponse>("/api/users/me/league-layout", { leagueLayout });
  return parseResponse(data);
}
