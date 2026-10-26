import type { TournamentGame } from "hooks/BasketballHooks/useTournamentBracket";
import { isGameFinalStatus } from "../games/gameStatus";

export function getTournamentGameState(game: TournamentGame) {
  const description = game.status.description?.trim().toLowerCase() ?? "";
  const statusText = [description, game.status.detail, game.status.shortDetail]
    .filter(Boolean)
    .join(" ");

  if (
    /cancelled|canceled|postponed|delayed|suspended|forfeit/i.test(statusText)
  ) {
    return "interrupted";
  }
  if (isGameFinalStatus(game.status)) return "final";
  if (/half.?time/i.test(statusText)) return "halftime";
  if (/end of (period|half|quarter)/i.test(statusText)) return "endOfPeriod";
  if (game.status.state === "in" || description === "in progress")
    return "live";
  if (game.status.state === "pre" || description === "scheduled")
    return "scheduled";
  return "unknown";
}
