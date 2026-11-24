import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFavoriteTeamKey,
  normalizeFavoriteTeamKey,
  normalizeFavoriteTeamKeys,
} from "../types/favorites";

test("favorite-team keys are canonical lowercase league-plus-team identities", () => {
  assert.equal(normalizeFavoriteTeamKey(" NBA:017 "), "nba:17");
  assert.equal(buildFavoriteTeamKey("CFB", 113), "cfb:113");
  assert.equal(normalizeFavoriteTeamKey("SOCC:18418"), "socc:18418");
});

test("favorite-team normalization preserves order and removes duplicates", () => {
  assert.deepEqual(
    normalizeFavoriteTeamKeys(["NBA:17", "nfl:2", "CFB:113", "nba:17"]),
    ["nba:17", "nfl:2", "cfb:113"],
  );
});

test("unprefixed, malformed, unsupported, and invalid IDs are not guessed", () => {
  assert.deepEqual(
    normalizeFavoriteTeamKeys([
      "19",
      "nba:not-a-number",
      "epl:1",
      "nba:0",
      "nba:-1",
    ]),
    [],
  );
});

test("upgrades saved men's college basketball favorites without changing women's favorites", () => {
  assert.deepEqual(
    normalizeFavoriteTeamKeys(["CBB:017", "mcbb:17", "wcbb:17"]),
    ["mcbb:17", "wcbb:17"],
  );
});
