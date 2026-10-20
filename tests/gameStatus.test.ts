import assert from "node:assert/strict";
import test from "node:test";

import { isGameFinalStatus, shouldTrackGameUpdates } from "../utils/games/gameStatus";

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

test("tracks scheduled games through kickoff and stops at final", () => {
  for (const state of ["pre", "in", "half", "live", "in_play", "in_progress", " PRE "]) {
    assert.equal(shouldTrackGameUpdates({ status: { state } }), true);
  }
  for (const status of [
    { state: "post" }, { state: "final" },
    { state: "in", completed: true }, { state: "pre", name: "STATUS_FINAL" },
    { state: "canceled" }, { state: "unknown" },
  ]) {
    assert.equal(shouldTrackGameUpdates({ status }), false);
  }
  assert.equal(shouldTrackGameUpdates(null), false);
  assert.equal(shouldTrackGameUpdates({}), false);
  assert.equal(shouldTrackGameUpdates({ status: { description: "In Progress" } }), true);
  assert.equal(shouldTrackGameUpdates({ status: { state: "in", description: "Final" } }), false);
});
