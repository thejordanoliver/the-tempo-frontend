import { apiClient } from "utils/apiClient";
import { isGameCardLayout, type GameCardLayout } from "types/preferences";

type GameCardLayoutResponse = { gameCardLayout: GameCardLayout; userId: number };
function parseResponse(data: GameCardLayoutResponse) {
  if (!isGameCardLayout(data.gameCardLayout)) throw new Error("Invalid game card layout response");
  return data;
}
export async function getGameCardLayout(signal?: AbortSignal) {
  const { data } = await apiClient.get<GameCardLayoutResponse>("/api/users/me/game-card-layout", { signal });
  return parseResponse(data);
}
export async function saveGameCardLayout(gameCardLayout: GameCardLayout) {
  const { data } = await apiClient.patch<GameCardLayoutResponse>("/api/users/me/game-card-layout", { gameCardLayout });
  return parseResponse(data);
}
