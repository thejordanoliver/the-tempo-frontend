import type { PlayerGameLog } from "types/playerGameLog";

type GameLogEntry = PlayerGameLog["games"][number];

export function getLatestPlayerGame(
  games: GameLogEntry[],
  now = Date.now(),
): GameLogEntry | null {
  let latest: GameLogEntry | null = null;
  let latestTime = -Infinity;
  for (const game of games) {
    const time = game.date ? Date.parse(game.date) : NaN;
    if (Number.isFinite(time) && time <= now && time > latestTime) {
      latest = game;
      latestTime = time;
    }
  }
  return latest;
}

