import type {
  TournamentGame,
  TournamentRoundCode,
  TournamentTeam,
} from "@/hooks/BasketballHooks/useTournamentBracket";

export type RegionalRoundCode = Extract<
  TournamentRoundCode,
  "ROUND_OF_64" | "ROUND_OF_32" | "SWEET_16" | "ELITE_8"
>;

export type DisplayTeamPair = readonly [
  TournamentTeam | null,
  TournamentTeam | null,
];

export const BRACKET_LAYOUT = {
  roundColumnWidth: 212,
  horizontalRoundGap: 20,
  baseVerticalGap: 20,
  regionGap: 60,
  centerColumnWidth: 238,
  centerGap: 30,
  connectorLineWidth: 1,
  regionHeaderHeight: 34,
  roundTitleHeight: 28,
} as const;

/** Complete seed groups that can occupy each regional visual game slot. */
export const REGIONAL_SLOT_SEED_GROUPS: Record<
  RegionalRoundCode,
  readonly (readonly number[])[]
> = {
  ROUND_OF_64: [
    [1, 16],
    [8, 9],
    [5, 12],
    [4, 13],
    [6, 11],
    [3, 14],
    [7, 10],
    [2, 15],
  ],
  ROUND_OF_32: [
    [1, 16, 8, 9],
    [5, 12, 4, 13],
    [6, 11, 3, 14],
    [7, 10, 2, 15],
  ],
  SWEET_16: [
    [1, 16, 8, 9, 5, 12, 4, 13],
    [6, 11, 3, 14, 7, 10, 2, 15],
  ],
  ELITE_8: [[1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15]],
};

const REGIONAL_DISPLAY_FEEDERS: Record<
  RegionalRoundCode,
  readonly (readonly [readonly number[], readonly number[]])[]
> = {
  ROUND_OF_64: [
    [[1], [16]],
    [[8], [9]],
    [[5], [12]],
    [[4], [13]],
    [[6], [11]],
    [[3], [14]],
    [[7], [10]],
    [[2], [15]],
  ],
  ROUND_OF_32: [
    [[1, 16], [8, 9]],
    [[5, 12], [4, 13]],
    [[6, 11], [3, 14]],
    [[7, 10], [2, 15]],
  ],
  SWEET_16: [
    [[1, 16, 8, 9], [5, 12, 4, 13]],
    [[6, 11, 3, 14], [7, 10, 2, 15]],
  ],
  ELITE_8: [
    [
      [1, 16, 8, 9, 5, 12, 4, 13],
      [6, 11, 3, 14, 7, 10, 2, 15],
    ],
  ],
};

const getGameTeams = (game: TournamentGame): DisplayTeamPair => [
  game.homeTeam,
  game.awayTeam,
];

const getOtherTeam = (
  teams: DisplayTeamPair,
  selectedTeam: TournamentTeam,
): TournamentTeam | null =>
  teams.find((team) => team !== null && team.id !== selectedTeam.id) ?? null;

const orderResolvedTeams = (
  game: TournamentGame,
  firstTeam: TournamentTeam | null,
  secondTeam: TournamentTeam | null,
): DisplayTeamPair => {
  const teams = getGameTeams(game);

  if (firstTeam && secondTeam && firstTeam.id !== secondTeam.id) {
    return [firstTeam, secondTeam];
  }

  if (firstTeam) {
    return [firstTeam, getOtherTeam(teams, firstTeam)];
  }

  if (secondTeam) {
    return [getOtherTeam(teams, secondTeam), secondTeam];
  }

  return teams;
};

const getTeamForSeedGroup = (
  game: TournamentGame,
  seeds: readonly number[],
): TournamentTeam | null =>
  getGameTeams(game).find(
    (team) =>
      team?.seed !== null &&
      team?.seed !== undefined &&
      seeds.includes(team.seed),
  ) ?? null;

/** Returns regional teams in feeder order without changing home/away data. */
export function getRegionalDisplayTeams(
  game: TournamentGame,
  round: RegionalRoundCode,
  slotIndex: number,
): DisplayTeamPair {
  const feeders = REGIONAL_DISPLAY_FEEDERS[round][slotIndex];

  if (!feeders) {
    return getGameTeams(game);
  }

  return orderResolvedTeams(
    game,
    getTeamForSeedGroup(game, feeders[0]),
    getTeamForSeedGroup(game, feeders[1]),
  );
}

/** Orders a destination game by the winners of two incoming source games. */
export function getSourceGameDisplayTeams(
  game: TournamentGame,
  firstSourceGame: TournamentGame | null | undefined,
  secondSourceGame: TournamentGame | null | undefined,
): DisplayTeamPair {
  const getSourceWinner = (
    sourceGame: TournamentGame | null | undefined,
  ): TournamentTeam | null => {
    if (!sourceGame) {
      return null;
    }

    const teams = getGameTeams(sourceGame);

    if (sourceGame.winnerTeamId) {
      return teams.find((team) => team?.id === sourceGame.winnerTeamId) ?? null;
    }

    return teams.find((team) => team?.winner === true) ?? null;
  };

  const destinationTeams = getGameTeams(game);
  const firstWinnerId = getSourceWinner(firstSourceGame)?.id;
  const secondWinnerId = getSourceWinner(secondSourceGame)?.id;

  return orderResolvedTeams(
    game,
    destinationTeams.find((team) => team?.id === firstWinnerId) ?? null,
    destinationTeams.find((team) => team?.id === secondWinnerId) ?? null,
  );
}

/** Orders Final Four teams by the visual order of their source regions. */
export function getFinalFourDisplayTeams(
  game: TournamentGame,
  regionalChampionOrderByTeamId: ReadonlyMap<string, number>,
): DisplayTeamPair {
  const teams = getGameTeams(game);
  const rankedTeams = teams
    .filter((team): team is TournamentTeam => team !== null)
    .map((team) => ({
      team,
      regionOrder: regionalChampionOrderByTeamId.get(team.id),
    }));

  if (
    rankedTeams.length !== 2 ||
    rankedTeams[0].regionOrder === undefined ||
    rankedTeams[1].regionOrder === undefined ||
    rankedTeams[0].regionOrder === rankedTeams[1].regionOrder
  ) {
    return teams;
  }

  rankedTeams.sort(
    (first, second) =>
      (first.regionOrder ?? Number.MAX_SAFE_INTEGER) -
      (second.regionOrder ?? Number.MAX_SAFE_INTEGER),
  );

  return [rankedTeams[0].team, rankedTeams[1].team];
}
