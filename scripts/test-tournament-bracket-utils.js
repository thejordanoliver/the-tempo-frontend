const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;

  module._compile(output, filename);
};

const utils = require(path.join(
  __dirname,
  "../components/Sports/Basketball/TournamentBracket/tournamentBracket.utils.ts",
));

const {
  BRACKET_LAYOUT,
  canNavigateToBracketGame,
  createBracketGameMap,
  getBracketPositionLabel,
  getBracketRegionPlacement,
  getOpeningRoundDestinationLabel,
  getRegionalGameCenterY,
  getVisualRoundsForSide,
  getWinningBracketTeam,
  getWinningTeam,
  groupRegionGamesByRound,
  isLiveBracketGame,
  normalizeTournamentForBracket,
} = utils;

const team = (id, name, seed, score, winner = false) => ({
  id,
  espnId: id,
  name,
  shortName: name,
  abbreviation: name.slice(0, 3).toUpperCase(),
  logo: null,
  seed,
  score,
  winner,
});

const game = (overrides) => ({
  id: overrides.id,
  eventId: overrides.eventId ?? overrides.id,
  tournamentId: "t-2025",
  regionId: overrides.regionId ?? "south",
  regionName: overrides.regionName ?? "South",
  round: overrides.round,
  roundLabel: null,
  roundOrder: overrides.roundOrder ?? 1,
  gameOrder: overrides.gameOrder ?? overrides.bracketSlot ?? 1,
  bracketSlot: overrides.bracketSlot ?? null,
  topTeam: overrides.topTeam ?? team("top", "Top", 1, null),
  bottomTeam: overrides.bottomTeam ?? team("bottom", "Bottom", 16, null),
  winnerTeamId: overrides.winnerTeamId ?? null,
  topSourceGameId: overrides.topSourceGameId ?? null,
  bottomSourceGameId: overrides.bottomSourceGameId ?? null,
  nextGameId: overrides.nextGameId ?? null,
  nextGamePosition: overrides.nextGamePosition ?? null,
  destinationRegionId: overrides.destinationRegionId ?? null,
  destinationRound: overrides.destinationRound ?? null,
  destinationSeed: overrides.destinationSeed ?? null,
  destinationGameId: overrides.destinationGameId ?? null,
  destinationPosition: overrides.destinationPosition ?? null,
  date: overrides.date ?? null,
  status: overrides.status ?? "scheduled",
  statusText: overrides.statusText ?? null,
  venue: null,
  broadcast: null,
  headline: null,
});

const regionalGames = [
  game({ id: "r64-1", round: "ROUND_OF_64", bracketSlot: 1 }),
  game({ id: "r64-2", round: "ROUND_OF_64", bracketSlot: 2 }),
  game({
    id: "r32-1",
    round: "ROUND_OF_32",
    roundOrder: 2,
    bracketSlot: 1,
    topSourceGameId: "r64-1",
    bottomSourceGameId: "r64-2",
  }),
  game({
    id: "s16-1",
    round: "SWEET_16",
    roundOrder: 3,
    bracketSlot: 1,
    topSourceGameId: "r32-1",
  }),
  game({
    id: "e8-1",
    round: "ELITE_8",
    roundOrder: 4,
    bracketSlot: 1,
  }),
];

const regions = [
  {
    id: "south",
    name: "South",
    order: 1,
    side: "left",
    verticalPosition: "top",
    games: regionalGames,
  },
  {
    id: "midwest",
    name: "Midwest",
    order: 2,
    side: "left",
    verticalPosition: "bottom",
    games: [],
  },
  {
    id: "east",
    name: "East",
    order: 3,
    side: "right",
    verticalPosition: "top",
    games: [],
  },
  {
    id: "west",
    name: "West",
    order: 4,
    side: "right",
    verticalPosition: "bottom",
    games: [],
  },
];

const championship = game({
  id: "title",
  round: "CHAMPIONSHIP",
  roundOrder: 6,
  status: "final",
  statusText: "Final",
  topTeam: team("florida", "Florida", 1, 65, true),
  bottomTeam: team("houston", "Houston", 1, 63, false),
  winnerTeamId: "florida",
});

const tournament = {
  tournamentId: "2025-cbb",
  tournamentName: "NCAA Men's Basketball",
  season: 2025,
  competition: "CBB",
  openingRoundLabel: "First Four",
  regions,
  openingRoundGames: [
    game({
      id: "first-four",
      round: "OPENING",
      destinationRegionId: "south",
      destinationSeed: 16,
    }),
  ],
  finalFourGames: [
    game({
      id: "ff-1",
      round: "FINAL_4",
      roundOrder: 5,
      topSourceGameId: "e8-1",
    }),
  ],
  championshipGame: championship,
  metadata: {
    source: "fixture",
    fetchedAt: "2025-04-08T00:00:00Z",
    totalGames: 7,
    unresolvedConnections: [],
    warnings: [],
  },
};

const placement = getBracketRegionPlacement(regions);
assert.equal(placement.leftTop.name, "South");
assert.equal(placement.leftBottom.name, "Midwest");
assert.equal(placement.rightTop.name, "East");
assert.equal(placement.rightBottom.name, "West");

assert.deepEqual(getVisualRoundsForSide("left"), [
  "ROUND_OF_64",
  "ROUND_OF_32",
  "SWEET_16",
  "ELITE_8",
]);
assert.deepEqual(getVisualRoundsForSide("right"), [
  "ELITE_8",
  "SWEET_16",
  "ROUND_OF_32",
  "ROUND_OF_64",
]);

const grouped = groupRegionGamesByRound(regionalGames);
assert.equal(grouped.ROUND_OF_64.length, 2);
assert.equal(grouped.ROUND_OF_32.length, 1);

const rowHeight = BRACKET_LAYOUT.gameCardHeight + BRACKET_LAYOUT.baseVerticalGap;
assert.equal(
  getRegionalGameCenterY("ROUND_OF_64", 1, BRACKET_LAYOUT),
  BRACKET_LAYOUT.gameCardHeight / 2,
);
assert.equal(
  getRegionalGameCenterY("ROUND_OF_64", 2, BRACKET_LAYOUT),
  BRACKET_LAYOUT.gameCardHeight / 2 + rowHeight,
);
assert.equal(
  getRegionalGameCenterY("ROUND_OF_32", 1, BRACKET_LAYOUT),
  (getRegionalGameCenterY("ROUND_OF_64", 1, BRACKET_LAYOUT) +
    getRegionalGameCenterY("ROUND_OF_64", 2, BRACKET_LAYOUT)) /
    2,
);
assert.equal(
  getRegionalGameCenterY("SWEET_16", 1, BRACKET_LAYOUT),
  (getRegionalGameCenterY("ROUND_OF_32", 1, BRACKET_LAYOUT) +
    getRegionalGameCenterY("ROUND_OF_32", 2, BRACKET_LAYOUT)) /
    2,
);
assert.equal(
  getRegionalGameCenterY("ELITE_8", 1, BRACKET_LAYOUT),
  (getRegionalGameCenterY("SWEET_16", 1, BRACKET_LAYOUT) +
    getRegionalGameCenterY("SWEET_16", 2, BRACKET_LAYOUT)) /
    2,
);

assert.equal(getWinningBracketTeam(championship).name, "Florida");
assert.equal(
  getWinningTeam({ ...championship, status: "live", statusText: "In Progress" }),
  null,
);
assert.equal(isLiveBracketGame({ ...championship, status: "live", statusText: "In Progress" }), true);

const gameById = createBracketGameMap(tournament);
assert.equal(
  getBracketPositionLabel(
    game({
      id: "future",
      round: "SWEET_16",
      topTeam: null,
      topSourceGameId: "r32-1",
    }),
    "top",
    gameById,
  ),
  "Winner of Round of 32 Game 1",
);
assert.equal(
  getOpeningRoundDestinationLabel(tournament.openingRoundGames[0], regions),
  "Winner advanced to South, No. 16 slot",
);

assert.equal(canNavigateToBracketGame(championship), true);
assert.equal(
  canNavigateToBracketGame({
    ...championship,
    topTeam: null,
    bottomTeam: null,
  }),
  true,
);
assert.equal(
  canNavigateToBracketGame({
    ...championship,
    id: "",
  }),
  false,
);

assert.equal(getBracketRegionPlacement(regions.slice(0, 1)).leftTop.name, "South");
assert.equal(getBracketRegionPlacement(regions.slice(0, 1)).rightTop, null);
assert.equal(
  getWinningBracketTeam({ ...championship, winnerTeamId: null }).name,
  "Florida",
);
assert.equal(createBracketGameMap({ ...tournament, championshipGame: null }).has("title"), false);

const normalizedTournament = normalizeTournamentForBracket({
  ...tournament,
  competition: "wcbb",
  regions: [
    {
      id: "nested",
      name: "Nested",
      rounds: [
        {
          round: "ROUND_OF_64",
          roundLabel: "First Round",
          games: [regionalGames[0]],
        },
      ],
    },
  ],
  openingRoundGames: [],
  finalFourGames: [],
  championshipGame: null,
});

assert.equal(normalizedTournament.competition, "WCBB");
assert.equal(normalizedTournament.regions[0].games[0].id, "r64-1");

console.log("Tournament bracket utility tests passed.");
