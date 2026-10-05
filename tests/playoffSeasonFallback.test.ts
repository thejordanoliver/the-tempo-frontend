import assert from "node:assert/strict";
import test from "node:test";
import { resolvePlayoffSeason } from "../utils/playoffSeasonFallback";

test("keeps the requested season when playoffs exist", async () => {
  const requested: number[] = [];
  const result = await resolvePlayoffSeason(2027, async (year) => {
    requested.push(year);
    return ["game"];
  }, (games) => games.length > 0);
  assert.equal(result.season, 2027);
  assert.deepEqual(requested, [2027]);
});

test("finds the most recent playoff season across empty seasons", async () => {
  const requested: number[] = [];
  const result = await resolvePlayoffSeason(2027, async (year) => {
    requested.push(year);
    return year === 2025 ? ["game"] : [];
  }, (games) => games.length > 0);
  assert.equal(result.season, 2025);
  assert.deepEqual(result.data, ["game"]);
  assert.deepEqual(requested, [2027, 2026, 2025]);
});

test("stops at the earliest supported season when all responses are empty", async () => {
  const requested: number[] = [];
  const result = await resolvePlayoffSeason(1948, async (year) => {
    requested.push(year);
    return [];
  }, (games) => games.length > 0);
  assert.equal(result.season, 1947);
  assert.deepEqual(requested, [1948, 1947]);
});

test("surfaces request failures without falling back", async () => {
  const requested: number[] = [];
  await assert.rejects(resolvePlayoffSeason(2027, async (year) => {
    requested.push(year);
    throw new Error("Network unavailable");
  }, () => false), /Network unavailable/);
  assert.deepEqual(requested, [2027]);
});
