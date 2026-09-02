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
  process.cwd(),
  "components/Sports/Basketball/CBBTournament/tournamentBracket.utils.ts",
));

const {
  BRACKET_LAYOUT,
  canNavigateToBracketGame,
  createBracketGameMap,
  getBracketPositionLabel,
  getBracketRegionPlacement,
  getOpeningRoundDestinationLabel,
  getRegionalGameCenterY,
  getTournamentSourceGameIds,
  getVisualRoundsForSide,
  getWinningBracketTeam,
  groupRegionGamesByRound,
  normalizeTournamentForBracket,
  orderFinalFourGamesForChampionship,
} = utils;

const roundOrder = {
  OPENING: 0,
  ROUND_OF_64: 1,
  ROUND_OF_32: 2,
  SWEET_16: 3,
  ELITE_8: 4,
  FINAL_4: 5,
  CHAMPIONSHIP: 6,
};

const roundLabel = {
  OPENING: "First Four",
  ROUND_OF_64: "Round of 64",
  ROUND_OF_32: "Round of 32",
  SWEET_16: "Sweet 16",
  ELITE_8: "Elite Eight",
  FINAL_4: "Final Four",
  CHAMPIONSHIP: "National Championship",
};

const team = (id, name, seed, score = null, winner = null) => ({
  id,
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
  tournamentId: "2026-cbb",
  regionId: overrides.regionId ?? null,
  regionName: overrides.regionName ?? null,
  round: overrides.round,
  roundLabel: roundLabel[overrides.round],
  roundOrder: roundOrder[overrides.round],
  gameOrder: overrides.gameOrder ?? overrides.bracketSlot ?? 1,
  bracketSlot: overrides.bracketSlot ?? null,
  topTeam: overrides.topTeam ?? team(`${overrides.id}-top`, "Top", 1),
  bottomTeam:
    overrides.bottomTeam ?? team(`${overrides.id}-bottom`, "Bottom", 16),
  winnerTeamId: overrides.winnerTeamId ?? null,
  topSourceGameId: overrides.topSourceGameId ?? null,
  bottomSourceGameId: overrides.bottomSourceGameId ?? null,
  nextGameId: overrides.nextGameId ?? null,
  nextGamePosition: overrides.nextGamePosition ?? null,
  destinationRegionId: overrides.destinationRegionId ?? null,
  destinationRound: overrides.destinationRound ?? null,
  destinationSeed: overrides.destinationSeed ?? null,
  date: overrides.date ?? null,
  status: overrides.status ?? "scheduled",
  statusText: overrides.statusText ?? null,
  venue: null,
  broadcast: overrides.broadcast ?? null,
  headline: null,
});

function buildRegion(id, name, order, side, verticalPosition) {
  const makeId = (round, slot) => `${id}-${round}-${slot}`;
  const round64 = Array.from({ length: 8 }, (_, index) => {
    const slot = index + 1;
    const targetSlot = Math.ceil(slot / 2);
    return game({
      id: makeId("r64", slot),
      regionId: id,
      regionName: name,
      round: "ROUND_OF_64",
      bracketSlot: slot,
      nextGameId: makeId("r32", targetSlot),
      nextGamePosition: slot % 2 === 1 ? "top" : "bottom",
    });
  });
  const round32 = Array.from({ length: 4 }, (_, index) => {
    const slot = index + 1;
    const targetSlot = Math.ceil(slot / 2);
    return game({
      id: makeId("r32", slot),
      regionId: id,
      regionName: name,
      round: "ROUND_OF_32",
      bracketSlot: slot,
      topSourceGameId: makeId("r64", slot * 2 - 1),
      bottomSourceGameId: makeId("r64", slot * 2),
      nextGameId: makeId("s16", targetSlot),
      nextGamePosition: slot % 2 === 1 ? "top" : "bottom",
    });
  });
  const sweet16 = Array.from({ length: 2 }, (_, index) => {
    const slot = index + 1;
    return game({
      id: makeId("s16", slot),
      regionId: id,
      regionName: name,
      round: "SWEET_16",
      bracketSlot: slot,
      topSourceGameId: makeId("r32", slot * 2 - 1),
      bottomSourceGameId: makeId("r32", slot * 2),
      nextGameId: makeId("e8", 1),
      nextGamePosition: slot === 1 ? "top" : "bottom",
    });
  });
  const elite8 = game({
    id: makeId("e8", 1),
    regionId: id,
    regionName: name,
    round: "ELITE_8",
    bracketSlot: 1,
    topSourceGameId: makeId("s16", 1),
    bottomSourceGameId: makeId("s16", 2),
  });

  return {
    id,
    name,
    order,
    side,
    verticalPosition,
    games: [...round64, ...round32, ...sweet16, elite8],
  };
}

const east = buildRegion("east", "East", 1, "left", "top");
const south = buildRegion("south", "South", 2, "left", "bottom");
const west = buildRegion("west", "West", 3, "right", "top");
const midwest = buildRegion("midwest", "Midwest", 4, "right", "bottom");

east.games.at(-1).nextGameId = "final-four-1";
east.games.at(-1).nextGamePosition = "top";
west.games.at(-1).nextGameId = "final-four-1";
west.games.at(-1).nextGamePosition = "bottom";
south.games.at(-1).nextGameId = "final-four-2";
south.games.at(-1).nextGamePosition = "top";
midwest.games.at(-1).nextGameId = "final-four-2";
midwest.games.at(-1).nextGamePosition = "bottom";

const finalFourGames = [
  game({
    id: "final-four-1",
    round: "FINAL_4",
    gameOrder: 1,
    topSourceGameId: "east-e8-1",
    bottomSourceGameId: "west-e8-1",
    nextGameId: "championship",
    nextGamePosition: "top",
  }),
  game({
    id: "final-four-2",
    round: "FINAL_4",
    gameOrder: 2,
    topSourceGameId: "south-e8-1",
    bottomSourceGameId: "midwest-e8-1",
    nextGameId: "championship",
    nextGamePosition: "bottom",
  }),
];

const championshipGame = game({
  id: "championship",
  round: "CHAMPIONSHIP",
  topSourceGameId: "final-four-1",
  bottomSourceGameId: "final-four-2",
  status: "final",
  statusText: "Final",
  topTeam: team("duke", "Duke", 1, 78, true),
  bottomTeam: team("uconn", "UConn", 2, 74, false),
  winnerTeamId: "duke",
});

const openingRoundGames = [east, south, west, midwest].map((region, index) =>
  game({
    id: `first-four-${index + 1}`,
    regionId: region.id,
    regionName: region.name,
    round: "OPENING",
    gameOrder: index + 1,
    nextGameId: `${region.id}-r64-1`,
    nextGamePosition: "bottom",
    destinationRegionId: region.id,
    destinationRound: "ROUND_OF_64",
    destinationSeed: 16,
  }),
);

const tournament = {
  tournamentId: "2026-cbb",
  tournamentName: "NCAA Men's Basketball Championship",
  season: 2026,
  competition: "CBB",
  openingRoundLabel: "First Four",
  regions: [east, south, west, midwest],
  openingRoundGames,
  finalFourGames,
  championshipGame,
  metadata: {
    source: "fixture",
    fetchedAt: "2026-04-08T00:00:00Z",
    totalGames: 67,
    warnings: [],
  },
};

const normalized = normalizeTournamentForBracket(tournament);
const allGamesById = createBracketGameMap(normalized);
assert.equal(allGamesById.size, 67);

const placement = getBracketRegionPlacement(normalized.regions);
assert.equal(placement.leftTop.name, "East");
assert.equal(placement.leftBottom.name, "South");
assert.equal(placement.rightTop.name, "West");
assert.equal(placement.rightBottom.name, "Midwest");

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

normalized.regions.forEach((region) => {
  const grouped = groupRegionGamesByRound(region.games);
  assert.equal(grouped.ROUND_OF_64.length, 8);
  assert.equal(grouped.ROUND_OF_32.length, 4);
  assert.equal(grouped.SWEET_16.length, 2);
  assert.equal(grouped.ELITE_8.length, 1);

  grouped.ROUND_OF_32.forEach((target) =>
    assert.equal(getTournamentSourceGameIds(target, grouped.ROUND_OF_64).length, 2),
  );
  grouped.SWEET_16.forEach((target) =>
    assert.equal(getTournamentSourceGameIds(target, grouped.ROUND_OF_32).length, 2),
  );
  assert.equal(
    getTournamentSourceGameIds(grouped.ELITE_8[0], grouped.SWEET_16).length,
    2,
  );
});

const eliteEightGames = normalized.regions.map(
  (region) => groupRegionGamesByRound(region.games).ELITE_8[0],
);
assert.deepEqual(
  getTournamentSourceGameIds(finalFourGames[0], eliteEightGames),
  ["east-e8-1", "west-e8-1"],
);
assert.deepEqual(
  getTournamentSourceGameIds(finalFourGames[1], eliteEightGames),
  ["south-e8-1", "midwest-e8-1"],
);
assert.deepEqual(
  getTournamentSourceGameIds(championshipGame, finalFourGames),
  ["final-four-1", "final-four-2"],
);
assert.deepEqual(
  orderFinalFourGamesForChampionship(
    [finalFourGames[1], finalFourGames[0]],
    championshipGame,
  ).map((finalFourGame) => finalFourGame.id),
  ["final-four-1", "final-four-2"],
);
assert.deepEqual(
  getTournamentSourceGameIds(
    game({ id: "unlinked", round: "SWEET_16" }),
    east.games,
  ),
  [],
);

assert.equal(openingRoundGames.length, 4);
assert.equal(
  getOpeningRoundDestinationLabel(openingRoundGames[2], normalized.regions, allGamesById),
  "Winner → West • Round of 64 • Seed 16 • Bottom slot",
);
assert.equal(
  allGamesById.get(openingRoundGames[2].nextGameId).id,
  "west-r64-1",
);

const rowHeight = BRACKET_LAYOUT.gameCardHeight + BRACKET_LAYOUT.baseVerticalGap;
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

assert.equal(getWinningBracketTeam(championshipGame).name, "Duke");
assert.equal(canNavigateToBracketGame(championshipGame), true);
assert.equal(canNavigateToBracketGame({ ...championshipGame, id: "" }), false);
assert.equal(
  getBracketPositionLabel(finalFourGames[0], "top", allGamesById),
  "Winner of Elite Eight Game 1",
);

console.log("Tournament bracket topology utility tests passed.");
