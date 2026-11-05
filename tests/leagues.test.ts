import "./helpers/registerAssets";
import assert from "node:assert/strict";
import test from "node:test";
import { LEAGUE_CONFIG, resolveLeagueConfig } from "../constants/leagues";

test("resolves IDs, existing display names, and full league names", () => {
  for (const value of ["nba", " NBA ", "National Basketball Association"]) {
    assert.equal(resolveLeagueConfig(value), LEAGUE_CONFIG.nba);
  }
  assert.equal(resolveLeagueConfig("M. College Basketball"), LEAGUE_CONFIG.mcbb);
  assert.equal(resolveLeagueConfig("Men's College Basketball"), LEAGUE_CONFIG.mcbb);
  assert.equal(resolveLeagueConfig("unknown league"), null);
  assert.equal(resolveLeagueConfig(null), null);
});
