import assert from "node:assert/strict";
import test from "node:test";
import {
  sportsHookHarness,
  deferred,
  flush,
} from "./helpers/sportsHookHarness.mjs";
import * as events from "../utils/sports/basketball/basketballEvents.ts";

const play = (id) => ({
  id,
  sequenceNumber: id,
  period: { number: 1 },
  clock: { displayValue: "11:00" },
  shootingPlay: true,
  scoringPlay: true,
  scoreValue: 2,
});
test("playback pins history, tracks the latest event, and resets selection between games", async () => {
  const h = sportsHookHarness();
  h.modules["utils/sports/basketball/basketballEvents"] = events;
  h.start(
    h.load("hooks/BasketballHooks/useBasketballPlayback.ts")
      .useBasketballPlayback,
    [[play("2"), play("1")], null, "game1"],
  );
  assert.equal(h.state.play.id, "2");
  h.state.previous();
  await flush();
  assert.equal(h.state.play.id, "1");
  h.update([[play("3"), play("2"), play("1")], play("2"), "game1"]);
  assert.equal(h.state.play.id, "1");
  h.state.latest();
  await flush();
  assert.equal(h.state.play.id, "3");
  const key = h.state.animationKey;
  h.update([[play("3"), play("2")], play("3"), "game1"]);
  assert.equal(h.state.animationKey, key);
  h.state.previous();
  await flush();
  h.update([[play("8")], null, "game2"]);
  assert.equal(h.state.play.id, "8");
  assert.equal(h.state.followingLatest, true);
  h.stop();
});

test("animation deduplicates events, uses the UI thread, cancels on blur/unmount and respects reduced motion", async () => {
  const h = sportsHookHarness();
  let reduced = false,
    started = 0,
    cancelled = 0;
  let motionChanged,
    motionRemoved = false;
  h.modules["react-native"] = {
    AccessibilityInfo: {
      addEventListener(_, callback) {
        motionChanged = callback;
        return {
          remove() {
            motionRemoved = true;
          },
        };
      },
    },
  };
  h.modules["react-native-reanimated"] = {
    cancelAnimation() {
      cancelled++;
    },
    Easing: { inOut: (value) => value, quad: () => {} },
    ReduceMotion: { System: "system" },
    useReducedMotion: () => reduced,
    useSharedValue(initial) {
      return h.react.useRef({ value: initial }).current;
    },
    withTiming(value, config) {
      assert.equal(config.reduceMotion, "system");
      started++;
      return value;
    },
  };
  h.start(
    h.load("hooks/BasketballHooks/useBasketballAnimation.ts")
      .useBasketballAnimation,
    ["event1", true],
  );
  assert.equal(started, 1);
  h.update(["event1", true]);
  assert.equal(started, 1);
  h.update(["event1", false]);
  assert.equal(h.state.progress.value, 1);
  h.update(["event1", true]);
  assert.equal(started, 1);
  h.update(["event2", true]);
  assert.equal(started, 2);
  motionChanged(true);
  await flush();
  assert.equal(h.state.reducedMotion, true);
  reduced = true;
  h.update(["event3", true]);
  assert.equal(started, 2);
  const before = cancelled;
  h.stop();
  assert.ok(cancelled > before);
  assert.equal(motionRemoved, true);
});

test("game details reject obsolete HTTP/socket work, preserve probability history, and stop hidden-screen requests", async () => {
  const h = sportsHookHarness();
  let active = true;
  const activeRef = { current: true },
    requests = [];
  h.modules["hooks/useScreenActivity"] = {
    useScreenActivity: () => ({ active, activeRef }),
  };
  h.modules["utils/apiClient"] = {
    apiClient: {
      get(url, config) {
        const d = deferred();
        requests.push({ ...d, config });
        return d.promise;
      },
    },
  };
  const snapshot = (gameId, stamp, id) => ({
    score: {
      gameId,
      lastUpdated: stamp,
      status: { state: "in" },
      plays: [play(id)],
      winProbability: [
        {
          playId: id,
          homeProbability: 0.6,
          awayProbability: 0.4,
          period: 1,
          clock: "11:00",
        },
      ],
    },
    details: {},
  });
  h.start(
    h.load("hooks/BasketballHooks/useBasketballGameDetails.ts")
      .useBasketballGameDetails,
    ["nba", "401"],
  );
  try {
    await flush();
    assert.equal(requests.length, 1);
    requests[0].resolve({ data: snapshot("401", 10, "1") });
    await flush();
    assert.equal(h.state.score.winProbability.length, 1);
    h.state.refresh();
    await flush();
    const oldRoom = h.subscription.onUpdate;
    oldRoom(snapshot("401", 20, "2"));
    await flush();
    assert.equal(requests[1].config.signal.aborted, true);
    requests[1].resolve({ data: snapshot("401", 15, "1") });
    await flush();
    oldRoom(snapshot("401", 12, "1"));
    await flush();
    assert.equal(h.state.score.lastUpdated, 20);
    h.update(["nba", "402"]);
    assert.equal(h.state.score, undefined);
    await flush();
    oldRoom(snapshot("401", 30, "3"));
    await flush();
    assert.equal(h.state.score, undefined);
    active = false;
    activeRef.current = false;
    h.update();
    await flush();
    assert.equal(requests[2].config.signal.aborted, true);
    h.state.refresh();
    await flush();
    assert.equal(requests.length, 3);
    active = true;
    activeRef.current = true;
    h.update();
    await flush();
    assert.equal(requests.length, 4);
    requests[3].resolve({ data: snapshot("402", 40, "4") });
    await flush();
    assert.equal(h.state.score.gameId, "402");
  } finally {
    h.stop();
  }
});
