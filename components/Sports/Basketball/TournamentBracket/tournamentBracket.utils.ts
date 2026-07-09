import type {
  BracketGame,
  BracketGameStatus,
  BracketLayoutConfig,
  BracketPosition,
  BracketRegion,
  BracketTeam,
  RegionPlacement,
  TournamentBracketApiResponse,
  TournamentBracketCompetition,
  TournamentBracketData,
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

export const REGIONAL_ROUND_BASE_COUNTS: Record<TournamentRound, number> = {
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

export const ROUND_ORDER: Record<TournamentRound, number> = {
  OPENING: 0,
  ROUND_OF_64: 1,
  ROUND_OF_32: 2,
  SWEET_16: 3,
  ELITE_8: 4,
  FINAL_4: 5,
  CHAMPIONSHIP: 6,
};

const ROUND_LABELS: Record<TournamentRound, string> = {
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

const asRecord = (value: unknown): JsonRecord | null =>
  isRecord(value) ? value : null;

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

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

const asBoolean = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null;

const asStringArray = (value: unknown): string[] =>
  asArray(value)
    .map(asString)
    .filter((item): item is string => Boolean(item));

const getValue = (record: JsonRecord, keys: readonly string[]) => {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
};

const getRecordValue = (
  record: JsonRecord,
  keys: readonly string[],
): JsonRecord | null => asRecord(getValue(record, keys));

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const normalizeCompetition = (
  value: unknown,
  fallback: TournamentBracketCompetition,
): TournamentBracketCompetition => {
  const text = normalizeText(value).toUpperCase();
  return text === "WCBB" || text.includes("WOMEN") ? "WCBB" : fallback;
};

export function normalizeTournamentRound(
  value: unknown,
  order?: number | null,
): TournamentRound {
  const text = normalizeText(value);

  if (
    text.includes("first four") ||
    text.includes("opening") ||
    text === "open"
  ) {
    return "OPENING";
  }

  if (
    text.includes("round of 64") ||
    text.includes("first round") ||
    text.includes("1st round")
  ) {
    return "ROUND_OF_64";
  }

  if (
    text.includes("round of 32") ||
    text.includes("second round") ||
    text.includes("2nd round")
  ) {
    return "ROUND_OF_32";
  }

  if (
    text.includes("sweet 16") ||
    text.includes("sweet sixteen") ||
    text.includes("regional semifinal")
  ) {
    return "SWEET_16";
  }

  if (
    text.includes("elite 8") ||
    text.includes("elite eight") ||
    text.includes("regional final")
  ) {
    return "ELITE_8";
  }

  if (
    text.includes("final four") ||
    text.includes("national semifinal") ||
    text === "semifinal" ||
    text === "semifinals"
  ) {
    return "FINAL_4";
  }

  if (text.includes("championship") || text.includes("national title")) {
    return "CHAMPIONSHIP";
  }

  const roundByOrder = TOURNAMENT_ROUNDS.find(
    (round) => ROUND_ORDER[round] === order,
  );

  return roundByOrder ?? "ROUND_OF_64";
}

const normalizeStatus = (value: unknown): BracketGameStatus => {
  const statusRecord = asRecord(value);
  const text = normalizeText(
    statusRecord
      ? [
          statusRecord.state,
          statusRecord.name,
          statusRecord.description,
          statusRecord.detail,
          statusRecord.shortDetail,
        ]
          .filter(Boolean)
          .join(" ")
      : value,
  );

  if (text.includes("cancel")) return "canceled";
  if (text.includes("postpone")) return "postponed";
  if (text.includes("delay") || text.includes("suspend")) return "delayed";
  if (
    text.includes("final") ||
    text.includes("complete") ||
    text.includes("status final")
  ) {
    return "final";
  }
  if (
    text.includes("in progress") ||
    text.includes("halftime") ||
    text.includes("live") ||
    text === "in"
  ) {
    return "live";
  }
  if (text.includes("pre")) return "pre";
  if (text.includes("post")) return "post";

  return "scheduled";
};

const getStatusText = (value: unknown) => {
  const statusRecord = asRecord(value);

  if (!statusRecord) return asString(value);

  return asString(
    getValue(statusRecord, [
      "shortDetail",
      "detail",
      "description",
      "displayName",
      "name",
      "state",
    ]),
  );
};

const normalizeTeam = (value: unknown): BracketTeam | null => {
  const record = asRecord(value);
  if (!record) return null;

  const id =
    asString(getValue(record, ["id", "teamId", "uid"])) ??
    asString(getValue(record, ["espnId", "espnID"]));
  const name =
    asString(getValue(record, ["name", "displayName", "fullName"])) ??
    asString(getValue(record, ["shortName", "abbreviation", "code"]));

  if (!id && !name) return null;

  return {
    id: id ?? name ?? "team",
    espnId: asString(getValue(record, ["espnId", "espnID"])) ?? null,
    name: name ?? "TBD",
    shortName: asString(getValue(record, ["shortName", "shortDisplayName"])),
    abbreviation: asString(getValue(record, ["abbreviation", "code"])),
    logo: asString(getValue(record, ["logo", "logoUrl", "logoURL"])),
    seed: asNumber(getValue(record, ["seed", "rank", "curatedRank"])),
    score: asNumber(getValue(record, ["score", "points"])) ??
      asString(getValue(record, ["score", "points"])),
    winner: asBoolean(getValue(record, ["winner", "isWinner"])),
    record: asString(getValue(record, ["record", "summary", "teamRecord"])),
  };
};

const normalizeNextGamePosition = (
  value: unknown,
): BracketPosition | null => {
  const text = normalizeText(value);
  if (text === "top" || text === "away") return "top";
  if (text === "bottom" || text === "home") return "bottom";
  return null;
};

const normalizeVenue = (value: unknown) => {
  const record = asRecord(value);

  if (!record) {
    const name = asString(value);

    return name
      ? {
          id: null,
          name,
          city: null,
          state: null,
          indoor: null,
        }
      : null;
  }

  const addressRecord = asRecord(record.address);

  return {
    id: asString(getValue(record, ["id", "venueId"])) ?? null,
    name: asString(getValue(record, ["name", "fullName"])) ?? null,
    city:
      asString(getValue(record, ["city"])) ??
      asString(addressRecord?.city) ??
      null,
    state:
      asString(getValue(record, ["state"])) ??
      asString(addressRecord?.state) ??
      null,
    indoor: asBoolean(getValue(record, ["indoor", "isIndoor"])),
  };
};

const normalizeBracketGame = (
  value: unknown,
  index: number,
  region?: Pick<BracketRegion, "id" | "name">,
): BracketGame | null => {
  const record = asRecord(value);
  if (!record) return null;

  const roundOrderValue = asNumber(
    getValue(record, ["roundOrder", "round_order", "order"]),
  );
  const round = normalizeTournamentRound(
    getValue(record, ["round", "roundKey", "roundLabel", "label", "name"]),
    roundOrderValue,
  );
  const statusValue = getValue(record, ["status", "statusText", "state"]);
  const status = normalizeStatus(statusValue);
  const teamsRecord = getRecordValue(record, ["teams"]);
  const topTeam =
    normalizeTeam(getValue(record, ["topTeam", "top"])) ??
    (teamsRecord ? normalizeTeam(getValue(teamsRecord, ["top", "away"])) : null);
  const bottomTeam =
    normalizeTeam(getValue(record, ["bottomTeam", "bottom"])) ??
    (teamsRecord
      ? normalizeTeam(getValue(teamsRecord, ["bottom", "home"]))
      : null);
  const fallbackId =
    asString(getValue(record, ["id", "gameId", "eventId"])) ??
    `${region?.id ?? "bracket"}-${round}-${index}`;

  return {
    id: fallbackId,
    eventId:
      asString(getValue(record, ["eventId", "eventID", "externalEventId"])) ??
      asString(getValue(record, ["gameId"])) ??
      null,
    tournamentId: asString(getValue(record, ["tournamentId", "tournamentID"])),
    regionId:
      asString(getValue(record, ["regionId", "regionID"])) ??
      region?.id ??
      null,
    regionName:
      asString(getValue(record, ["regionName", "region"])) ??
      region?.name ??
      null,
    round,
    roundLabel: asString(getValue(record, ["roundLabel", "label", "name"])),
    roundOrder: roundOrderValue ?? ROUND_ORDER[round],
    gameOrder:
      asNumber(getValue(record, ["gameOrder", "game_order", "slot", "order"])) ??
      index + 1,
    bracketSlot:
      asNumber(getValue(record, ["bracketSlot", "bracket_slot", "slot"])) ??
      null,
    topTeam,
    bottomTeam,
    topSourceGameId: asString(
      getValue(record, ["topSourceGameId", "top_source_game_id"]),
    ),
    bottomSourceGameId: asString(
      getValue(record, ["bottomSourceGameId", "bottom_source_game_id"]),
    ),
    winnerTeamId: asString(getValue(record, ["winnerTeamId", "winnerId"])),
    nextGameId: asString(getValue(record, ["nextGameId", "next_game_id"])),
    nextGamePosition: normalizeNextGamePosition(
      getValue(record, ["nextGamePosition", "next_game_position"]),
    ),
    destinationRegionId: asString(
      getValue(record, ["destinationRegionId", "destination_region_id"]),
    ),
    destinationRound: (() => {
      const value = getValue(record, [
        "destinationRound",
        "destination_round",
      ]);

      return value === undefined || value === null
        ? null
        : normalizeTournamentRound(value);
    })(),
    destinationSeed: asNumber(
      getValue(record, ["destinationSeed", "destination_seed"]),
    ),
    destinationGameId: asString(
      getValue(record, [
        "destinationGameId",
        "destination_game_id",
        "nextGameId",
        "next_game_id",
      ]),
    ),
    destinationPosition: normalizeNextGamePosition(
      getValue(record, ["destinationPosition", "destination_position"]),
    ),
    date: asString(getValue(record, ["date", "startDate", "startTime"])),
    status,
    statusText: getStatusText(statusValue),
    venue: normalizeVenue(getValue(record, ["venue", "venueName"])),
    broadcast: (() => {
      const directBroadcast = asString(getValue(record, ["broadcast", "tv"]));
      if (directBroadcast) return directBroadcast;

      const broadcastList = asArray(getValue(record, ["broadcasts"]))
        .map(asString)
        .filter((item): item is string => Boolean(item))
        .join(" / ");

      return broadcastList || null;
    })(),
    headline: asString(getValue(record, ["headline", "description"])),
  };
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

const normalizeRegion = (value: unknown, index: number): BracketRegion | null => {
  const record = asRecord(value);
  if (!record) return null;

  const id =
    asString(getValue(record, ["id", "regionId", "regionID", "key"])) ??
    `region-${index + 1}`;
  const name =
    asString(getValue(record, ["name", "regionName", "label"])) ??
    `Region ${index + 1}`;
  const order = asNumber(getValue(record, ["order", "regionOrder"])) ?? index + 1;
  const side = normalizeSide(getValue(record, ["side"])) ?? "left";
  const verticalPosition =
    normalizeVerticalPosition(
      getValue(record, ["verticalPosition", "position", "vertical"]),
    ) ?? "top";

  const games = asArray(getValue(record, ["games", "matchups"]))
    .map((game, gameIndex) => normalizeBracketGame(game, gameIndex, { id, name }))
    .filter((game): game is BracketGame => Boolean(game))
    .filter((game) => REGIONAL_ROUNDS.includes(game.round));

  return {
    id,
    name,
    order,
    side,
    verticalPosition,
    games: sortBracketGames(games),
  };
};

const buildRegionsFromGames = (games: readonly BracketGame[]) => {
  const regionMap = new Map<string, BracketGame[]>();

  games
    .filter((game) => REGIONAL_ROUNDS.includes(game.round))
    .forEach((game) => {
      const key = game.regionId ?? game.regionName ?? "unassigned";
      const existing = regionMap.get(key) ?? [];
      existing.push(game);
      regionMap.set(key, existing);
    });

  return [...regionMap.entries()].map(([key, regionGames], index) => ({
    id: key,
    name: regionGames[0]?.regionName ?? `Region ${index + 1}`,
    order: index + 1,
    side: index < 2 ? ("left" as const) : ("right" as const),
    verticalPosition: index % 2 === 0 ? ("top" as const) : ("bottom" as const),
    games: sortBracketGames(regionGames),
  }));
};

export function sortBracketGames(
  games: readonly BracketGame[],
): BracketGame[] {
  return [...games].sort((a, b) => {
    if (a.roundOrder !== b.roundOrder) return a.roundOrder - b.roundOrder;
    if (a.gameOrder !== b.gameOrder) return a.gameOrder - b.gameOrder;

    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    const safeATime = Number.isNaN(aTime) ? 0 : aTime;
    const safeBTime = Number.isNaN(bTime) ? 0 : bTime;

    if (safeATime !== safeBTime) return safeATime - safeBTime;

    return a.id.localeCompare(b.id);
  });
}

export function groupGamesByRound(
  games: readonly BracketGame[],
): Record<TournamentRound, BracketGame[]> {
  return TOURNAMENT_ROUNDS.reduce(
    (acc, round) => {
      acc[round] = sortBracketGames(
        games.filter((game) => game.round === round),
      );
      return acc;
    },
    {} as Record<TournamentRound, BracketGame[]>,
  );
}

export function groupRegionGamesByRound(
  games: readonly BracketGame[],
): Record<TournamentRound, BracketGame[]> {
  return groupGamesByRound(games);
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

export function getBracketTeamDisplayName(team: BracketTeam | null): string {
  if (!team) return "TBD";

  return team.shortName || team.abbreviation || team.name;
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
      const roundLabel = getRoundDisplayLabel(sourceGame.round);
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
    game.status === "final" ||
    game.status === "post" ||
    statusText.includes("final") ||
    statusText.includes("complete")
  );
}

export function isLiveBracketGame(game: BracketGame): boolean {
  const statusText = normalizeText(game.statusText);

  if (isFinalBracketGame(game)) return false;

  return (
    game.status === "live" ||
    game.status === "in" ||
    statusText.includes("in progress") ||
    statusText.includes("halftime") ||
    statusText.includes("live")
  );
}

export function getWinningTeam(game: BracketGame): BracketTeam | null {
  if (!isFinalBracketGame(game)) return null;

  const teams = [game.topTeam, game.bottomTeam].filter(
    (team): team is BracketTeam => Boolean(team),
  );

  if (game.winnerTeamId) {
    const winner = teams.find(
      (team) =>
        String(team.id) === String(game.winnerTeamId) ||
        String(team.espnId) === String(game.winnerTeamId),
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
  return customLabel || ROUND_LABELS[round];
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
  return getRegionalGameCenterY(round, bracketSlot, layout) - layout.gameCardHeight / 2;
}

export function getRegionalRoundBaseSlots(
  round: TournamentRound,
): number {
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
  return Boolean(game.eventId && (game.topTeam || game.bottomTeam));
}

export function transformTournamentBracketResponse(
  response: TournamentBracketApiResponse,
  fallbackCompetition: TournamentBracketCompetition = "CBB",
): TournamentBracketData {
  const responseRecord = asRecord(response) ?? {};
  const rootCandidate =
    asRecord(responseRecord.bracket) ??
    asRecord(responseRecord.tournament) ??
    asRecord(responseRecord.data) ??
    responseRecord;
  const root =
    asRecord(rootCandidate.bracket) ??
    asRecord(rootCandidate.tournament) ??
    rootCandidate;
  const seasonValue = getValue(root, ["season", "seasonYear", "year"]);
  const seasonRecord = asRecord(seasonValue);
  const season =
    asNumber(seasonValue) ?? asNumber(seasonRecord?.year) ?? new Date().getFullYear();
  const competition = normalizeCompetition(
    getValue(root, ["competition", "league", "leagueKey", "sport"]),
    fallbackCompetition,
  );
  const rootGames = asArray(getValue(root, ["games", "events", "matchups"]))
    .map((game, index) => normalizeBracketGame(game, index))
    .filter((game): game is BracketGame => Boolean(game));
  const regionsFromApi = asArray(getValue(root, ["regions", "regionals"]))
    .map(normalizeRegion)
    .filter((region): region is BracketRegion => Boolean(region));
  const allRegionalGames = regionsFromApi.flatMap((region) => region.games);
  const allGames = [...rootGames, ...allRegionalGames];
  const regions =
    regionsFromApi.length > 0
      ? regionsFromApi.sort((a, b) => a.order - b.order)
      : buildRegionsFromGames(rootGames);
  const openingRoundGames = asArray(
    getValue(root, ["openingRoundGames", "openingGames", "firstFourGames"]),
  )
    .map((game, index) => normalizeBracketGame(game, index))
    .filter((game): game is BracketGame => Boolean(game));
  const finalFourGames = asArray(
    getValue(root, ["finalFourGames", "semifinalGames"]),
  )
    .map((game, index) => normalizeBracketGame(game, index))
    .filter((game): game is BracketGame => Boolean(game));
  const championshipGameRecord = getValue(root, [
    "championshipGame",
    "nationalChampionshipGame",
    "finalGame",
  ]);
  const championshipGame = normalizeBracketGame(championshipGameRecord, 0);
  const derivedOpeningGames = sortBracketGames(
    allGames.filter((game) => game.round === "OPENING"),
  );
  const derivedFinalFourGames = sortBracketGames(
    allGames.filter((game) => game.round === "FINAL_4"),
  );
  const derivedChampionshipGame =
    sortBracketGames(allGames.filter((game) => game.round === "CHAMPIONSHIP"))[0] ??
    null;
  const metadataRecord = asRecord(getValue(root, ["metadata"]));
  const normalizedOpeningRoundGames =
    openingRoundGames.length > 0
      ? sortBracketGames(openingRoundGames)
      : derivedOpeningGames;
  const normalizedFinalFourGames =
    finalFourGames.length > 0
      ? sortBracketGames(finalFourGames)
      : derivedFinalFourGames;
  const normalizedChampionshipGame =
    championshipGame ?? derivedChampionshipGame;

  return {
    tournamentId:
      asString(getValue(root, ["tournamentId", "id", "uid"])) ??
      null,
    tournamentName:
      asString(getValue(root, ["tournamentName", "name", "title"])) ??
      `${competition} Tournament`,
    season,
    competition,
    openingRoundLabel: asString(
      getValue(root, ["openingRoundLabel", "firstFourLabel"]),
    ),
    regions,
    openingRoundGames: normalizedOpeningRoundGames,
    finalFourGames: normalizedFinalFourGames,
    championshipGame: normalizedChampionshipGame,
    metadata: {
      source:
        asString(metadataRecord?.source) ??
        asString(getValue(root, ["source"])) ??
        "unknown",
      fetchedAt:
        asString(metadataRecord?.fetchedAt) ??
        asString(getValue(root, ["fetchedAt"])) ??
        "",
      totalGames:
        asNumber(metadataRecord?.totalGames) ??
        normalizedOpeningRoundGames.length +
          regions.reduce((count, region) => count + region.games.length, 0) +
          normalizedFinalFourGames.length +
          (normalizedChampionshipGame ? 1 : 0),
      unresolvedConnections: asArray(metadataRecord?.unresolvedConnections),
      warnings: asStringArray(metadataRecord?.warnings),
    },
  };
}
