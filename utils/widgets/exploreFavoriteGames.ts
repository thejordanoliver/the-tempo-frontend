import type { ExploreWidgetGame } from "types/widgets";

type GamePhase = "live" | "upcoming" | "completed";

const PHASE_ORDER: Record<GamePhase, number> = {
  live: 0,
  upcoming: 1,
  completed: 2,
};

function normalizedStatusText(game: ExploreWidgetGame["game"]): string {
  return [
    game.status?.state,
    game.status?.description,
    game.status?.detail,
    game.status?.shortDetail,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
}

export function getExploreFavoriteGamePhase(
  envelope: ExploreWidgetGame,
): GamePhase {
  const statusText = normalizedStatusText(envelope.game);
  const state = String(envelope.game.status?.state ?? "").toLowerCase();

  if (
    state === "in" ||
    state === "live" ||
    state === "half" ||
    statusText.includes("in progress") ||
    statusText.includes("halftime")
  ) {
    return "live";
  }

  if (
    envelope.game.status?.completed === true ||
    state === "post" ||
    state === "final" ||
    statusText.includes("final") ||
    statusText.includes("completed")
  ) {
    return "completed";
  }

  return "upcoming";
}

function getGameTimestamp(envelope: ExploreWidgetGame): number {
  const game = envelope.game;
  const dateTimestamp = Date.parse(game.startDate || game.date);

  if (Number.isFinite(dateTimestamp)) return dateTimestamp;

  const rawTimestamp = Number(game.timestamp);
  if (!Number.isFinite(rawTimestamp)) return Number.POSITIVE_INFINITY;

  return rawTimestamp < 10_000_000_000
    ? rawTimestamp * 1_000
    : rawTimestamp;
}

function getGameIdentity(envelope: ExploreWidgetGame): string {
  return `${envelope.sport}:${envelope.league}:${envelope.gameId}`;
}

export function prepareExploreFavoriteGames(
  games: readonly ExploreWidgetGame[],
): ExploreWidgetGame[] {
  const deduplicated = new Map<string, ExploreWidgetGame>();

  games.forEach((game) => {
    const identity = getGameIdentity(game);
    const existing = deduplicated.get(identity);
    if (!existing) {
      deduplicated.set(identity, game);
      return;
    }

    const existingPhase = getExploreFavoriteGamePhase(existing);
    const nextPhase = getExploreFavoriteGamePhase(game);
    const preferred =
      PHASE_ORDER[nextPhase] < PHASE_ORDER[existingPhase] ? game : existing;

    deduplicated.set(identity, {
      ...preferred,
      favoriteTeamKeys: Array.from(
        new Set([...existing.favoriteTeamKeys, ...game.favoriteTeamKeys]),
      ),
    } as ExploreWidgetGame);
  });

  return Array.from(deduplicated.values())
    .map((game, originalIndex) => ({
      game,
      originalIndex,
      phase: getExploreFavoriteGamePhase(game),
      timestamp: getGameTimestamp(game),
    }))
    .sort((first, second) => {
      const phaseDifference =
        PHASE_ORDER[first.phase] - PHASE_ORDER[second.phase];
      if (phaseDifference !== 0) return phaseDifference;

      const firstTimestamp = first.timestamp;
      const secondTimestamp = second.timestamp;
      if (firstTimestamp !== secondTimestamp) {
        if (first.phase === "completed") {
          return secondTimestamp - firstTimestamp;
        }

        return firstTimestamp - secondTimestamp;
      }

      return first.originalIndex - second.originalIndex;
    })
    .map(({ game }) => game);
}
