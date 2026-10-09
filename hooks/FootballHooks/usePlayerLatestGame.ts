import { usePlayerLatestGame as useLatestGame } from "hooks/LeagueHooks/usePlayerLatestGame";
import type { FootballGame } from "types/football/football";
import type { PlayerGameLog } from "types/playerGameLog";

export function usePlayerLatestGame(gameLog: PlayerGameLog | null, league: string) {
  return useLatestGame<FootballGame>(gameLog, "football", league);
}
