import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadModule(filename, modules = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require: (name) => (name in modules ? modules[name] : require(name)),
  });
  return exports;
}
const sharedStatus = loadModule("utils/games/gameStatus.ts");
const status = loadModule("utils/brackets/tournamentGameStatus.ts", {
  "../games/gameStatus": sharedStatus,
});
const gameFormatting = loadModule("utils/games/games.ts", {
  "@/constants/styles": { Colors: {} },
});
const dateFormatting = loadModule("utils/common/dateUtils.ts");
const jsx = (type, props) => ({ type, props });
const { GameStatus } = loadModule(
  "components/Sports/Basketball/Playoffs/MCBBTournament/GameStatus.tsx",
  {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": { Text: "Text", View: "View" },
    "styles/PlayoffStyles/MCBBTournamentBracketStyles": {
      MCBBTournamentBracketStyles: () => ({}),
    },
    "utils/brackets/tournamentGameStatus": status,
    "utils/games/games": gameFormatting,
    "utils/common/dateUtils": dateFormatting,
  },
);
function textNodes(value) {
  if (value == null || typeof value === "boolean") return [];
  if (Array.isArray(value)) return Array.from(value).flatMap(textNodes);
  if (typeof value === "object") return textNodes(value.props?.children);
  return [String(value)];
}
const renderStatus = (override, league = "mcbb", date = null) =>
  textNodes(
    GameStatus({
      game: {
        date,
        league: { code: league },
        status: {
          state: "in",
          description: "In Progress",
          period: 3,
          displayClock: "2:45",
          ...override,
        },
      },
      isDark: false,
      league,
    }),
  );

test("men's overtime uses halves and women's periods use quarters", () => {
  assert.deepEqual(renderStatus({}), ["OT", "2:45"]);
  assert.deepEqual(renderStatus({}, "wcbb"), ["3rd", "2:45"]);
  assert.deepEqual(renderStatus({ period: 5 }, "wcbb"), ["OT", "2:45"]);
  assert.deepEqual(renderStatus({ period: 4 }), ["2OT", "2:45"]);
});

test("halftime, postponed, and canceled labels override clocks and schedules", () => {
  assert.deepEqual(
    renderStatus({ description: "Halftime", displayClock: "0:00" }),
    ["Halftime"],
  );
  assert.deepEqual(renderStatus({ state: "pre", description: "Postponed" }), [
    "Postponed",
  ]);
  assert.deepEqual(renderStatus({ state: "pre", description: "Canceled" }), [
    "Canceled",
  ]);
  assert.deepEqual(renderStatus({ description: "End of Period", period: 2 }), [
    "End of 2nd",
  ]);
});

test("missing dates show TBD and completed games retain overtime details", () => {
  assert.deepEqual(renderStatus({ state: "pre", description: "Scheduled" }), [
    "TBD",
  ]);
  assert.deepEqual(
    renderStatus({ state: "pre", description: "Scheduled" }, "mcbb", "invalid"),
    ["TBD"],
  );
  assert.deepEqual(
    renderStatus({
      state: "post",
      completed: true,
      description: "Final",
      shortDetail: "Final/2OT",
    }),
    ["Final/2OT"],
  );
});

const bracketHelpers = loadModule("utils/brackets/tournamentBracket.utils.ts", {
  "../games/gameStatus": sharedStatus,
});
const { MatchupCard } = loadModule(
  "components/Sports/Basketball/Playoffs/MCBBTournament/MatchupCard.tsx",
  {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "react-native": { Text: "Text", View: "View" },
    "styles/PlayoffStyles/MCBBTournamentBracketStyles": {
      MCBBTournamentBracketStyles: () => ({}),
    },
    "utils/brackets/tournamentBracketLayout": {
      CARD_HEIGHT: 142,
      CARD_WIDTH: 176,
    },
    "utils/brackets/tournamentBracket.utils": bracketHelpers,
    "utils/games/gameStatus": sharedStatus,
    "./TeamRow": { TeamRow: "TeamRow" },
    "./GameStatus": { GameStatus: "GameStatus" },
  },
);
function findTeams(value) {
  if (value == null || typeof value !== "object") return [];
  if (Array.isArray(value)) return Array.from(value).flatMap(findTeams);
  return value.type === "TeamRow"
    ? [value.props]
    : findTeams(value.props?.children);
}

test("scheduled scores stay hidden and final scores show even without winner flags", () => {
  const game = {
    homeTeam: { id: "home", score: 72 },
    awayTeam: { id: "away", score: 66 },
    status: { state: "pre", description: "Scheduled", completed: false },
    winnerTeamId: null,
  };
  const render = (game) =>
    findTeams(MatchupCard({ game, isDark: false, league: "mcbb" }));
  assert(render(game).every((team) => team.showScore === false));
  assert(
    render({ ...game, status: { state: "post", completed: true } }).every(
      (team) => team.showScore === true,
    ),
  );
  assert(render(null).every((team) => team.showScore === false));
});
