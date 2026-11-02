import assert from "node:assert/strict";
import test from "node:test";
import {
  deferred,
  flush,
  sportsHookHarness,
} from "./helpers/sportsHookHarness.mjs";

function setup() {
  const h = sportsHookHarness();
  const initial = deferred();
  let listener;
  let removed = false;
  h.modules["react-native"] = {
    AccessibilityInfo: {
      isReduceMotionEnabled: () => initial.promise,
      addEventListener(event, callback) {
        assert.equal(event, "reduceMotionChanged");
        listener = callback;
        return {
          remove: () => {
            removed = true;
          },
        };
      },
    },
  };
  const { useReducedMotion } = h.load("hooks/useReducedMotion.ts");
  h.start(useReducedMotion);
  return {
    h,
    initial,
    change: (value) => listener(value),
    removed: () => removed,
  };
}

test("motion stays reduced until the device preference is known and follows live changes", async () => {
  const { h, initial, change, removed } = setup();
  assert.equal(h.state, true);
  initial.resolve(false);
  await flush();
  assert.equal(h.state, false);
  change(true);
  await flush();
  assert.equal(h.state, true);
  h.stop();
  assert.equal(removed(), true);
});

test("a stale initial response cannot overwrite a newer device preference", async () => {
  const { h, initial, change } = setup();
  change(true);
  initial.resolve(false);
  await flush();
  assert.equal(h.state, true);
  h.stop();
});

test("unsupported preference queries keep motion reduced", async () => {
  const { h, initial } = setup();
  initial.reject(new Error("Unavailable"));
  await flush();
  assert.equal(h.state, true);
  h.stop();
});

test("unmount removes the device listener while an initial query is pending", async () => {
  const { h, initial, removed } = setup();
  h.stop();
  initial.resolve(false);
  await flush();
  assert.equal(removed(), true);
  assert.equal(h.state, true);
});
