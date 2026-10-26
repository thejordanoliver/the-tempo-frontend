const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;

  module._compile(output, filename);
};

const {
  getFinalFourDisplayTeams,
  getRegionalDisplayTeams,
  getSourceGameDisplayTeams,
} = require(
  path.join(process.cwd(), "utils/brackets/tournamentBracket.utils.ts"),
);

const team = (id, name, seed, homeAway, winner = null) => ({
  id,
  name,
  shortName: name,
  code: name.slice(0, 4).toUpperCase(),
  logo: null,
  seed,
  score: null,
  winner,
  homeAway,
});

const game = ({ id, round, homeTeam, awayTeam, winnerTeamId = null }) => ({
  league: {
    id: 10,
    uid: "s:40~l:41",
    code: "mcbb",
    name: "Men's College Basketball",
    slug: "mens-college-basketball",
  },
  id,
  tournamentId: "2026-mcbb",
  regionId: "east",
  regionName: "East",
  round,
  roundLabel: round,
  roundOrder: 1,
  date: null,
  status: {
    state: "post",
    description: "Final",
    detail: "Final",
    shortDetail: "Final",
    period: 2,
    clock: "0:00",
    displayClock: "0:00",
    completed: true,
  },
  statusText: "Final",
  homeTeam,
  awayTeam,
  winnerTeamId,
  venue: null,
  broadcast: null,
  headline: null,
});

const arizona = team("arizona", "Arizona", 4, "home");
const oregon = team("oregon", "Oregon", 5, "away");
const oregonArizona = game({
  id: "oregon-arizona",
  round: "ROUND_OF_32",
  homeTeam: arizona,
  awayTeam: oregon,
});

assert.deepEqual(
  getRegionalDisplayTeams(oregonArizona, "ROUND_OF_32", 1).map(
    (displayTeam) => displayTeam?.id,
  ),
  ["oregon", "arizona"],
);
assert.equal(oregonArizona.homeTeam, arizona);
assert.equal(oregonArizona.awayTeam, oregon);

const dukeBaylor = game({
  id: "duke-baylor",
  round: "ROUND_OF_32",
  homeTeam: team("baylor", "Baylor", 9, "home"),
  awayTeam: team("duke", "Duke", 1, "away"),
});
assert.deepEqual(
  getRegionalDisplayTeams(dukeBaylor, "ROUND_OF_32", 0).map(
    (displayTeam) => displayTeam?.id,
  ),
  ["duke", "baylor"],
);

const roundOf64 = game({
  id: "oregon-liberty",
  round: "ROUND_OF_64",
  homeTeam: team("liberty", "Liberty", 12, "home"),
  awayTeam: team("oregon", "Oregon", 5, "away"),
});
assert.deepEqual(
  getRegionalDisplayTeams(roundOf64, "ROUND_OF_64", 2).map(
    (displayTeam) => displayTeam?.id,
  ),
  ["oregon", "liberty"],
);

const incomplete = game({
  id: "incomplete",
  round: "ROUND_OF_32",
  homeTeam: arizona,
  awayTeam: team("unknown", "TBD", null, "away"),
});
assert.deepEqual(
  getRegionalDisplayTeams(incomplete, "ROUND_OF_32", 1).map(
    (displayTeam) => displayTeam?.id,
  ),
  ["unknown", "arizona"],
);

const regionalOrder = new Map([
  ["east-champion", 0],
  ["south-champion", 1],
]);
const finalFour = game({
  id: "final-four-one",
  round: "FINAL_4",
  homeTeam: team("south-champion", "South", 2, "home"),
  awayTeam: team("east-champion", "East", 1, "away"),
});
assert.deepEqual(
  getFinalFourDisplayTeams(finalFour, regionalOrder).map(
    (displayTeam) => displayTeam?.id,
  ),
  ["east-champion", "south-champion"],
);

const semifinalOne = game({
  id: "semifinal-one",
  round: "FINAL_4",
  homeTeam: team("semi-one-loser", "Loser One", 3, "home"),
  awayTeam: team("semi-one-winner", "Winner One", 1, "away", true),
  winnerTeamId: "semi-one-winner",
});
const semifinalTwo = game({
  id: "semifinal-two",
  round: "FINAL_4",
  homeTeam: team("semi-two-winner", "Winner Two", 2, "home", true),
  awayTeam: team("semi-two-loser", "Loser Two", 4, "away"),
  winnerTeamId: "semi-two-winner",
});
const championship = game({
  id: "championship",
  round: "CHAMPIONSHIP",
  homeTeam: team("semi-two-winner", "Winner Two", 2, "home"),
  awayTeam: team("semi-one-winner", "Winner One", 1, "away"),
});
assert.deepEqual(
  getSourceGameDisplayTeams(championship, semifinalOne, semifinalTwo).map(
    (displayTeam) => displayTeam?.id,
  ),
  ["semi-one-winner", "semi-two-winner"],
);

const {
  buildRegionRoundSlots,
  getRegionalTeamOrder,
  getOrderedFinalFourGames,
  getFinalFourRegionLayout,
} = require(
  path.join(process.cwd(), "utils/brackets/tournamentBracketGames.ts"),
);
const { getWinnerTeam } = require(
  path.join(process.cwd(), "utils/brackets/tournamentBracket.utils.ts"),
);
const { getTournamentGameState } = require(
  path.join(process.cwd(), "utils/brackets/tournamentGameStatus.ts"),
);

// A live leader is not a bracket winner, even if a stale winner flag is present.
const scheduled = {
  ...semifinalOne,
  status: { state: "pre", description: "Scheduled", completed: false },
};
assert.equal(getWinnerTeam(scheduled), null);
assert.equal(getWinnerTeam(semifinalOne)?.id, "semi-one-winner");
for (const [state, description, expected] of [
  ["pre", "Scheduled", "scheduled"],
  ["in", "In Progress", "live"],
  ["in", "Halftime", "halftime"],
  ["in", "End of Period", "endOfPeriod"],
  ["pre", "Canceled", "interrupted"],
  ["pre", "Postponed", "interrupted"],
  ["in", "Delayed", "interrupted"],
  ["post", "Final", "final"],
]) {
  assert.equal(
    getTournamentGameState({ ...semifinalOne, status: { state, description } }),
    expected,
  );
}

const region = (id, order, games) => ({ id, name: id, order, games });
const firstRound = game({
  id: "seven-ten",
  round: "ROUND_OF_64",
  homeTeam: team("seven", "Seven", 7, "home", true),
  awayTeam: team("ten", "Ten", 10, "away"),
});
const seedlessNextRound = game({
  id: "seedless",
  round: "ROUND_OF_32",
  homeTeam: team("seven", "Seven", null, "home"),
  awayTeam: team("unknown", "Unknown", null, "away"),
});
const slots = buildRegionRoundSlots(
  region("east", 0, [seedlessNextRound, firstRound]),
);
assert.equal(slots.ROUND_OF_64[6]?.id, "seven-ten");
assert.equal(slots.ROUND_OF_32[3]?.id, "seedless");
assert.equal(slots.ROUND_OF_32[0], undefined);

// Region membership keeps semifinal feeders ordered even without Elite Eight data.
const east = region("east", 0, [
  game({
    id: "east-round",
    round: "ROUND_OF_64",
    homeTeam: finalFour.awayTeam,
    awayTeam: null,
  }),
]);
const south = region("south", 1, [
  game({
    id: "south-round",
    round: "ROUND_OF_64",
    homeTeam: finalFour.homeTeam,
    awayTeam: null,
  }),
]);
const teamOrder = getRegionalTeamOrder([east, south]);
assert.deepEqual(
  getFinalFourDisplayTeams(finalFour, teamOrder).map((t) => t?.id),
  ["east-champion", "south-champion"],
);
assert.deepEqual(
  getOrderedFinalFourGames([finalFour], teamOrder).map((g) => g.id),
  ["final-four-one"],
);
assert.deepEqual(
  getFinalFourRegionLayout([east, south], [finalFour], teamOrder).map(
    (r) => r?.id ?? null,
  ),
  ["east", "south", null, null],
);
const missingRegionSemifinal = {
  ...finalFour,
  homeTeam: team("missing", "Missing", null, "home"),
};
assert.deepEqual(
  getFinalFourRegionLayout(
    [east],
    [missingRegionSemifinal],
    getRegionalTeamOrder([east]),
  ).map((r) => r?.id ?? null),
  [null, "east", null, null],
);

console.log(
  "Tournament bracket ordering, feeder, winner, and status tests passed.",
);
