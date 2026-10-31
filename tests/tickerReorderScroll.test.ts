import assert from "node:assert/strict";
import test from "node:test";
import {
  tickerReorderScrollVelocity,
  tickerReorderScrollTarget,
} from "../utils/tickerReorderScroll";

const viewport = { viewportTop: 100, viewportHeight: 600 };
const targetInput = {
  ...viewport,
  scrollOffset: 400,
  contentHeight: 2000,
  elapsedMs: 16,
};

test("picking up a rotation card never scrolls, including a handle at a screen edge", () => {
  for (const pointerY of [100, 105, 695, 700]) {
    for (const translationY of [0, -11.99, 11.99]) {
      assert.equal(
        tickerReorderScrollVelocity({ ...viewport, pointerY, translationY }),
        0,
      );
      assert.equal(
        tickerReorderScrollTarget({ ...targetInput, pointerY, translationY }),
        400,
      );
    }
  }
});

test("edge scrolling follows deliberate finger direction and leaves the center still", () => {
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 100,
      translationY: 20,
    }),
    0,
  );
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 700,
      translationY: -20,
    }),
    0,
  );
  for (const translationY of [-200, 200])
    assert.equal(
      tickerReorderScrollVelocity({ ...viewport, pointerY: 400, translationY }),
      0,
    );
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 100,
      translationY: -12,
    }),
    -180,
  );
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 700,
      translationY: 12,
    }),
    180,
  );
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 128,
      translationY: -20,
    }),
    -90,
  );
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 672,
      translationY: 20,
    }),
    90,
  );
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 156,
      translationY: -20,
    }),
    0,
  );
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 644,
      translationY: 20,
    }),
    0,
  );
});

test("rotation edge scrolling respects content bounds, frame time and the speed limit", () => {
  assert.equal(
    tickerReorderScrollTarget({
      ...targetInput,
      pointerY: 700,
      translationY: 20,
    }),
    402.88,
  );
  assert.equal(
    tickerReorderScrollTarget({
      ...targetInput,
      pointerY: 100,
      translationY: -20,
    }),
    397.12,
  );
  assert.equal(
    tickerReorderScrollTarget({
      ...targetInput,
      pointerY: 700,
      translationY: 20,
      scrollOffset: 1399,
    }),
    1400,
  );
  assert.equal(
    tickerReorderScrollTarget({
      ...targetInput,
      pointerY: 100,
      translationY: -20,
      scrollOffset: 1,
    }),
    0,
  );
  assert.equal(
    tickerReorderScrollTarget({
      ...targetInput,
      pointerY: 700,
      translationY: 20,
      contentHeight: 300,
      scrollOffset: 0,
    }),
    0,
  );
  assert.equal(
    tickerReorderScrollTarget({
      ...targetInput,
      pointerY: 100,
      translationY: -20,
      elapsedMs: 10000,
    }),
    391,
  );
  assert.equal(
    tickerReorderScrollTarget({
      ...targetInput,
      pointerY: 700,
      translationY: 20,
      elapsedMs: -1,
    }),
    400,
  );
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 10000,
      translationY: 100,
    }),
    180,
  );
});

test("missing viewport measurements and invalid pointer values cannot start scrolling", () => {
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: NaN,
      translationY: -20,
    }),
    0,
  );
  assert.equal(
    tickerReorderScrollVelocity({
      ...viewport,
      pointerY: 100,
      translationY: Infinity,
    }),
    0,
  );
  assert.equal(
    tickerReorderScrollTarget({
      ...targetInput,
      viewportHeight: 0,
      pointerY: 100,
      translationY: -20,
    }),
    400,
  );
});

test("an unmeasured content area cannot send a drag back to the top", () => {
  assert.equal(
    tickerReorderScrollTarget({
      ...targetInput,
      contentHeight: 0,
      pointerY: 100,
      translationY: -20,
    }),
    400,
  );
});
