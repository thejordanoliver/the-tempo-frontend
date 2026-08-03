import type {
  BracketGame,
  BracketLayoutConfig,
  BracketPosition,
  BracketRegion,
  BracketTeam,
  RegionPlacement,
  TournamentBracketCompetition,
  TournamentBracketData,
  TournamentBracketSourceData,
  TournamentRound,
} from "./tournamentBracket.types";

type JsonRecord = Record<string, unknown>;

export const REGIONAL_ROUNDS: TournamentRound[] = [
  "ROUND_OF_64",
  "ROUND_OF_32",
  "SWEET_16",
  "ELITE_8",
];

export const LEFT_VISUAL_ROUNDS: readonly TournamentRound[] = REGIONAL_ROUNDS;
export const RIGHT_VISUAL_ROUNDS: readonly TournamentRound[] = [
  ...REGIONAL_ROUNDS,
].reverse();

export const BRACKET_LAYOUT: BracketLayoutConfig = {
  gameCardWidth: 198,
  gameCardHeight: 82,
  roundColumnWidth: 212,
  horizontalRoundGap: 20,
  baseVerticalGap: 20,
  regionGap: 60,
  centerColumnWidth: 238,
  centerGap: 30,
  connectorHorizontalLength: 18,
  connectorLineWidth: 2,
  regionHeaderHeight: 34,
  roundTitleHeight: 28,
  regionPadding: 8,
};

export const REGIONAL_ROUND_BASE_COUNTS: Record<string, number> = {
  OPENING: 0,
  ROUND_OF_64: 8,
  ROUND_OF_32: 4,
  SWEET_16: 2,
  ELITE_8: 1,
  FINAL_4: 0,
  CHAMPIONSHIP: 0,
};

export const TOURNAMENT_ROUNDS: TournamentRound[] = [
  "OPENING",
  ...REGIONAL_ROUNDS,
  "FINAL_4",
  "CHAMPIONSHIP",
];

export const ROUND_ORDER: Record<string, number> = {
  OPENING: 0,
  ROUND_OF_64: 1,
  ROUND_OF_32: 2,
  SWEET_16: 3,
  ELITE_8: 4,
  FINAL_4: 5,
  CHAMPIONSHIP: 6,
};

const ROUND_LABELS: Record<string, string> = {
  OPENING: "Opening Round",
  ROUND_OF_64: "Round of 64",
  ROUND_OF_32: "Round of 32",
  SWEET_16: "Sweet 16",
  ELITE_8: "Elite Eight",
  FINAL_4: "Final Four",
  CHAMPIONSHIP: "National Championship",
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const getValue = (record: JsonRecord, keys: readonly string[]) => {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
};

const normalizeCompetition = (
  value: unknown,
): TournamentBracketCompetition => {
  const text = normalizeText(value).toUpperCase();
  return text === "WCBB" || text.includes("WOMEN") ? "WCBB" : "CBB";
};

const normalizeSide = (value: unknown): "left" | "right" | null => {
  const text = normalizeText(value);
  if (text === "left") return "left";
  if (text === "right") return "right";
  return null;
};

const normalizeVerticalPosition = (
  value: unknown,
): "top" | "bottom" | null => {
  const text = normalizeText(value);
  if (text === "top") return "top";
  if (text === "bottom") return "bottom";
  return null;
};

const isTournamentGame = (value: unknown): value is BracketGame => {
  if (!isRecord(value)) return false;

  return typeof value.id === "string" && typeof value.round === "string";
};

const getRoundSortOrder = (game: BracketGame) =>
  Number.isFinite(game.roundOrder)
    ? game.roundOrder
    : ROUND_ORDER[game.round] ?? Number.MAX_SAFE_INTEGER;

const getGameSortOrder = (game: BracketGame) =>
  Number.isFinite(game.gameOrder)
    ? game.gameOrder
    : asNumber(game.bracketSlot) ?? Number.MAX_SAFE_INTEGER;

const getRegionSortOrder = (region: JsonRecord, fallbackOrder: number) =>
  asNumber(getValue(region, ["order", "regionOrder", "region_order"])) ??
  fallbackOrder;

const getRegionIdentity = (
  region: JsonRecord,
  games: readonly BracketGame[],
  fallbackIndex: number,
) => {
  const id =
    asString(getValue(region, ["id", "regionId", "regionID", "key"])) ??
    games.find((game) => game.regionId)?.regionId ??
    `region-${fallbackIndex + 1}`;
  const name =
    asString(getValue(region, ["name", "regionName", "label"])) ??
    games.find((game) => game.regionName)?.regionName ??
    `Region ${fallbackIndex + 1}`;

  return { id, name };
};

const collectGamesFromRegionShape = (value: unknown): BracketGame[] => {
  const gamesById = new Map<string, BracketGame>();
  const visited = new WeakSet<object>();

  const visit = (candidate: unknown) => {
    if (candidate === null || candidate === undefined) return;

    if (isTournamentGame(candidate)) {
      gamesById.set(candidate.id, candidate);
      return;
    }

    if (Array.isArray(candidate)) {
      candidate.forEach(visit);
      return;
    }

    if (!isRecord(candidate) || visited.has(candidate)) return;

    visited.add(candidate);

    [
      "games",
      "rounds",
      "matchups",
      "children",
      "items",
      "slots",
      "bracket",
    ].forEach((key) => visit(candidate[key]));
  };

  visit(value);

  return sortBracketGames(Array.from(gamesById.values()));
};

const normalizeRegions = (
  regions: readonly unknown[],
): BracketRegion[] => {
  return regions
    .map((regionValue, index) => {
      if (!isRecord(regionValue)) return null;

      const regionalGames = collectGamesFromRegionShape(regionValue).filter(
        (game) => REGIONAL_ROUNDS.includes(game.round),
      );
      const { id, name } = getRegionIdentity(regionValue, regionalGames, index);
      const order = getRegionSortOrder(regionValue, index + 1);

      return {
        id,
        name,
        order,
        side:
          normalizeSide(getValue(regionValue, ["side"])) ??
          (order <= 2 ? "left" : "right"),
        verticalPosition:
          normalizeVerticalPosition(
            getValue(regionValue, [
              "verticalPosition",
              "position",
              "vertical",
            ]),
          ) ?? (order % 2 === 1 ? "top" : "bottom"),
        games: sortBracketGames(regionalGames),
      } satisfies BracketRegion;
    })
    .filter((region): region is BracketRegion => Boolean(region))
    .sort((first, second) => first.order - second.order);
};

export function sortBracketGames(
  games: readonly BracketGame[],
): BracketGame[] {
  return [...games].sort((first, second) => {
    const firstRoundOrder = getRoundSortOrder(first);
    const secondRoundOrder = getRoundSortOrder(second);

    if (firstRoundOrder !== secondRoundOrder) {
      return firstRoundOrder - secondRoundOrder;
    }

    const firstGameOrder = getGameSortOrder(first);
    const secondGameOrder = getGameSortOrder(second);

    if (firstGameOrder !== secondGameOrder) {
      return firstGameOrder - secondGameOrder;
    }

    const firstTime = first.date ? new Date(first.date).getTime() : 0;
    const secondTime = second.date ? new Date(second.date).getTime() : 0;
    const safeFirstTime = Number.isNaN(firstTime) ? 0 : firstTime;
    const safeSecondTime = Number.isNaN(secondTime) ? 0 : secondTime;

    if (safeFirstTime !== safeSecondTime) {
      return safeFirstTime - safeSecondTime;
    }

    return first.id.localeCompare(second.id);
  });
}

export function groupGamesByRound(
  games: readonly BracketGame[],
): Record<TournamentRound, BracketGame[]> {
  return TOURNAMENT_ROUNDS.reduce<Record<TournamentRound, BracketGame[]>>(
    (rounds, round) => {
      rounds[round] = sortBracketGames(
        games.filter((game) => game.round === round),
      );
      return rounds;
    },
    {},
  );
}

export function groupRegionGamesByRound(
  games: readonly BracketGame[],
): Record<TournamentRound, BracketGame[]> {
  return groupGamesByRound(games);
}

export function normalizeTournamentForBracket(
  tournament: TournamentBracketSourceData,
): TournamentBracketData {
  const regions = normalizeRegions(tournament.regions ?? []);
  const regionalGames = regions.flatMap((region) => region.games);
  const explicitOpeningRoundGames = sortBracketGames(
    tournament.openingRoundGames ?? [],
  );
  const explicitFinalFourGames = sortBracketGames(
    tournament.finalFourGames ?? [],
  );
  const knownGames = [
    ...regionalGames,
    ...explicitOpeningRoundGames,
    ...explicitFinalFourGames,
    ...(tournament.championshipGame ? [tournament.championshipGame] : []),
  ];
  const openingRoundGames =
    explicitOpeningRoundGames.length > 0
      ? explicitOpeningRoundGames
      : sortBracketGames(knownGames.filter((game) => game.round === "OPENING"));
  const finalFourGames =
    explicitFinalFourGames.length > 0
      ? explicitFinalFourGames
      : sortBracketGames(knownGames.filter((game) => game.round === "FINAL_4"));
  const championshipGame =
    tournament.championshipGame ??
    sortBracketGames(
      knownGames.filter((game) => game.round === "CHAMPIONSHIP"),
    )[0] ??
    null;

  return {
    tournamentId: tournament.tournamentId ?? null,
    tournamentName: tournament.tournamentName,
    season: tournament.season,
    competition: normalizeCompetition(tournament.competition),
    openingRoundLabel: tournament.openingRoundLabel ?? null,
    regions,
    openingRoundGames,
    finalFourGames,
    championshipGame,
    metadata: tournament.metadata,
  };
}

export function getBracketRegionPlacement(
  regions: readonly BracketRegion[],
): RegionPlacement {
  const sortedRegions = [...regions].sort((a, b) => a.order - b.order);
  const placement: RegionPlacement = {
    leftTop: null,
    leftBottom: null,
    rightTop: null,
    rightBottom: null,
  };
  const assignedIds = new Set<string>();
  const keyForRegion = (region: BracketRegion): keyof RegionPlacement =>
    `${region.side}${region.verticalPosition === "top" ? "Top" : "Bottom"}` as
      | "leftTop"
      | "leftBottom"
      | "rightTop"
      | "rightBottom";

  sortedRegions.forEach((region) => {
    const key = keyForRegion(region);

    if (!placement[key]) {
      placement[key] = region;
      assignedIds.add(region.id);
    }
  });

  const fallbackKeys: (keyof RegionPlacement)[] = [
    "leftTop",
    "leftBottom",
    "rightTop",
    "rightBottom",
  ];

  sortedRegions.forEach((region) => {
    if (assignedIds.has(region.id)) return;

    const key = fallbackKeys.find((candidate) => !placement[candidate]);
    if (!key) return;

    placement[key] = region;
    assignedIds.add(region.id);
  });

  return placement;
}

export function getRegionPlacement(
  regions: readonly BracketRegion[],
): RegionPlacement {
  return getBracketRegionPlacement(regions);
}

export function hasRenderableBracketTeam(
  team: BracketTeam | null | undefined,
): team is BracketTeam {
  if (!team) return false;

  return Boolean(
    team.id ??
      team.espnId ??
      team.name ??
      team.shortName ??
      team.abbreviation ??
      team.logo ??
      team.seed ??
      team.score,
  );
}

export function getRenderableBracketTeam(
  team: BracketTeam | null | undefined,
): BracketTeam | null {
  return hasRenderableBracketTeam(team) ? team : null;
}

export function getBracketTeamDisplayName(
  team: BracketTeam | null | undefined,
): string {
  const displayTeam = getRenderableBracketTeam(team);
  if (!displayTeam) return "TBD";

  return (
    displayTeam.shortName ||
    displayTeam.abbreviation ||
    displayTeam.name ||
    "TBD"
  );
}

export function getPlaceholderTeamLabel(
  game: BracketGame,
  position: "top" | "bottom",
  gameById: ReadonlyMap<string, BracketGame> = new Map(),
): string {
  return getBracketPositionLabel(game, position, gameById);
}

export function getBracketPositionLabel(
  game: BracketGame,
  position: BracketPosition,
  gameById: ReadonlyMap<string, BracketGame>,
): string {
  const sourceGameId =
    position === "top" ? game.topSourceGameId : game.bottomSourceGameId;

  if (sourceGameId) {
    const sourceGame = gameById.get(sourceGameId);

    if (sourceGame) {
      const roundLabel = getRoundDisplayLabel(
        sourceGame.round,
        sourceGame.roundLabel,
      );
      const slot = sourceGame.bracketSlot ?? sourceGame.gameOrder;

      return `Winner of ${roundLabel} Game ${slot}`;
    }

    return "Winner of previous game";
  }

  if (game.round === "CHAMPIONSHIP") {
    return position === "top" ? "Winner of Semifinal 1" : "Winner of Semifinal 2";
  }

  if (game.round === "FINAL_4") return "Winner of Elite Eight Game";

  return "TBD";
}

export function isFinalBracketGame(game: BracketGame): boolean {
  const statusText = normalizeText(game.statusText);

  return (
    normalizeText(game.status) === "final" ||
    normalizeText(game.status) === "post" ||
    statusText.includes("final") ||
    statusText.includes("complete")
  );
}

export function isLiveBracketGame(game: BracketGame): boolean {
  const statusText = normalizeText(game.statusText);
  const status = normalizeText(game.status);

  if (isFinalBracketGame(game)) return false;

  return (
    status === "live" ||
    status === "in" ||
    statusText.includes("in progress") ||
    statusText.includes("halftime") ||
    statusText.includes("live")
  );
}

const teamMatchesWinnerId = (team: BracketTeam, winnerTeamId: string) => {
  return [team.id, team.espnId]
    .filter((value) => value !== null && value !== undefined)
    .some((value) => String(value) === winnerTeamId);
};

export function getWinningTeam(game: BracketGame): BracketTeam | null {
  if (!isFinalBracketGame(game)) return null;

  const teams = [
    getRenderableBracketTeam(game.topTeam),
    getRenderableBracketTeam(game.bottomTeam),
  ].filter((team): team is BracketTeam => Boolean(team));

  if (game.winnerTeamId) {
    const winner = teams.find((team) =>
      teamMatchesWinnerId(team, String(game.winnerTeamId)),
    );

    if (winner) return winner;
  }

  return teams.find((team) => team.winner === true) ?? null;
}

export function getWinningBracketTeam(
  game: BracketGame | null,
): BracketTeam | null {
  return game ? getWinningTeam(game) : null;
}

export function getRoundDisplayLabel(
  round: TournamentRound,
  customLabel?: string | null,
): string {
  return customLabel || ROUND_LABELS[round] || round;
}

export function getRoundVerticalSpacing(
  roundIndex: number,
  gameCardHeight: number,
  baseGap: number,
) {
  return Math.pow(2, roundIndex) * (gameCardHeight + baseGap) - gameCardHeight;
}

export function getBaseGameCenterY(
  slot: number,
  layout: BracketLayoutConfig,
): number {
  const safeSlot = Math.max(1, Math.floor(slot));
  const rowHeight = layout.gameCardHeight + layout.baseVerticalGap;

  return (safeSlot - 1) * rowHeight + layout.gameCardHeight / 2;
}

export function getRegionalGameCenterY(
  round: TournamentRound,
  bracketSlot: number,
  layout: BracketLayoutConfig,
): number {
  const roundIndex = REGIONAL_ROUNDS.indexOf(round);

  if (roundIndex <= 0) {
    return getBaseGameCenterY(bracketSlot, layout);
  }

  const coveredBaseSlots = Math.pow(2, roundIndex);
  const firstBaseSlot = (Math.max(1, bracketSlot) - 1) * coveredBaseSlots + 1;
  const lastBaseSlot = firstBaseSlot + coveredBaseSlots - 1;

  return (
    getBaseGameCenterY(firstBaseSlot, layout) +
    getBaseGameCenterY(lastBaseSlot, layout)
  ) / 2;
}

export function getRegionalGameTop(
  round: TournamentRound,
  bracketSlot: number,
  layout: BracketLayoutConfig,
): number {
  return (
    getRegionalGameCenterY(round, bracketSlot, layout) -
    layout.gameCardHeight / 2
  );
}

export function getRegionalRoundBaseSlots(round: TournamentRound): number {
  const roundIndex = REGIONAL_ROUNDS.indexOf(round);
  return roundIndex < 0 ? 1 : Math.pow(2, roundIndex);
}

export function getVisualRoundsForSide(
  side: "left" | "right",
): readonly TournamentRound[] {
  return side === "right" ? RIGHT_VISUAL_ROUNDS : LEFT_VISUAL_ROUNDS;
}

export function createBracketGameMap(
  tournament: TournamentBracketData,
): ReadonlyMap<string, BracketGame> {
  const allGames = [
    ...tournament.openingRoundGames,
    ...tournament.regions.flatMap((region) => region.games),
    ...tournament.finalFourGames,
    ...(tournament.championshipGame ? [tournament.championshipGame] : []),
  ];

  return new Map(allGames.map((game) => [game.id, game] as const));
}

export function getOpeningRoundDestinationLabel(
  game: BracketGame,
  regions: readonly BracketRegion[],
): string {
  const destinationRegion =
    regions.find((region) => region.id === game.destinationRegionId) ??
    regions.find((region) => region.id === game.regionId) ??
    null;
  const regionName =
    destinationRegion?.name ?? game.regionName ?? "the main bracket";
  const seedText = game.destinationSeed
    ? `, No. ${game.destinationSeed} slot`
    : "";

  return `Winner advanced to ${regionName}${seedText}`;
}

export function canNavigateToBracketGame(game: BracketGame): boolean {
  const gameId = asString(game.id);
  return Boolean(gameId && gameId !== "undefined" && gameId !== "null");
}
