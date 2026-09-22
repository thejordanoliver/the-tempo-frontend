import assert from "node:assert/strict";
import test from "node:test";
import { ScheduleFreshness } from "../hooks/Sports/scheduleFreshness.ts";

test("a socket update supersedes REST data without blocking request completion", () => {
  const freshness = new ScheduleFreshness();
  const initial = freshness.startRequest();
  freshness.recordSocketUpdate();
  assert.equal(freshness.canApplyResponse(initial), false);
  assert.equal(freshness.canComplete(initial), true);
});

test("only the newest overlapping HTTP request can apply data or end loading", () => {
  const freshness = new ScheduleFreshness();
  const first = freshness.startRequest();
  const second = freshness.startRequest();
  assert.equal(freshness.canApplyResponse(first), false);
  assert.equal(freshness.canComplete(first), false);
  assert.equal(freshness.canApplyResponse(second), true);
  assert.equal(freshness.canComplete(second), true);
});

test("a request started after a socket update can apply a newer REST response", () => {
  const freshness = new ScheduleFreshness();
  const oldRequest = freshness.startRequest();
  freshness.recordSocketUpdate();
  const newRequest = freshness.startRequest();
  assert.equal(freshness.canApplyResponse(oldRequest), false);
  assert.equal(freshness.canApplyResponse(newRequest), true);
});

test("unmount or schedule identity change invalidates outstanding requests", () => {
  const freshness = new ScheduleFreshness();
  const request = freshness.startRequest();
  freshness.invalidateRequests();
  assert.equal(freshness.canApplyResponse(request), false);
  assert.equal(freshness.canComplete(request), false);
});
