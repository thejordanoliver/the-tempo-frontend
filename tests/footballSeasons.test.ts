import assert from "node:assert/strict";
import test from "node:test";
import { getFootballSeason } from "../utils/dateUtils";

test("NFL and college postseason games in January use the previous starting year", () => {
  const january = new Date(2031, 0, 20);
  assert.equal(getFootballSeason(january, "nfl"), 2030);
  assert.equal(getFootballSeason(january, "cfb"), 2030);
});

test("UFL spring games and standings use the current calendar year", () => {
  assert.equal(getFootballSeason(new Date(2031, 2, 15), "ufl"), 2031);
});

test("college football advances in February while the NFL retains its prior season", () => {
  const february = new Date(2031, 1, 1);
  assert.equal(getFootballSeason(february, "cfb"), 2031);
  assert.equal(getFootballSeason(february, "nfl"), 2030);
});

test("season selection continues to advance in future years", () => {
  for (const year of [2031, 2032, 2040]) {
    for (const league of ["nfl", "cfb", "ufl"]) {
      assert.equal(getFootballSeason(new Date(year, 8, 1), league), year);
    }
  }
});
