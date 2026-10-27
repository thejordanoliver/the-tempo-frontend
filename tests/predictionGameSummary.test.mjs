import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";

const jsx = (type, props) => ({ type, props });
const colors = { text: "text", green: "green", lightRed: "red", red: "red" };
const modules = {
  "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
  react: { useMemo: (factory) => factory() },
  "react-native": {
    Image: "Image",
    View: "View",
    Text: "Text",
    StyleSheet: { create: (styles) => styles, hairlineWidth: 1 },
  },
  "@expo/vector-icons": { Ionicons: "Icon" },
  "constants/styles": {
    Colors: { dark: colors, light: colors },
    globalStyles: () => ({}),
  },
  "styles/GamecardStyles/GameCardStyles": { GameCardStyles: () => ({}) },
  "styles/FanPredictionStyles/FanPredictionHistoryRowStyles": {
    FanPredictionHistoryRowStyles: () => ({}),
  },
  "components/Sports/Baseball/GameDetails/BasesIndicator": {
    BasesIndicator: "Bases",
  },
  "utils/common/dateUtils": {
    safeDate: (value) => value,
    formatDate: () => "Oct 23",
    formatTime: () => "7:00 PM",
  },
  "utils/games/predictionTeamHelpers": {
    getPredictionTeamHelpers: () => undefined,
  },
  dayjs,
  "dayjs/plugin/timezone": timezone,
  "dayjs/plugin/utc": utc,
};
modules["@/constants/styles"] = modules["constants/styles"];
function load(file) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name.startsWith("assets/")) return name;
      assert(name in modules, name);
      return modules[name];
    },
  });
  return exports;
}
modules["utils/games/games"] = load("utils/games/games.ts");
modules["utils/games/gameTeamIdentity"] = load(
  "utils/games/gameTeamIdentity.ts",
);
const Summary = load(
  "components/FanPrediction/PredictionGameSummary.tsx",
).default;
function nodes(tree) {
  if (tree == null || typeof tree === "boolean") return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return typeof tree === "object"
    ? [tree, ...nodes(tree.props?.children)]
    : [String(tree)];
}
function render(sport, game = {}, overrides = {}) {
  const team = (id) => ({
    id,
    name: `Team ${id}`,
    code: `T${id}`,
    logo: `https://example.com/${id}.png`,
    score: 0,
    record: "4-1",
  });
  return nodes(
    Summary({
      isDark: true,
      pick: {
        sport,
        league: "unknown",
        startsAt: "2026-10-23T23:00:00Z",
        state: "in",
        outcome: "pending",
        pickedTeamId: "1",
        home: team("1"),
        away: team("2"),
        ...overrides,
        ...(game == null
          ? {}
          : {
              game: {
                sport,
                home: team(1),
                away: team(2),
                status: {
                  state: "in",
                  description: "In Progress",
                  period: 4,
                  displayClock: "3:21",
                },
                ...game,
              },
            }),
      },
    }),
  );
}

test("women's college basketball uses quarters; men's college basketball uses halves", () => {
  assert(render("basketball", {}, { league: "wcbb" }).includes("4th"));
  assert(render("basketball", {}, { league: "mcbb" }).includes("2OT"));
});
test("hockey and soccer follow their own period labels", () => {
  assert(render("hockey").includes("OT"));
  assert(render("soccer").includes("ET"));
});
test("baseball keeps zero scores and outs and uses the shared base indicator", () => {
  const content = render("baseball", {
    status: { state: "in", shortDetail: "Top 4th" },
    situation: { outs: 0, onFirst: false, onSecond: true, onThird: false },
  });
  assert(content.includes("Top 4th"));
  assert(content.includes("0"));
  assert(content.some((node) => node.props?.accessibilityLabel === "0 outs"));
  assert.equal(
    content.find((node) => node.type === "Bases").props.bases.onSecond,
    true,
  );
});
test("football shows down and distance and matches numeric possession IDs to saved strings", () => {
  const content = render("football", {
    situation: {
      possession: "1",
      downDistanceText: "3rd & 1",
      isRedZone: true,
    },
  });
  assert(content.includes("3rd & 1"));
  assert.equal(
    content.filter((node) => node.props?.accessibilityLabel === "Possession")
      .length,
    1,
  );
  assert(content.includes("PICKED"));
});
test("volleyball separates sets won from the current set's points", () => {
  const content = render("volleyball", {
    home: { id: 1, setsWon: 2, score: 99 },
    away: { id: 2, setsWon: 1, score: 88 },
    status: { state: "in", period: 3 },
    sets: [{ number: 3, away: 0, home: 4, completed: false }],
  });
  assert(content.includes("Set 3"));
  assert(content.includes("2"));
  assert(content.includes("0"));
  assert(content.includes("4"));
  assert(!content.includes("99"));
  assert(!content.includes("88"));
});
test("MMA matches fighters by ID and shows records, photos, and the method of victory", () => {
  const content = render(
    "mma",
    {
      status: { state: "post" },
      method: "Submission",
      competitors: [
        { id: "2", shortName: "Second", record: "9-2", headshot: "second.png" },
        { id: "1", shortName: "First", record: "10-1", headshot: "first.png" },
      ],
    },
    { winnerId: "1" },
  );
  assert(content.includes("First"));
  assert(content.includes("Second"));
  assert(content.includes("10-1"));
  assert(content.includes("SUB"));
  assert(
    content.some(
      (node) => node.type === "Image" && node.props.source.uri === "first.png",
    ),
  );
});
test("legacy predictions keep their scores, team logos, and fallback status", () => {
  const content = render("basketball", null, { state: "pre" });
  assert(content.includes("4-1"));
  assert(content.includes("7:00 PM"));
  assert(
    content.some(
      (node) =>
        node.type === "Image" &&
        node.props.source.uri === "https://example.com/1.png",
    ),
  );
});
test("missing game state does not invent a final score or schedule", () => {
  const content = render("basketball", null, {
    state: null,
    statusDescription: "",
  });
  assert(content.includes("Details unavailable"));
  assert(!content.includes("Final"));
  assert(!content.includes("7:00 PM"));
});
test("suspended games take precedence over live clocks and baseball base state", () => {
  const content = render("baseball", {
    status: {
      state: "in",
      description: "Suspended",
      shortDetail: "Top 4th",
      displayClock: "3:21",
    },
    situation: { outs: 1, onFirst: true, onSecond: false, onThird: false },
  });
  assert(content.includes("Suspended"));
  assert(!content.some((node) => node.type === "Bases"));
});
