import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node's type-stripping test runner requires the .ts extension.
import {
  buildFavoriteTeamKey,
  groupFavoriteRailItems,
  normalizeFavoriteTeamKey,
  normalizeFavoriteTeamKeys,
  resolvePersistedFavoriteRailKeys,
  splitFavoriteRailOrder,
  type FavoriteItem,
} from "../types/favorites.ts";

test("favorite-team keys are canonical lowercase league-plus-team identities", () => {
  assert.equal(normalizeFavoriteTeamKey(" NBA:017 "), "nba:17");
  assert.equal(buildFavoriteTeamKey("CFB", 113), "cfb:113");
});

test("favorite-team normalization preserves order and removes duplicates", () => {
  assert.deepEqual(
    normalizeFavoriteTeamKeys([
      "NBA:17",
      "nfl:2",
      "CFB:113",
      "nba:17",
    ]),
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

test("combined rail reordering preserves independent team and sport order", () => {
  const items: FavoriteItem[] = [
    {
      kind: "team",
      id: "17",
      code: "BOS",
      league: "nba",
      name: "Boston Celtics",
      key: "nba:17",
      isDark: false,
    },
    {
      kind: "league",
      id: "nfl",
      league: "nfl",
      name: "NFL",
      logo: 1,
      key: "league:nfl",
      isDark: false,
    },
    {
      kind: "league",
      id: "nba",
      league: "nba",
      name: "NBA",
      logo: 2,
      key: "league:nba",
      isDark: false,
    },
    {
      kind: "team",
      id: "2",
      code: "BUF",
      league: "nfl",
      name: "Buffalo Bills",
      key: "nfl:2",
      isDark: false,
    },
  ];

  assert.deepEqual(splitFavoriteRailOrder(items), {
    favoriteTeamIds: ["nba:17", "nfl:2"],
    favoriteSports: ["nfl", "nba"],
  });

  assert.deepEqual(
    groupFavoriteRailItems(items).map((item) => item.key),
    ["league:nfl", "league:nba", "nba:17", "nfl:2"],
  );
});

test("a failed sport save restores only sport order in a mixed rail", () => {
  assert.deepEqual(
    resolvePersistedFavoriteRailKeys(
      ["league:nfl", "nba:17", "league:nba", "nfl:2"],
      ["nfl:2", "nba:17"],
      ["nba", "nfl"],
      true,
      false,
    ),
    ["league:nba", "nba:17", "league:nfl", "nfl:2"],
  );
});

test("a failed team save restores only team order in a mixed rail", () => {
  assert.deepEqual(
    resolvePersistedFavoriteRailKeys(
      ["league:nfl", "nba:17", "league:nba", "nfl:2"],
      ["nfl:2", "nba:17"],
      ["nba", "nfl"],
      false,
      true,
    ),
    ["league:nfl", "nfl:2", "league:nba", "nba:17"],
  );
});
