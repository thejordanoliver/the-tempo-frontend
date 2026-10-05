import assert from "node:assert/strict";
import test from "node:test";
import type { BoxScorePlayerTeam } from "../hooks/FootballHooks/useFootballGameDetails";
import {
  getFootballBoxScoreLabels,
  hasFootballBoxScoreData,
  resolveFootballBoxScoreTeams,
} from "../utils/footballBoxScore";

const block = (id: number, name: string, side = "") => ({
  team: { id, espnId: id + 100, name, homeAway: side },
  statistics: [],
}) as unknown as BoxScorePlayerTeam;

test("reversed payload order resolves by team ID before names", () => {
  const away = block(1, "Same");
  const home = block(2, "Same");
  assert.deepEqual(resolveFootballBoxScoreTeams([home, away], 1, 2, "Same", "Same"), { away, home });
});

test("a partial home payload never appears as the away box score", () => {
  const home = block(2, "Home");
  assert.deepEqual(resolveFootballBoxScoreTeams([home], 1, 2, "Away", "Home"), { away: null, home });
});

test("side metadata resolves unmatched IDs and names", () => {
  const away = block(1, "Away", "away");
  const home = block(2, "Home", "home");
  assert.deepEqual(resolveFootballBoxScoreTeams([home, away], 9, 10, "X", "Y"), { away, home });
});

test("positional fallback excludes the already matched team", () => {
  const away = block(1, "Away");
  const home = block(2, "Home");
  assert.deepEqual(resolveFootballBoxScoreTeams([home, away], 1, 99, "Away", "Unknown"), { away, home });
});

test("missing and partial labels preserve all athlete and totals columns", () => {
  assert.deepEqual(getFootballBoxScoreLabels({
    name: "passing", labels: ["C/ATT", ""], keys: ["completions", "yards"],
    athletes: [{ athlete: { id: 1 }, stats: ["10/12", "150", "2", "0"] }],
    totals: ["10/12", "150", "2", "0", "98.4"],
  }), ["C/ATT", "yards", "Stat 3", "Stat 4", "Stat 5"]);
});

test("empty categories are hidden while totals-only categories remain", () => {
  assert.equal(hasFootballBoxScoreData({ name: "passing", athletes: [], totals: [] }), false);
  assert.equal(hasFootballBoxScoreData({ name: "passing", totals: ["0"] }), true);
});
