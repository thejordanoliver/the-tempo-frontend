import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function loadLineScore() {
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const modules = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: { useMemo: (factory) => factory(), useState: (initial) => [initial, () => {}] },
    "react-native": {
      View: "View", Text: "Text", ScrollView: "ScrollView",
      StyleSheet: { hairlineWidth: 1, create: (styles) => styles },
    },
    "components/Headings/HeadingTwo": { default: "HeadingTwo", __esModule: true },
    "constants/styles": { Colors: { white: "white", black: "black", midTone: "gray", lightGray: "gray" } },
    "styles/GameDetailStyles/LineScoreStyles": { lineScoreStyles: () => ({}) },
    "../../../Skeletons/GameDetails/LineScoreSkeleton": { default: "Skeleton", __esModule: true },
  };
  const source = ts.transpileModule(fs.readFileSync("components/Sports/Basketball/GameDetails/LineScore.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, require(name) { assert(name in modules, name); return modules[name]; } });
  return exports.default;
}

function textNodes(value) {
  if (value == null || typeof value === "boolean") return [];
  if (Array.isArray(value)) return value.flatMap(textNodes);
  if (typeof value === "object") return textNodes(value.props?.children);
  return [String(value)];
}

test("the shared volleyball line score labels the fifth set and totals sets won", () => {
  const LineScore = loadLineScore();
  const tree = LineScore({
    league: "wcvb", isDark: true, state: "post", homeCode: "HOME", awayCode: "AWAY",
    linescore: { home: [25, 20, 25, 20, 15], away: [20, 25, 20, 25, 12] },
    homeSets: 3, awaySets: 2,
  });
  const content = textNodes(tree);
  assert(content.includes("Set Scores"));
  assert(content.includes("S5"));
  assert(content.includes("Sets"));
  assert(content.includes("3"));
  assert(content.includes("2"));
  assert(!content.includes("OT"));
  assert(!content.includes("105"));
  assert(!content.includes("102"));
});

test("the shared basketball line score retains overtime and point totals", () => {
  const LineScore = loadLineScore();
  const tree = LineScore({
    league: "nba", isDark: false, state: "post", homeCode: "HOME", awayCode: "AWAY",
    linescore: { home: [25, 20, 25, 20, 15], away: [20, 25, 20, 25, 12] },
  });
  const content = textNodes(tree);
  assert(content.includes("Line Score"));
  assert(content.includes("OT"));
  assert(content.includes("Total"));
  assert(content.includes("105"));
  assert(content.includes("102"));
});
