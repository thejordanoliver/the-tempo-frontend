import assert from "node:assert/strict";
import { test } from "node:test";
import type { PlayerGameLog } from "../types/playerGameLog";
import { getPlayerGameLogFilters, isRegularGameLogSection } from "../utils/playerGameLogFilters";

const log = (overrides: Partial<PlayerGameLog> = {}): PlayerGameLog => ({
  playerId: "1", league: "nba", season: 2027, displaySeason: "2026-27", category: null,
  categories: [], columns: [], seasons: [], sections: [], games: [], summaries: [],
  fetchedAt: "2026-10-07T00:00Z", stale: false, ...overrides,
});

test("empty basketball seasons retain regular-season and postseason controls", () => {
  const filters = getPlayerGameLogFilters(log(), null, "nba");
  assert.deepEqual(filters.seasons, [{ value: "2027", label: "2026-27" }]);
  assert.deepEqual(filters.sections.map(option => option.label), ["Regular Season", "Postseason"]);
});

test("season options survive loading and errors without losing the selected season", () => {
  const fallback = log({ seasons: [{ value: "2026", label: "2025-26" }] });
  const filters = getPlayerGameLogFilters(null, fallback, "nba", "2025");
  assert.deepEqual(filters.seasons.map(option => option.value), ["2027", "2026", "2025"]);
  const emptySeason = log({ season: 2025, displaySeason: "2024-25" });
  assert.equal(getPlayerGameLogFilters(emptySeason, fallback, "nba", "2025").seasons.find(option => option.value === "2025")?.label, "2024-25");
});

test("real provider section keys and play-in options are preserved without duplicate filters", () => {
  const data = log({ sections: [
    { key: "section-0", label: "2026-27 Regular Season" },
    { key: "section-1", label: "2026-27 Postseason Play In" },
    { key: "section-2", label: "2026-27 Postseason" },
  ] });
  const filters = getPlayerGameLogFilters(data, null, "nba");
  assert.deepEqual(filters.sections.map(option => option.value), ["section-0", "section-1", "section-2"]);
  assert.equal(filters.sections[1].label, "Postseason Play In");
  assert.equal(isRegularGameLogSection("Postseason Play In"), false);
  assert.equal(isRegularGameLogSection("2027 Preseason"), false);
  assert.equal(isRegularGameLogSection("2027 Season"), true);
  const playInOnly = getPlayerGameLogFilters(log({ sections: [data.sections[1]] }), null, "nba");
  assert.equal(playInOnly.sections.filter(option => option.label === "Postseason").length, 1);
});

test("MLB categories remain selectable before either category has appearances", () => {
  assert.deepEqual(getPlayerGameLogFilters(log({ league: "mlb" }), null, "mlb").categories.map(option => option.value), ["batting", "pitching"]);
  assert.equal(getPlayerGameLogFilters(log({ league: "nhl" }), null, "nhl").categories.length, 0);
});
