import assert from "node:assert/strict";
import test from "node:test";
import { getNewsGameTarget, getNewsPlayerTarget } from "../utils/newsArticleLinks";

test("opens the article's college football game in Tempo", () => {
  assert.deepEqual(
    getNewsGameTarget("https://www.espn.com/college-football/game/_/gameId/401856821/texas-tech-colorado"),
    { screen: "football", league: "cfb", gameId: "401856821" },
  );
});

test("maps game detail links to the correct sport and league", () => {
  for (const [section, screen, league] of [
    ["nfl", "football", "nfl"],
    ["ufl", "football", "ufl"],
    ["nba", "basketball", "nba"],
    ["wnba", "basketball", "wnba"],
    ["mens-college-basketball", "basketball", "mcbb"],
    ["womens-college-basketball", "basketball", "wcbb"],
    ["nba-g-league", "basketball", "gleague"],
  ]) {
    for (const page of ["game", "summary", "boxscore", "playbyplay", "recap"]) {
      assert.deepEqual(
        getNewsGameTarget(`https://espn.com/${section}/${page}/_/gameId/123?source=news#details`),
        { screen, league, gameId: "123" },
      );
    }
  }
});

test("keeps unsupported and malformed game URLs external", () => {
  for (const link of [
    "not a URL",
    "https://example.com/nfl/game/_/gameId/123",
    "https://espn.com.evil.com/nfl/game/_/gameId/123",
    "ftp://espn.com/nfl/game/_/gameId/123",
    "https://espn.com/nfl/game/_/gameId/no-id",
    "https://espn.com/nfl/game/_/gameId/0",
    "https://espn.com/nfl/player/_/id/123",
    "https://espn.com/unknown/game/_/gameId/123",
  ]) assert.equal(getNewsGameTarget(link), null);
});

test("maps ESPN football player links to Tempo football profiles", () => {
  assert.deepEqual(
    getNewsPlayerTarget(
      "http://www.espn.com/college-football/player/_/id/4870906/arch-manning",
    ),
    { screen: "football", playerId: "4870906", league: "cfb" },
  );

  assert.deepEqual(
    getNewsPlayerTarget("https://www.espn.com/nfl/player/_/id/4431452"),
    { screen: "football", playerId: "4431452", league: "nfl" },
  );
});

test("maps supported ESPN player links to the matching Tempo sport", () => {
  const cases = [
    ["https://www.espn.com/nba/player/_/id/1/name", "basketball", "nba"],
    [
      "https://www.espn.com/mens-college-basketball/player/_/id/2/name",
      "basketball",
      "mcbb",
    ],
    ["https://www.espn.com/mlb/player/_/id/3/name", "baseball", "mlb"],
    ["https://www.espn.com/nhl/player/_/id/4/name", "hockey", "nhl"],
    ["https://www.espn.com/soccer/player/_/id/5/name", "soccer", "SOCC"],
    ["https://www.espn.com/mma/fighter/_/id/6/name", "mma", "mma"],
  ] as const;

  for (const [link, screen, league] of cases) {
    assert.deepEqual(getNewsPlayerTarget(link), {
      screen,
      playerId: link.match(/\/id\/(\d+)/)?.[1],
      league,
    });
  }
});

test("leaves non-player and non-ESPN links external", () => {
  assert.equal(
    getNewsPlayerTarget("https://www.espn.com/nfl/team/_/id/12"),
    null,
  );
  assert.equal(
    getNewsPlayerTarget("https://example.com/nfl/player/_/id/123"),
    null,
  );
});
