import assert from "node:assert/strict";
import test from "node:test";
import { sportsHookHarness, flush } from "./helpers/sportsHookHarness.mjs";
import * as geometry from "../utils/sports/basketball/basketballCourtGeometry.ts";
import * as charts from "../utils/sports/basketball/basketballCharts.ts";
import * as events from "../utils/sports/basketball/basketballEvents.ts";
import * as scene from "../utils/sports/basketball/basketballAnimationScene.ts";
import * as plays from "../utils/sports/basketball/basketballPlayByPlay.ts";

function setup() {
  const h = sportsHookHarness();
  h.react.memo = (component) => component;
  h.react.useId = () => "test-court";
  h.modules["react/jsx-runtime"] = {
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
    Fragment: "Fragment",
  };
  h.modules["react-native"] = {
    View: "View",
    Text: "Text",
    Pressable: "Pressable",
    StyleSheet: { create: (x) => x },
  };
  h.modules["components/Headings/HeadingTwo"] = {
    default: "HeadingTwo",
    __esModule: true,
  };
  h.modules["react-native-svg"] = {
    default: "Svg",
    __esModule: true,
    ...Object.fromEntries(
      [
        "Circle",
        "ClipPath",
        "Defs",
        "Ellipse",
        "G",
        "Image",
        "Line",
        "Path",
        "Polygon",
        "Polyline",
        "Rect",
        "Text",
      ].map((name) => [name, name]),
    ),
  };
  h.modules["react-native-reanimated"] = {
    default: { createAnimatedComponent: (value) => value },
    __esModule: true,
    useAnimatedProps: (callback) => callback(),
  };
  h.modules["hooks/BasketballHooks/useBasketballAnimation"] = {
    useBasketballAnimation: () => ({ progress: { value: 1 } }),
  };
  h.modules["utils/sports/basketball/basketballCourtGeometry"] = geometry;
  h.modules["utils/sports/basketball/basketballCharts"] = charts;
  h.modules["utils/sports/basketball/basketballEvents"] = events;
  h.modules["utils/sports/basketball/basketballAnimationScene"] = scene;
  h.modules["utils/sports/basketball/basketballPlayByPlay"] = plays;
  return h;
}
function nodes(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...nodes(node.props?.children)];
}
function text(node) {
  if (node == null || typeof node === "boolean") return "";
  if (Array.isArray(node)) return node.map(text).join(" ");
  if (typeof node !== "object") return String(node);
  return text(node.props?.children);
}

test("court themes and half-court layouts render real SVG primitives with shared coordinates", () => {
  const h = setup();
  h.start(
    h.load(
      "components/Sports/Basketball/GameDetails/PlayByPlay/BasketballCourt.tsx",
    ).default,
    [{ homeColor: "#552583", isDark: false }],
  );
  const light = nodes(h.state).find(
    (node) => node.type === "Polygon" && node.props.fill === "#dec8a9",
  );
  assert.ok(light);
  h.update([
    { homeColor: "#552583", isDark: true, layout: "half", homeHalf: false },
  ]);
  assert.ok(
    nodes(h.state).some(
      (node) => node.type === "Polygon" && node.props.fill === "#79694f",
    ),
  );
  assert.equal(
    nodes(h.state).find((node) => node.type === "Svg").props.viewBox,
    "-20 -8 520 266",
  );
  h.stop();
});

test("chart touch selection, screen reader adjustment, and resizing inspect actual observations", async () => {
  const h = setup();
  const points = [
    {
      key: "1",
      seconds: 0,
      period: 1,
      clock: "12:00",
      home: 45,
      away: 55,
      description: "First observation",
    },
    {
      key: "2",
      seconds: 720,
      period: 1,
      clock: "0:00",
      home: 60,
      away: 40,
      description: "Second observation",
    },
    {
      key: "3",
      seconds: 2880,
      period: 4,
      clock: "0:00",
      home: 100,
      away: 0,
      description: "Final observation",
    },
  ];
  const props = {
    points,
    mode: "probability",
    homeCode: "LAL",
    awayCode: "DEN",
    homeColor: "#552583",
    awayColor: "#0e2240",
    isDark: false,
    active: true,
    scope: "game1",
  };
  h.start(
    h.load(
      "components/Sports/Basketball/GameDetails/Charts/BasketballTimelineChart.tsx",
    ).default,
    [props],
  );
  assert.match(text(h.state), /Final observation/);
  let surface = nodes(h.state).find((node) => node.props?.onResponderGrant);
  surface.props.onResponderGrant({ nativeEvent: { locationX: 36 } });
  await flush();
  assert.match(text(h.state), /First observation/);
  surface = nodes(h.state).find((node) => node.props?.onAccessibilityAction);
  surface.props.onAccessibilityAction({
    nativeEvent: { actionName: "increment" },
  });
  await flush();
  assert.match(text(h.state), /Second observation/);
  nodes(h.state)
    .find(
      (node) =>
        node.props?.accessibilityLabel === "Show latest chart observation",
    )
    .props.onPress();
  await flush();
  assert.match(text(h.state), /Final observation/);
  surface = nodes(h.state).find((node) => node.props?.onLayout);
  surface.props.onLayout({ nativeEvent: { layout: { width: 400 } } });
  await flush();
  assert.equal(
    nodes(h.state).find((node) => node.type === "Svg").props.viewBox,
    "0 0 400 210",
  );
  h.update([{ ...props, scope: "game2", isDark: true }]);
  assert.match(text(h.state), /Final observation/);
  h.update([{ ...props, points: [] }]);
  assert.match(text(h.state), /history is unavailable/);
  assert.equal(
    nodes(h.state).some((node) => node.type === "Svg"),
    false,
  );
  h.stop();
});

test("simplified latest-play card follows the newest event without playback controls", async () => {
  const h = setup();
  h.modules["./BasketballPlayCourt"] = {
    default: "BasketballPlayCourt",
    __esModule: true,
  };
  h.modules["hooks/useScreenActivity"] = {
    useScreenActivity: () => ({ active: false }),
  };
  const event = (id) => ({
    id,
    sequenceNumber: id,
    period: { number: 1 },
    clock: { displayValue: "11:00" },
    shootingPlay: true,
    scoringPlay: true,
    scoreValue: 2,
    homeScore: 2,
    awayScore: 0,
    team: { id: 20 },
    type: { text: "Jump Shot" },
    courtPosition: null,
  });
  h.start(
    h.load(
      "components/Sports/Basketball/GameDetails/PlayByPlay/BasketballPlayByPlay.tsx",
    ).default,
    [
      {
        plays: [event("1"), event("2")],
        homeId: 20,
        awayId: 6,
        homeCode: "LAL",
        awayCode: "DEN",
        homeColor: "#552583",
        awayColor: "#efbf04",
        isDark: true,
        league: "nba",
        state: "in",
        scope: "game1",
      },
    ],
  );
  const court = nodes(h.state).find(
    (node) => node.type === "BasketballPlayCourt",
  );
  assert.equal(court.props.play.id, "2");
  assert.equal(court.props.active, false);
  assert.equal(court.props.isDark, true);
  assert.equal(court.props.layout, "full");
  assert.equal(
    nodes(h.state).some((node) => node.props?.label === "Previous"),
    false,
  );
  h.stop();
});
