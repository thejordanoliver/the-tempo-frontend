import type { ExploreWidgetGame } from "types/widgets";
import { isGameFinalStatus } from "../games/gameStatus";

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
    .map((value) =>
      String(value ?? "")
        .trim()
        .toLowerCase(),
    )
    .join(" ");
}

export function getExploreFavoriteGamePhase(
  envelope: ExploreWidgetGame,
): GamePhase {
  const statusText = normalizedStatusText(envelope.game);
  const state = String(envelope.game.status?.state ?? "")
    .trim()
    .toLowerCase();

  if (
    isGameFinalStatus(envelope.game.status) ||
    statusText.includes("completed")
  ) {
    return "completed";
  }

  if (
    state === "in" ||
    state === "live" ||
    state === "half" ||
    state === "in_play" ||
    state === "in_progress" ||
    statusText.includes("in progress") ||
    statusText.includes("halftime")
  ) {
    return "live";
  }

  return "upcoming";
}

function getGameTimestamp(envelope: ExploreWidgetGame): number {
  const game = envelope.game;
  for (const date of [game.startDate, game.date]) {
    const dateTimestamp = Date.parse(date || "");
    if (Number.isFinite(dateTimestamp)) return dateTimestamp;
  }

  const rawTimestamp = game.timestamp == null ? NaN : Number(game.timestamp);
  if (!Number.isFinite(rawTimestamp) || rawTimestamp <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  return rawTimestamp < 10_000_000_000 ? rawTimestamp * 1_000 : rawTimestamp;
}

function getGameIdentity(envelope: ExploreWidgetGame): string {
  return `${envelope.sport}:${envelope.league}:${envelope.gameId}`;
}

export function prepareExploreFavoriteGames(
  games: readonly ExploreWidgetGame[],
  now = Date.now(),
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
    .map((game) => ({
      game,
      phase: getExploreFavoriteGamePhase(game),
      timestamp: getGameTimestamp(game),
    }))
    .sort((first, second) => {
      const liveDifference =
        Number(second.phase === "live") - Number(first.phase === "live");
      if (liveDifference !== 0) return liveDifference;

      const firstTimestamp = first.timestamp;
      const secondTimestamp = second.timestamp;
      if (firstTimestamp !== secondTimestamp) {
        // Unknown dates belong after dated games.
        if (!Number.isFinite(firstTimestamp)) return 1;
        if (!Number.isFinite(secondTimestamp)) return -1;

        const distanceDifference =
          Math.abs(firstTimestamp - now) - Math.abs(secondTimestamp - now);
        if (distanceDifference !== 0) return distanceDifference;
      }

      const phaseDifference =
        PHASE_ORDER[first.phase] - PHASE_ORDER[second.phase];
      if (phaseDifference !== 0) return phaseDifference;

      // Socket updates can change input order without changing game priority.
      return getGameIdentity(first.game).localeCompare(
        getGameIdentity(second.game),
      );
    })
    .map(({ game }) => game);
}

/** Keep the best game for each favorite, including shared matchups only once. */
export function selectExploreFavoriteGames(
  games: readonly ExploreWidgetGame[],
  now = Date.now(),
): ExploreWidgetGame[] {
  const selectedFavorites = new Set<string>();

  return prepareExploreFavoriteGames(games, now).flatMap((envelope) => {
    const favoriteTeamKeys = envelope.favoriteTeamKeys.filter(
      (key) => !selectedFavorites.has(key),
    );
    favoriteTeamKeys.forEach((key) => selectedFavorites.add(key));

    return favoriteTeamKeys.length ? [{ ...envelope, favoriteTeamKeys }] : [];
  });
}

export function mergeExploreFavoriteGameUpdate(
  games: readonly ExploreWidgetGame[],
  update: ExploreWidgetGame,
  now = Date.now(),
  { replaceTeamSelection = false }: { replaceTeamSelection?: boolean } = {},
): ExploreWidgetGame[] {
  const existing = games.find((envelope) => envelope.key === update.key);
  const updated = {
    ...update,
    favoriteTeamKeys: Array.from(
      new Set([
        ...update.favoriteTeamKeys,
        ...(existing?.favoriteTeamKeys ?? []),
      ]),
    ),
  };

  const retained = games.flatMap((envelope) => {
    if (envelope.key === update.key) return [];
    if (!replaceTeamSelection) return [envelope];
    const favoriteTeamKeys = envelope.favoriteTeamKeys.filter(
      (key) => !update.favoriteTeamKeys.includes(key),
    );
    return favoriteTeamKeys.length ? [{ ...envelope, favoriteTeamKeys }] : [];
  });

  // A full schedule replaces that team's selection; a teamLatest snapshot must
  // compete with the existing choice so an older final cannot displace it.
  return selectExploreFavoriteGames([...retained, updated], now);
}
