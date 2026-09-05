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
} = require(path.join(
  process.cwd(),
  "components/Sports/Basketball/tournamentBracket.utils.ts",
));

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

const game = ({
  id,
  round,
  homeTeam,
  awayTeam,
  winnerTeamId = null,
}) => ({
  id,
  tournamentId: "2026-cbb",
  regionId: "east",
  regionName: "East",
  round,
  roundLabel: round,
  roundOrder: 1,
  date: null,
  status: "final",
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
  getSourceGameDisplayTeams(
    championship,
    semifinalOne,
    semifinalTwo,
  ).map((displayTeam) => displayTeam?.id),
  ["semi-one-winner", "semi-two-winner"],
);

console.log("Tournament bracket display-order tests passed.");
