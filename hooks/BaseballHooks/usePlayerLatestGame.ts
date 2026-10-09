import { usePlayerLatestGame as useLatestGame } from "hooks/LeagueHooks/usePlayerLatestGame";
import type { BaseballGame } from "types/baseball/baseball";
import type { PlayerGameLog } from "types/playerGameLog";

export function usePlayerLatestGame(gameLog: PlayerGameLog | null, league: string) {
  return useLatestGame<BaseballGame>(gameLog, "baseball", league);
}
