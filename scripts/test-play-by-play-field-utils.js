/* global __dirname */

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
  "../components/Sports/Football/GameDetails/play-by-play-field-utils.ts",
));

const {
  buildFootballPlayRoute,
  detectScoringPlay,
  getFootballFieldPointForYardLine,
  getFootballPlayAnimationKey,
  getFootballPlayCategory,
  getFootballPlayRoutePoint,
  getDownDistanceLabel,
  getFirstDownFieldPosition,
  getFirstDownYardLine,
  getOffenseSide,
  getPlayFieldPosition,
  getPlayIdentity,
  getScoringAnimationKey,
  selectLatestPlay,
} = utils;

const teamIdentity = {
  homeEspnId: "20",
  awayEspnId: "10",
};

assert.equal(
  getPlayFieldPosition({ end: { yardLine: 25 } }, "away").percent,
  25,
);
assert.equal(
  getPlayFieldPosition({ end: { yardLine: 25 } }, "home").percent,
  25,
);
assert.equal(
  getPlayFieldPosition({ start: { yardLine: 125 } }, "away").percent,
  100,
);
assert.equal(
  getFirstDownFieldPosition({ end: { yardLine: 30 } }, "away", 10).percent,
  40,
);
assert.equal(
  getFirstDownFieldPosition({ end: { yardLine: 94 } }, "home", 12).percent,
  82,
);
assert.equal(
  getFirstDownFieldPosition({ end: { yardLine: 30 } }, "away", null).percent,
  null,
);
assert.equal(
  getDownDistanceLabel({ start: { down: 3, distance: 0 } }),
  "3rd & Goal",
);
assert.equal(
  getDownDistanceLabel(
    { end: { down: 2, distance: 6 }, start: { down: 1, distance: 10 } },
    "1st & 10 at SF 47",
  ),
  "2nd & 6",
);
assert.equal(
  getDownDistanceLabel(
    { start: { shortDownDistanceText: "& Goal" } },
    "3rd & 11 at SF 47",
  ),
  "3rd & 11",
);

const currentSelection = selectLatestPlay(
  [
    {
      id: "current-drive",
      plays: [
        {
          id: "current-play",
          sequenceNumber: "30",
          text: "Current drive snap",
        },
      ],
    },
  ],
  [
    {
      id: "previous-drive",
      plays: [
        {
          id: "previous-play",
          sequenceNumber: "40",
          text: "Previous drive snap",
        },
      ],
    },
  ],
);

assert.equal(currentSelection.source, "current");
assert.equal(currentSelection.play.id, "current-play");

const fallbackSelection = selectLatestPlay(
  [{ id: "empty-current-drive", plays: [] }],
  [
    {
      id: "older-drive",
      plays: [{ id: "older-play", sequenceNumber: "10" }],
    },
    {
      id: "newer-drive",
      plays: [{ id: "newer-play", sequenceNumber: "20" }],
    },
  ],
);

assert.equal(fallbackSelection.source, "previous");
assert.equal(fallbackSelection.drive.id, "newer-drive");
assert.equal(fallbackSelection.play.id, "newer-play");

const touchdown = detectScoringPlay(
  {
    id: "td-play",
    team: { espnId: "20" },
    scoreValue: 6,
    type: { abbreviation: "TD" },
    isScore: true,
  },
  teamIdentity,
);

assert.equal(touchdown.type, "touchdown");
assert.equal(touchdown.scoringTeamSide, "home");
assert.equal(touchdown.highlightEndzone, "away");

const fieldGoal = detectScoringPlay(
  {
    id: "fg-play",
    team: { id: "10" },
    scoreValue: 3,
    result: "FG",
    isScore: true,
  },
  teamIdentity,
);

assert.equal(fieldGoal.type, "fieldGoal");
assert.equal(fieldGoal.scoringTeamSide, "away");
assert.equal(fieldGoal.highlightEndzone, "home");

assert.equal(
  detectScoringPlay(
    {
      id: "missed-fg",
      result: "MISSED FG",
      text: "Missed field goal is no good",
    },
    teamIdentity,
  ),
  null,
);

assert.equal(
  detectScoringPlay(
    {
      id: "safety",
      team: { espnId: "20" },
      scoringType: { displayName: "Safety" },
      scoreValue: 2,
      isScore: true,
    },
    teamIdentity,
  ).type,
  "safety",
);
assert.equal(
  detectScoringPlay(
    {
      id: "xp",
      team: { espnId: "20" },
      scoringType: { displayName: "Extra Point" },
      scoreValue: 1,
      isScore: true,
    },
    teamIdentity,
  ).type,
  "extraPoint",
);
assert.equal(
  detectScoringPlay(
    {
      id: "two-point",
      team: { espnId: "10" },
      text: "Two-point conversion is good",
      scoreValue: 2,
      isScore: true,
    },
    teamIdentity,
  ).type,
  "twoPointConversion",
);

const identityPlay = {
  id: "play-id",
  sequenceNumber: "99",
  text: "Stable identity",
};

assert.equal(getPlayIdentity(identityPlay), "99");
assert.equal(getPlayIdentity({ id: "same-id", text: "Before correction" }), "same-id");
assert.equal(getPlayIdentity({ id: "same-id", text: "After correction" }), "same-id");
assert.equal(
  getScoringAnimationKey(identityPlay, {
    type: "touchdown",
    label: "TOUCHDOWN",
    scoringTeamSide: "home",
    scoringTeamEspnId: "20",
    highlightEndzone: "away",
  }),
  "99:touchdown:20:",
);

const awayRushPlay = {
  id: "away-rush",
  type: { text: "Rush", abbreviation: "RUSH" },
  teamParticipants: [{ id: "10", type: "offense" }],
  start: { yardLine: 35, distance: 10 },
  end: { yardLine: 42 },
  statYardage: 7,
};
const awayRushRoute = buildFootballPlayRoute(awayRushPlay, "away");

assert.equal(getOffenseSide(awayRushPlay, null, teamIdentity), "away");
assert.equal(getFootballPlayCategory(awayRushPlay), "rush");
assert.equal(getFirstDownYardLine(35, 10, "away"), 45);
assert.ok(awayRushRoute.end.x > awayRushRoute.start.x);
assert.equal(awayRushRoute.isCurve, false);

const homeRushPlay = {
  id: "home-rush",
  type: { text: "Rush", abbreviation: "RUSH" },
  teamParticipants: [{ id: "20", type: "offense" }],
  start: { yardLine: 70, distance: 10 },
  end: { yardLine: 64 },
  statYardage: 6,
};
const homeRushRoute = buildFootballPlayRoute(homeRushPlay, "home");

assert.equal(getOffenseSide(homeRushPlay, null, teamIdentity), "home");
assert.equal(getFirstDownYardLine(70, 10, "home"), 60);
assert.ok(homeRushRoute.end.x < homeRushRoute.start.x);
assert.equal(homeRushRoute.isCurve, false);

const completedPassPlay = {
  id: "complete-pass",
  type: { text: "Pass Reception", abbreviation: "REC" },
  teamParticipants: [{ id: "10", type: "offense" }],
  start: { yardLine: 48, distance: 8 },
  end: { yardLine: 66 },
  statYardage: 18,
};
const completedPassRoute = buildFootballPlayRoute(completedPassPlay, "away");
const completedPassMidpoint = getFootballPlayRoutePoint(completedPassRoute, 0.5);

assert.equal(getFootballPlayCategory(completedPassPlay), "completedPass");
assert.equal(completedPassRoute.isCurve, true);
assert.ok(completedPassMidpoint.y < completedPassRoute.start.y);

const incompletePassPlay = {
  id: "incomplete-pass",
  type: { text: "Pass Incompletion" },
  teamParticipants: [{ id: "10", type: "offense" }],
  text: "Pass incomplete deep right",
  start: { yardLine: 50, distance: 10 },
  end: { yardLine: 50 },
  statYardage: 0,
};
const incompletePassRoute = buildFootballPlayRoute(incompletePassPlay, "away");

assert.equal(getFootballPlayCategory(incompletePassPlay), "incompletePass");
assert.equal(incompletePassRoute.isCurve, true);

const lossPlay = {
  id: "loss-play",
  type: { text: "Rush", abbreviation: "RUSH" },
  teamParticipants: [{ id: "10", type: "offense" }],
  start: { yardLine: 45, distance: 4 },
  end: { yardLine: 41 },
  statYardage: -4,
};
const lossRoute = buildFootballPlayRoute(lossPlay, "away");

assert.equal(getFootballPlayCategory(lossPlay), "loss");
assert.equal(lossRoute.isLoss, true);
assert.ok(lossRoute.end.x < lossRoute.start.x);

const midfieldPoint = getFootballFieldPointForYardLine(50);
const nextMidfieldPoint = getFootballFieldPointForYardLine(51);
const redZonePoint = getFootballFieldPointForYardLine(18);
const outsideRedZonePoint = getFootballFieldPointForYardLine(22);

assert.ok(midfieldPoint.x > 0);
assert.ok(nextMidfieldPoint.x > midfieldPoint.x);
assert.ok(redZonePoint.x < outsideRedZonePoint.x);

const touchdownPlay = {
  id: "td-route",
  type: { text: "Rush" },
  teamParticipants: [{ id: "20", type: "offense" }],
  team: { espnId: "20" },
  start: { yardLine: 8, distance: 8 },
  end: { yardLine: 0 },
  text: "Quarterback run for a touchdown",
  scoreValue: 6,
  isScore: true,
};
const touchdownDetection = detectScoringPlay(touchdownPlay, teamIdentity);
const touchdownRoute = buildFootballPlayRoute(touchdownPlay, "home");

assert.equal(touchdownDetection.highlightEndzone, "away");
assert.ok(touchdownRoute.end.x < touchdownRoute.start.x);

const fieldGoalPlay = {
  id: "fg-route",
  type: { text: "Field Goal Good", abbreviation: "FG" },
  teamParticipants: [{ id: "10", type: "offense" }],
  start: { yardLine: 78, distance: 7 },
  end: { yardLine: 100 },
  text: "37 yard field goal is GOOD",
  scoreValue: 3,
  isScore: true,
};
const fieldGoalRoute = buildFootballPlayRoute(fieldGoalPlay, "away");

assert.equal(getFootballPlayCategory(fieldGoalPlay), "fieldGoal");
assert.equal(fieldGoalRoute.isCurve, true);

const turnoverPlay = {
  id: "turnover-route",
  type: { text: "Pass Interception" },
  teamParticipants: [{ id: "10", type: "offense" }],
  start: { yardLine: 58, distance: 10 },
  end: { yardLine: 72 },
  text: "Pass intercepted at the 28",
};
const turnoverRoute = buildFootballPlayRoute(turnoverPlay, "away");

assert.equal(getFootballPlayCategory(turnoverPlay), "turnover");
assert.equal(turnoverRoute.isCurve, true);

assert.equal(
  getOffenseSide(
    {
      id: "possession-change-home",
      teamParticipants: [{ id: "20", type: "offense" }],
      start: { yardLine: 65 },
      end: { yardLine: 60 },
    },
    null,
    teamIdentity,
  ),
  "home",
);
assert.equal(
  buildFootballPlayRoute(
    {
      id: "missing-start",
      type: { text: "Rush" },
      end: { yardLine: 40 },
    },
    "away",
  ),
  null,
);
assert.equal(
  buildFootballPlayRoute(
    {
      id: "missing-end",
      type: { text: "Rush" },
      start: { yardLine: 40 },
    },
    "away",
  ),
  null,
);
assert.notEqual(
  getFootballPlayAnimationKey(
    {
      id: "corrected-play",
      type: { text: "Rush" },
      start: { yardLine: 40 },
      end: { yardLine: 44 },
      text: "Initial text",
    },
    "away",
    50,
  ),
  getFootballPlayAnimationKey(
    {
      id: "corrected-play",
      type: { text: "Rush" },
      start: { yardLine: 40 },
      end: { yardLine: 45 },
      text: "Corrected text",
    },
    "away",
    50,
  ),
);

console.log("PlayByPlayField helper tests passed");
