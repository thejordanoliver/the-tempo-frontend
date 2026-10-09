import { usePlayerLatestGame as useLatestGame } from "hooks/LeagueHooks/usePlayerLatestGame";
import type { BasketballGame } from "types/basketball/basketball";
import type { PlayerGameLog } from "types/playerGameLog";

export function usePlayerLatestGame(gameLog: PlayerGameLog | null, league: string) {
  return useLatestGame<BasketballGame>(gameLog, "basketball", league);
}
