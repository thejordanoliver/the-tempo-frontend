export type PlayerScheduleGame = {
  date?: string | null;
  status?: { state?: string; completed?: boolean };
};

export function getPlayerGameHeading(game: PlayerScheduleGame): string {
  if (game.status?.completed || game.status?.state === "post")
    return "Latest Game";
  if (["in", "half"].includes(game.status?.state ?? "")) return "Live Game";
  return "Upcoming";
}

export function getClosestPlayerGame<Game extends PlayerScheduleGame>(
  games: Game[],
  now = Date.now(),
): Game | null {
  let closest: Game | null = null;
  let distance = Infinity;
  for (const game of games) {
    const live = getPlayerGameHeading(game) === "Live Game";
    const time = game.date ? Date.parse(game.date) : NaN;
    const candidateDistance = live ? -1 : Math.abs(time - now);
    if (Number.isFinite(candidateDistance) && candidateDistance < distance) {
      closest = game;
      distance = candidateDistance;
    }
  }
  return closest;
}
