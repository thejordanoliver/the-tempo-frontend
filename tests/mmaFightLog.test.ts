import assert from "node:assert/strict";
import { test } from "node:test";
import type { MMAFightLog, MMAFightLogEntry } from "../types/mma/fightLog";
import { getLatestFighterFight } from "../utils/mmaFightLog";

const fight = (fightId: string, date: string | null, result: MMAFightLogEntry["result"] = "W"): MMAFightLogEntry => ({
  fightId, eventId: fightId, date, year: null, result, eventName: "UFC", eventShortName: "UFC", opponent: { id: null, name: "Opponent", shortName: "Opponent" }, method: null, round: null, time: null, titleFight: false,
});
const log = (fights: MMAFightLogEntry[]): MMAFightLog => ({ fighterId: "1", league: "ufc", fights, years: [], careerStats: [], fetchedAt: "2026-10-07T00:00Z", stale: false });
const now = Date.parse("2026-10-07T00:00Z");

test("latest fight follows completed appearances across all years, regardless of ordering", () => {
  assert.equal(getLatestFighterFight(log([fight("1", "2020-02-08T23:30Z"), fight("2", "2024-11-16T23:00Z"), fight("3", "2023-03-04T22:30Z")]), now)?.fightId, "2");
});
test("latest fight excludes future, undated, invalid, and unfinished bouts", () => {
  assert.equal(getLatestFighterFight(log([fight("1", "2027-01-01T00:00Z"), fight("2", null), fight("3", "invalid"), fight("4", "2026-10-01T00:00Z", null), fight("5", "2025-01-01T00:00Z", "NC")]), now)?.fightId, "5");
  assert.equal(getLatestFighterFight(null, now), null);
  assert.equal(getLatestFighterFight(log([]), now), null);
});
