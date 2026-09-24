import assert from "node:assert/strict";
import test from "node:test";
import {
  getCollegePollLabel,
  getCollegePollOptions,
  getCollegePollPageSize,
  isCollegePollTypeAvailable,
  normalizeCollegePollType,
} from "../utils/collegePollWidget";

test("offers football-specific polls only for college football", () => {
  assert.deepEqual(
    getCollegePollOptions("cfb").map((option) => option.value),
    ["ap", "coaches", "cfp", "fcs"],
  );
  assert.deepEqual(
    getCollegePollOptions("cbb").map((option) => option.value),
    ["ap", "coaches"],
  );
});

test("normalizes unsupported basketball poll selections to AP", () => {
  assert.equal(isCollegePollTypeAvailable("cbb", "cfp"), false);
  assert.equal(normalizeCollegePollType("cbb", "cfp"), "ap");
  assert.equal(normalizeCollegePollType("cfb", "cfp"), "cfp");
});

test("provides stable poll labels", () => {
  assert.equal(getCollegePollLabel("cfb", "fcs"), "FCS Coaches Poll");
  assert.equal(getCollegePollLabel("cbb", "coaches"), "Coaches Poll");
});

test("college poll page sizes match each widget mode", () => {
  assert.equal(getCollegePollPageSize("small"), 1);
  assert.equal(getCollegePollPageSize("medium"), 5);
  assert.equal(getCollegePollPageSize("large"), 5);
});
