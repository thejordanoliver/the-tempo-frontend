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

test("free throws show the pulsing shot marker on the line instead of a missing-location zone", () => {
  const h = setup();
  h.modules["./BasketballCourt"] = {
    default: "BasketballCourt",
    __esModule: true,
  };
  h.modules["components/Sports/PlayByPlay/PlayLocationPulse"] = {
    default: "PlayLocationPulse",
    __esModule: true,
  };
  const Court = h.load(
    "components/Sports/Basketball/GameDetails/PlayByPlay/BasketballPlayCourt.tsx",
  ).default;
  for (const [team, x] of [
    [20, 75],
    [6, 19],
  ]) {
    h.start(Court, [
      {
        play: {
          team: { id: team },
          type: { text: "Free Throw" },
          courtPosition: null,
          scoringPlay: true,
          scoreValue: 1,
        },
        homeId: 20,
        awayId: 6,
        homeColor: "#552583",
        awayColor: "#007ac1",
        markerColor: "#552583",
        active: true,
      },
    ]);
    const point = geometry.projectBasketballCourtPoint(x, 25);
    const all = nodes(h.state);
    const marker = all.find(
      (node) =>
        node.type === "Ellipse" &&
        node.props.fill === "#1d1d1d" &&
        node.props.stroke === "#ffffff",
    );
    assert.ok(marker);
    assert.equal(marker.props.cx, point.x);
    assert.equal(marker.props.cy, point.y);
    assert.ok(
      all.some(
        (node) =>
          node.type === "PlayLocationPulse" &&
          node.props.x === point.x &&
          node.props.y === point.y,
      ),
    );
    assert.equal(
      all.some((node) => node.props?.strokeDasharray === "6 5"),
      false,
    );
  }
  h.stop();
});

test("made shots pass through either rim and exit below the net; misses stay above the rim", () => {
  const h = setup();
  const progress = { value: 0 };
  h.modules["hooks/BasketballHooks/useBasketballAnimation"] = {
    useBasketballAnimation: () => ({ progress, reducedMotion: false }),
  };
  h.modules["./BasketballCourt"] = {
    default: "BasketballCourt",
    BasketballNet: "BasketballNet",
    __esModule: true,
  };
  h.modules["components/Sports/PlayByPlay/PlayLocationPulse"] = {
    default: "PlayLocationPulse",
    __esModule: true,
  };
  const Court = h.load(
    "components/Sports/Basketball/GameDetails/PlayByPlay/BasketballPlayCourt.tsx",
  ).default;
  for (const [team, x] of [
    [20, 75],
    [6, 19],
  ]) {
    const rim = geometry.basketballBasketPoint(team === 20);
    for (const made of [true, false]) {
      const play = {
        team: { id: team },
        type: { text: "Jump Shot" },
        courtPosition: { x, y: 25 },
        shootingPlay: true,
        scoringPlay: made,
        scoreValue: made ? 2 : 0,
      };
      let previousY = -Infinity;
      for (const value of [0.78, 0.85, 0.93, 1]) {
        progress.value = value;
        h.start(Court, [
          {
            play,
            homeId: 20,
            awayId: 6,
            homeColor: "#552583",
            awayColor: "#007ac1",
            markerColor: "#552583",
          },
        ]);
        const all = nodes(h.state);
        const ball = all.find(
          (node) =>
            node.type === "G" &&
            node.props.animatedProps &&
            nodes(node.props.children).some(
              (child) => child.type === "Circle" && child.props.r === 7,
            ),
        );
        assert.ok(ball?.props.animatedProps);
        const [, , , , ballX, ballY] = ball.props.animatedProps.matrix;
        if (made) {
          assert.ok(Math.abs(ballX - rim.x) < 1e-8);
          assert.ok(ballY > previousY);
          previousY = ballY;
          if (value === 0.85) assert.ok(ballY > rim.y && ballY < rim.y + 15);
          if (value === 1) assert.ok(ballY - 7 > rim.y + 15);
          assert.ok(all.some((node) => node.type === "BasketballNet"));
        } else if (value === 1) {
          assert.equal(ballY, rim.y - 7);
          assert.equal(
            all.some((node) => node.type === "BasketballNet"),
            false,
          );
        }
      }
    }
  }
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
