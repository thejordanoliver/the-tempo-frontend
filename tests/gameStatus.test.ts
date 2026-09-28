import assert from "node:assert/strict";
import test from "node:test";

import { isGameFinalStatus } from "../utils/gameStatus";

test("recognizes normalized final game statuses", () => {
  assert.equal(isGameFinalStatus({ state: "post" }), true);
  assert.equal(isGameFinalStatus({ completed: true }), true);
  assert.equal(isGameFinalStatus({ name: "STATUS_FINAL" }), true);
  assert.equal(
    isGameFinalStatus({ gameStatusDescription: "Final/OT" }),
    true,
  );
  assert.equal(isGameFinalStatus({ shortDetail: "Final/2OT" }), true);
});

test("does not classify scheduled or live games as final", () => {
  assert.equal(isGameFinalStatus({ state: "pre", completed: false }), false);
  assert.equal(isGameFinalStatus({ state: "in", completed: false }), false);
  assert.equal(isGameFinalStatus(null), false);
});
