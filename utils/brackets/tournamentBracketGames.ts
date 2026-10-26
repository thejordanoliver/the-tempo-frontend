import type {
  TournamentGame,
  TournamentRegion,
  TournamentTeam,
} from "hooks/BasketballHooks/useTournamentBracket";
import {
  REGIONAL_SLOT_SEED_GROUPS,
  getFinalFourDisplayTeams,
  type RegionalRoundCode,
} from "./tournamentBracket.utils";

type RegionalRoundSlots = Record<
  RegionalRoundCode,
  (TournamentGame | undefined)[]
>;
export const getGameTimestamp = (game: TournamentGame): number => {
  if (!game.date) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = Date.parse(game.date);

  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
};

export const sortGamesByDate = (
  games: readonly TournamentGame[],
): TournamentGame[] =>
  [...games].sort((firstGame, secondGame) => {
    const dateDifference =
      getGameTimestamp(firstGame) - getGameTimestamp(secondGame);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return firstGame.id.localeCompare(secondGame.id);
  });

export const getGameSeeds = (game: TournamentGame): number[] =>
  [game.homeTeam?.seed, game.awayTeam?.seed].filter(
    (seed): seed is number => typeof seed === "number" && Number.isFinite(seed),
  );

export const getSeedSlotIndex = (
  game: TournamentGame,
  round: RegionalRoundCode,
): number | null => {
  const seeds = getGameSeeds(game);

  if (seeds.length === 0) {
    return null;
  }

  const groups = REGIONAL_SLOT_SEED_GROUPS[round];

  const matchingIndexes = groups.reduce<number[]>(
    (indexes, seedGroup, index) => {
      if (seeds.every((seed) => seedGroup.includes(seed))) {
        indexes.push(index);
      }

      return indexes;
    },
    [],
  );

  return matchingIndexes.length === 1 ? matchingIndexes[0] : null;
};

export const placeRoundGames = (
  games: readonly TournamentGame[],
  round: RegionalRoundCode,
  sourceSlots: readonly (TournamentGame | undefined)[] = [],
): (TournamentGame | undefined)[] => {
  const slotCount = REGIONAL_SLOT_SEED_GROUPS[round].length;
  const slots = Array<TournamentGame | undefined>(slotCount).fill(undefined);
  const unresolved: TournamentGame[] = [];

  for (const game of sortGamesByDate(games)) {
    const teamIds = new Set(
      [game.homeTeam?.id, game.awayTeam?.id].filter(Boolean),
    );
    const feederSlots = new Set<number>();
    sourceSlots.forEach((sourceGame, index) => {
      if (
        sourceGame &&
        [sourceGame.homeTeam?.id, sourceGame.awayTeam?.id].some(
          (id) => id != null && teamIds.has(id),
        )
      )
        feederSlots.add(Math.floor(index / 2));
    });
    const slotIndex =
      getSeedSlotIndex(game, round) ??
      (feederSlots.size === 1 ? [...feederSlots][0] : null);

    if (
      slotIndex !== null &&
      slotIndex >= 0 &&
      slotIndex < slotCount &&
      !slots[slotIndex]
    ) {
      slots[slotIndex] = game;
      continue;
    }

    unresolved.push(game);
  }

  /**
   * A future or partially populated bracket can temporarily be missing seeds.
   * Keep those games visible without disturbing any matchup already placed
   * from seed-path data.
   */
  for (const game of unresolved) {
    const emptyIndex = slots.findIndex((slot) => slot === undefined);

    if (emptyIndex === -1) {
      break;
    }

    slots[emptyIndex] = game;
  }

  return slots;
};

export const buildRegionRoundSlots = (
  region: TournamentRegion,
): RegionalRoundSlots => {
  const slots = {} as RegionalRoundSlots;
  const rounds: RegionalRoundCode[] = [
    "ROUND_OF_64",
    "ROUND_OF_32",
    "SWEET_16",
    "ELITE_8",
  ];
  rounds.forEach((round, index) => {
    slots[round] = placeRoundGames(
      region.games.filter((game) => game.round === round),
      round,
      index > 0 ? slots[rounds[index - 1]] : [],
    );
  });
  return slots;
};

/** Team membership also works before the regional final has a winner. */
export const getRegionalTeamOrder = (
  regions: readonly TournamentRegion[],
): ReadonlyMap<string, number> => {
  const orderByTeamId = new Map<string, number>();
  for (const region of regions) {
    for (const game of region.games) {
      for (const team of [game.homeTeam, game.awayTeam]) {
        if (team) orderByTeamId.set(team.id, region.order);
      }
    }
  }
  return orderByTeamId;
};

export const getFinalFourGameRegionOrder = (
  game: TournamentGame,
  regionalChampionOrderByTeamId: ReadonlyMap<string, number>,
): number =>
  Math.min(
    regionalChampionOrderByTeamId.get(game.homeTeam?.id ?? "") ??
      Number.MAX_SAFE_INTEGER,
    regionalChampionOrderByTeamId.get(game.awayTeam?.id ?? "") ??
      Number.MAX_SAFE_INTEGER,
  );

export const getOrderedFinalFourGames = (
  finalFourGames: readonly TournamentGame[],
  regionalChampionOrderByTeamId: ReadonlyMap<string, number>,
): TournamentGame[] =>
  sortGamesByDate(finalFourGames).sort((firstGame, secondGame) => {
    const regionDifference =
      getFinalFourGameRegionOrder(firstGame, regionalChampionOrderByTeamId) -
      getFinalFourGameRegionOrder(secondGame, regionalChampionOrderByTeamId);

    return regionDifference;
  });

export const getRegionForTeam = (
  regions: readonly TournamentRegion[],
  team: TournamentTeam | null,
): TournamentRegion | null => {
  if (!team) {
    return null;
  }

  return (
    regions.find((region) =>
      region.games.some(
        (game) =>
          game.homeTeam?.id === team.id || game.awayTeam?.id === team.id,
      ),
    ) ?? null
  );
};

/** Preserve all four board positions when regional data is incomplete. */
export const getFinalFourRegionLayout = (
  regions: readonly TournamentRegion[],
  orderedFinalFourGames: readonly TournamentGame[],
  regionalTeamOrderById: ReadonlyMap<string, number>,
): (TournamentRegion | null)[] => {
  const assigned = new Set<string>();
  const slots = Array.from({ length: 4 }, (_, index) => {
    const game = orderedFinalFourGames[Math.floor(index / 2)];
    const team = game
      ? getFinalFourDisplayTeams(game, regionalTeamOrderById)[index % 2]
      : null;
    const region = getRegionForTeam(regions, team);
    if (!region || assigned.has(region.id)) return null;
    assigned.add(region.id);
    return region;
  });
  const unassigned = [...regions]
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .filter((region) => !assigned.has(region.id));
  return slots.map((region) => region ?? unassigned.shift() ?? null);
};
