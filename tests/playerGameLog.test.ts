import assert from "node:assert/strict";
import { test } from "node:test";
import type { PlayerGameLog } from "../types/playerGameLog";
import { getLatestPlayerGame } from "../utils/playerGameLog";

const entry = (eventId: string, date: string | null, section: string): PlayerGameLog["games"][number] => ({
  eventId, date, section,
  team: { providerId: "9", abbreviation: "GS" },
  opponent: { providerId: "21", abbreviation: "PHX" },
  location: "@", result: "L", score: "111-96", stats: {},
});

test("latest player game includes play-in and postseason without assuming input order", () => {
  const regular = entry("1", "2026-04-12T02:00:00Z", "regular");
  const playIn = entry("2", "2026-04-18T02:00:00Z", "play-in");
  const preseason = entry("3", "2025-10-10T02:00:00Z", "preseason");
  assert.equal(getLatestPlayerGame([regular, preseason, playIn], Date.parse("2026-05-01")), playIn);
});

test("missing, malformed, and future dates cannot replace the most recent appearance", () => {
  const latest = entry("1", "2026-04-18T02:00:00Z", "play-in");
  const games = [entry("2", null, "regular"), entry("3", "invalid", "regular"), entry("4", "2027-01-01", "regular"), latest];
  assert.equal(getLatestPlayerGame(games, Date.parse("2026-05-01")), latest);
  assert.equal(getLatestPlayerGame([]), null);
});

test("football postseason appearances in the next calendar year remain the latest game", () => {
  const regular = entry("1", "2025-12-20T18:00:00Z", "2025 Regular Season");
  const postseason = entry("2", "2026-01-01T00:30:00Z", "2025 Postseason");
  assert.equal(getLatestPlayerGame([regular, postseason], Date.parse("2026-02-01")), postseason);
});
