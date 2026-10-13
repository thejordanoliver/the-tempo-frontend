import assert from "node:assert/strict";
import { test } from "node:test";
import { getClosestPlayerGame, getPlayerGameHeading } from "../utils/playerClosestGame";

const now = Date.parse("2026-10-13T12:00:00Z");
const final = { date: "2026-10-12T12:00:00Z", status: { state: "post", completed: true } };
const upcoming = { date: "2026-10-13T14:00:00Z", status: { state: "pre" } };

test("closest game can be upcoming or final regardless of schedule order", () => {
  assert.equal(getClosestPlayerGame([final, upcoming], now), upcoming);
  assert.equal(getClosestPlayerGame([upcoming, final], Date.parse("2026-10-12T13:00:00Z")), final);
});

test("live games take priority over nearer scheduled games", () => {
  const live = { date: "2026-10-13T08:00:00Z", status: { state: "in" } };
  assert.equal(getClosestPlayerGame([upcoming, live, final], now), live);
  assert.equal(getClosestPlayerGame([{ status: { state: "half" } }, upcoming], now)?.status.state, "half");
});

test("headers reflect status and invalid dates are ignored", () => {
  assert.equal(getPlayerGameHeading(final), "Latest Game");
  assert.equal(getPlayerGameHeading(upcoming), "Upcoming");
  assert.equal(getPlayerGameHeading({ status: { state: "in" } }), "Live Game");
  assert.equal(getClosestPlayerGame([{ date: "invalid" }, upcoming], now), upcoming);
  assert.equal(getClosestPlayerGame([], now), null);
});
