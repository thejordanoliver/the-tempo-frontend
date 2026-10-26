import assert from "node:assert/strict";
import test from "node:test";
import type { Play } from "../hooks/BasketballHooks/useBasketballGameDetails";
import { basketballAnimationScene } from "../utils/sports/basketball/basketballAnimationScene";
import {
  basketballBasketPoint,
  basketballCourtViewport,
  projectBasketballCourtPoint,
} from "../utils/sports/basketball/basketballCourtGeometry";
import {
  basketballClockSeconds,
  basketballElapsed,
  basketballEventKey,
  basketballHistorySelection,
  classifyBasketballPlay,
  orderedBasketballEvents,
  relevantBasketballEvents,
} from "../utils/sports/basketball/basketballEvents";
import {
  basketballGameFlow,
  basketballPeriodBoundaries,
  basketballProbabilityHistory,
  basketballStepPath,
  nearestBasketballChartPoint,
} from "../utils/sports/basketball/basketballCharts";

const event = (id: string, overrides: Partial<Play> = {}) =>
  ({
    id,
    sequenceNumber: id,
    period: { number: 1, displayValue: "1st Quarter" },
    clock: { displayValue: "11:00" },
    type: { id: "1", text: "Jump Shot" },
    team: { id: 20 },
    shootingPlay: true,
    scoringPlay: true,
    scoreValue: 2,
    pointsAttempted: 2,
    homeScore: 2,
    awayScore: 0,
    text: "Made jump shot",
    ...overrides,
  }) as Play;

test("classifies shot outcomes, free throws, and every supported event without relying on descriptions for movement", () => {
  assert.equal(classifyBasketballPlay(event("1")), "made-two");
  assert.equal(
    classifyBasketballPlay(event("1", { scoreValue: 3 })),
    "made-three",
  );
  assert.equal(
    classifyBasketballPlay(event("1", { scoringPlay: false })),
    "miss",
  );
  for (const [type, kind] of [
    ["Free Throw", "free-throw"],
    ["Defensive Rebound", "rebound"],
    ["Assist", "assist"],
    ["Steal", "steal"],
    ["Turnover", "turnover"],
    ["Blocked Shot", "block"],
    ["Personal Foul", "foul"],
  ])
    assert.equal(
      classifyBasketballPlay(event("1", { type: { id: "1", text: type } })),
      kind,
    );
  assert.equal(classifyBasketballPlay(null), "other");
  assert.equal(classifyBasketballPlay({} as Play), "other");
});

test("only valid normalized positions become accurate markers; missing positions use labeled illustrative zones", () => {
  const shot = event("1", { courtPosition: { x: 67, y: 23 }, scoreValue: 3 });
  const located = basketballAnimationScene(shot, 20, 6);
  assert.deepEqual(located.point, projectBasketballCourtPoint(67, 23));
  assert.equal(located.located, true);
  assert.match(located.locationLabel, /Reported/);
  assert.deepEqual(located.trajectory?.end, basketballBasketPoint(true));
  for (const courtPosition of [null, { x: -1, y: 25 }, { x: 50, y: NaN }]) {
    const missing = basketballAnimationScene({ ...shot, courtPosition }, 20, 6);
    assert.equal(missing.located, false);
    assert.match(missing.locationLabel, /Illustrative/);
    assert.ok(missing.trajectory);
  }
  const unknown = basketballAnimationScene(
    { ...shot, courtPosition: null, team: { id: 99 } },
    20,
    6,
  );
  assert.equal(unknown.point, null);
  assert.equal(unknown.trajectory, null);
  const rebound = basketballAnimationScene(
    { ...shot, type: { id: "1", text: "Rebound" }, shootingPlay: false },
    20,
    6,
  );
  assert.equal(rebound.trajectory, null);
  assert.equal(rebound.locationLabel, "Last shot location");
  const assist = basketballAnimationScene(
    event("1", {
      shootingPlay: false,
      text: "Player passes from the corner to the rim",
      type: { id: "1", text: "Assist" },
    }),
    20,
    6,
  );
  assert.equal(assist.trajectory, null);
});

test("full and half courts share geometry and keep the shot target aligned with the elevated rim", () => {
  assert.equal(basketballCourtViewport("full").viewBox, "-20 -8 1040 266");
  assert.equal(basketballCourtViewport("half", true).viewBox, "500 -8 520 266");
  assert.equal(
    basketballCourtViewport("half", false).viewBox,
    "-20 -8 520 266",
  );
  assert.equal(
    basketballBasketPoint(true).y,
    projectBasketballCourtPoint(88.75, 25).y - 70,
  );
});

test("handles NBA clocks, fractional seconds, quarter boundaries, and multiple overtime periods", () => {
  assert.equal(basketballClockSeconds("0.3"), 0.3);
  assert.equal(basketballElapsed(1, "12:00"), 0);
  assert.equal(basketballElapsed(4, "0:00"), 2880);
  assert.equal(basketballElapsed(5, "5:00"), 2880);
  assert.equal(basketballElapsed(6, "4:00"), 3240);
  for (const clock of [undefined, "", "bad", "1:60", "13:00"])
    assert.equal(basketballElapsed(1, clock), null);
  assert.equal(basketballElapsed(5, "12:00"), null);
  assert.equal(basketballElapsed(0, "0:00"), null);
  assert.deepEqual(
    basketballPeriodBoundaries(6),
    [0, 720, 1440, 2160, 2880, 3180, 3480],
  );
});

test("deduplicates corrections and orders late delivery without preferring a stale lastPlay", () => {
  const newest = event("30", { sequenceNumber: "30" });
  const old = event("10", { sequenceNumber: "10" });
  const corrected = { ...newest, homeScore: 3 };
  const events = orderedBasketballEvents([newest, old, corrected], old);
  assert.deepEqual(
    events.map((p) => p.id),
    ["30", "10"],
  );
  assert.equal(events[0].homeScore, 3);
  assert.equal(
    orderedBasketballEvents([{} as Play, null as unknown as Play]).length,
    0,
  );
  const noId = event("", { sequenceNumber: "", text: "Missing id" });
  assert.equal(basketballEventKey(noId), basketballEventKey({ ...noId }));
});

test("history selection stays on the requested play as live events arrive and falls back safely", () => {
  const old = event("1"),
    recent = event("2"),
    newest = event("3");
  assert.equal(
    basketballHistorySelection([newest, recent, old], "1").play,
    old,
  );
  assert.equal(
    basketballHistorySelection([newest, recent, old], null).play,
    newest,
  );
  assert.equal(
    basketballHistorySelection([newest], "deleted").followingLatest,
    true,
  );
  assert.equal(basketballHistorySelection([], null).play, null);
  assert.equal(
    relevantBasketballEvents([
      event("1"),
      event("2", { shootingPlay: false, type: { id: "1", text: "End Game" } }),
    ])[0].id,
    "1",
  );
});

test("flow uses real scores at scoring events, rejects incomplete events, and includes OT", () => {
  const flow = basketballGameFlow([
    event("1"),
    event("2", {
      homeScore: 2,
      awayScore: 3,
      clock: { displayValue: "10:20" },
    }),
    event("3", { scoringPlay: false, homeScore: 2, awayScore: 3 }),
    event("4", { homeScore: null as unknown as number }),
    event("5", {
      homeScore: 102,
      awayScore: 100,
      period: { number: 5, displayValue: "OT" },
      clock: { displayValue: "1:00" },
    }),
  ]);
  assert.deepEqual(
    flow.map((p) => p.home),
    [2, -1, 2],
  );
  assert.equal(flow[2].seconds, 3120);
  assert.equal(nearestBasketballChartPoint(flow, 99)?.key, "2");
  assert.equal(nearestBasketballChartPoint([], 0), null);
});

test("probability uses only recorded samples, keeps 0/100 endpoints, and rejects invalid percentages", () => {
  const probability = basketballProbabilityHistory([
    {
      playId: "2",
      period: 5,
      clock: "0:00",
      homeProbability: 1,
      awayProbability: 0,
    },
    {
      playId: "1",
      period: 1,
      clock: "12:00",
      homeProbability: 0.45,
      awayProbability: 0.55,
    },
    {
      playId: "bad",
      period: 1,
      clock: "11:00",
      homeProbability: 45,
      awayProbability: 55,
    },
    {
      playId: "bad2",
      period: 1,
      clock: "11:00",
      homeProbability: 0.8,
      awayProbability: 0.8,
    },
  ]);
  assert.equal(probability.length, 2);
  assert.equal(probability[0].home, 45);
  assert.equal(probability[1].away, 0);
  assert.equal(
    basketballStepPath(
      probability,
      "home",
      (x) => x,
      (y) => y,
    ),
    "M0.00 45.00 H3180.00V100.00",
  );
  assert.deepEqual(basketballProbabilityHistory(), []);
});
