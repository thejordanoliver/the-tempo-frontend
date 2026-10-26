import assert from "node:assert/strict";
import test from "node:test";
import { isFootballRedZonePlay } from "../utils/sports/football/footballRedZone";

const redZonePlay = {
  type: { text: "Rush" },
  start: { yardsToEndzone: 15 },
  end: { yardsToEndzone: 10 },
};

test("suppresses stale red-zone positions throughout halftime", () => {
  for (const status of [
    { state: "in" as const, name: "STATUS_HALFTIME" },
    { state: "in" as const, gameStatusDescription: "Halftime" },
    { state: "in" as const, gameStatusDetail: "Half Time" },
    { state: "in" as const, shortDetail: "Half-time" },
  ]) {
    assert.equal(isFootballRedZonePlay(redZonePlay, status), false);
  }
});

test("suppresses end-of-half and end-of-quarter events before status catches up", () => {
  for (const text of ["End of Half", "END QUARTER 2", "End of Period"]) {
    assert.equal(
      isFootballRedZonePlay({ ...redZonePlay, text }, { state: "in" }),
      false,
    );
  }
});

test("shows red zone during live play and restores it when halftime ends", () => {
  assert.equal(isFootballRedZonePlay(redZonePlay, { state: "in" }), true);
  assert.equal(
    isFootballRedZonePlay(redZonePlay, {
      state: "in",
      gameStatusDescription: "In Progress",
      shortDetail: "14:30 - 3rd Quarter",
    }),
    true,
  );
});

test("does not show red zone for scheduled or completed games", () => {
  for (const state of ["pre", "post"] as const) {
    assert.equal(isFootballRedZonePlay(redZonePlay, { state }), false);
  }
});

test("ignores missing, empty, invalid, and out-of-range field positions", () => {
  for (const yardsToEndzone of [null, undefined, "", " ", "unknown", -1, 21]) {
    assert.equal(
      isFootballRedZonePlay({ start: { yardsToEndzone } }, { state: "in" }),
      false,
    );
  }
  assert.equal(isFootballRedZonePlay(null, { state: "in" }), false);
});

test("accepts red-zone boundaries and normalized numeric strings", () => {
  for (const yardsToEndzone of [0, 20, "15"]) {
    assert.equal(
      isFootballRedZonePlay({ end: { yardsToEndzone } }, { state: "in" }),
      true,
    );
  }
});

test("recognizes goal-to-go without numeric field positions but hides it at halftime", () => {
  const play = { start: { downDistanceText: "1st & Goal" } };
  assert.equal(isFootballRedZonePlay(play, { state: "in" }), true);
  assert.equal(
    isFootballRedZonePlay(play, {
      state: "in",
      gameStatusDescription: "Halftime",
    }),
    false,
  );
});
