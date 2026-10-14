import assert from "node:assert/strict";
import test from "node:test";
import type { Play } from "../hooks/HockeyHooks/useHockeyGameDetails";
import { filterHockeySummaryPlays, sortHockeySummaryPlays } from "../utils/sports/hockey/hockeySummary";

const play = (id: string, period: number, clock: string, sequence = id) =>
  ({ id, period: { number: period }, clock: { displayValue: clock }, sequenceNumber: sequence }) as Play;

test("orders newest periods and countdown clocks first without mutating input", () => {
  const plays = [play("1", 1, "00:10", ""), play("2", 2, "18:00", ""), play("3", 2, "01:00", "")];
  assert.deepEqual(sortHockeySummaryPlays(plays).map(p => p.id), ["3", "2", "1"]);
  assert.deepEqual(plays.map(p => p.id), ["1", "2", "3"]);
});

test("uses sequence numbers to order events at the same clock", () => {
  assert.deepEqual(sortHockeySummaryPlays([play("9", 3, "10:00"), play("10", 3, "10:00")]).map(p => p.id), ["10", "9"]);
});

test("OT includes all extra periods and regulation tabs stay separate", () => {
  const plays = [play("1", 1, "10:00"), play("3", 3, "10:00"), play("4", 4, "10:00"), play("5", 5, "10:00")];
  assert.deepEqual(filterHockeySummaryPlays(plays, "OT").map(p => p.id), ["4", "5"]);
  assert.deepEqual(filterHockeySummaryPlays(plays, "3rd").map(p => p.id), ["3"]);
  assert.equal(filterHockeySummaryPlays(plays, "All"), plays);
});

test("omits plays without a valid period and tolerates missing clocks", () => {
  const plays = [play("1", 0, ""), play("2", 1, ""), play("3", 1, "12:00")];
  assert.deepEqual(sortHockeySummaryPlays(plays).map(p => p.id), ["3", "2"]);
});

test("sequence keeps the latest event first when its clock is missing or corrected", () => {
  const plays = [play("old", 3, "01:00", "100"), play("latest", 3, "01:10", "101")];
  assert.deepEqual(sortHockeySummaryPlays(plays).map(p => p.id), ["latest", "old"]);
  plays[1].clock.displayValue = "";
  assert.deepEqual(sortHockeySummaryPlays(plays).map(p => p.id), ["latest", "old"]);
});
