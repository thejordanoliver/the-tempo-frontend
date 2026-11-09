import "./helpers/registerAssets";
import assert from "node:assert/strict";
import test from "node:test";
import {
  BROWSEABLE_LEAGUES,
  FAVORITE_SPORT_LEAGUES,
  FAVORITE_SPORT_OPTIONS,
  HOME_SCORE_LEAGUES,
  isFavoriteSportId,
  LEAGUE_CONFIG,
  resolveLeagueConfig,
} from "../constants/leagues";

test("resolves IDs, existing display names, and full league names", () => {
  for (const value of ["nba", " NBA ", "National Basketball Association"]) {
    assert.equal(resolveLeagueConfig(value), LEAGUE_CONFIG.nba);
  }
  assert.equal(
    resolveLeagueConfig("M. College Basketball"),
    LEAGUE_CONFIG.mcbb,
  );
  assert.equal(
    resolveLeagueConfig("Men's College Basketball"),
    LEAGUE_CONFIG.mcbb,
  );
  assert.equal(resolveLeagueConfig("unknown league"), null);
  assert.equal(resolveLeagueConfig(null), null);
});

test("every browsable league is available as a favorite sport", () => {
  assert.deepEqual(FAVORITE_SPORT_LEAGUES, BROWSEABLE_LEAGUES);
  for (const league of BROWSEABLE_LEAGUES) {
    assert.equal(isFavoriteSportId(league), true, league);
    assert.ok(
      FAVORITE_SPORT_OPTIONS.some((option) => option.id === league),
      `Missing favorite option for ${league}`,
    );
  }
  assert.equal(isFavoriteSportId("unknown-league"), false);
});

test("every browsable league points to an implemented screen", async () => {
  const { existsSync } = await import("node:fs");
  const path = await import("node:path");
  for (const league of BROWSEABLE_LEAGUES) {
    assert.ok(
      existsSync(
        path.join(
          process.cwd(),
          "app",
          `${LEAGUE_CONFIG[league].route.slice(1)}.tsx`,
        ),
      ),
      `Missing league screen for ${league}`,
    );
  }
});
