import { usePlayerLatestGame as useLatestGame } from "hooks/LeagueHooks/usePlayerLatestGame";
import type { HockeyGame } from "types/hockey/hockey";
import type { PlayerGameLog } from "types/playerGameLog";

export function usePlayerLatestGame(gameLog: PlayerGameLog | null, league: string) {
  return useLatestGame<HockeyGame>(gameLog, "hockey", league);
}
