import assert from "node:assert/strict";
import test from "node:test";
import {
  EXPLORE_WIDGETS_SCHEMA_VERSION,
  normalizeStoredWidgets,
  serializeExploreWidgets,
} from "../utils/exploreWidgetStorage";

test("migrates legacy league game widgets into one Favorite Games widget", () => {
  const widgets = normalizeStoredWidgets([
    {
      id: "nba-widget",
      type: "nba_games",
      title: "NBA Games",
      createdAt: 10,
      size: "small",
      order: 2,
    },
    {
      id: "nfl-widget",
      type: "nfl_games",
      title: "NFL Games",
      createdAt: 20,
      size: "large",
      order: 3,
    },
  ]);

  assert.equal(widgets.length, 1);
  assert.equal(widgets[0].type, "favorite_games");
  assert.equal(widgets[0].title, "Favorite Games");
  assert.deepEqual(widgets[0].favoriteGameLeagues, ["nba", "nfl"]);
  assert.equal(widgets[0].size, "small");
});

test("merges legacy selections into an existing Favorite Games widget", () => {
  const widgets = normalizeStoredWidgets([
    {
      id: "favorite-games",
      type: "favorite_games",
      title: "Favorite Games",
      createdAt: 10,
      size: "medium",
      order: 0,
      favoriteGameLeagues: ["nba"],
      favoriteGamesAutoPlay: false,
    },
    {
      id: "nhl-widget",
      type: "nhl_games",
      createdAt: 20,
      size: "medium",
      order: 1,
    },
  ]);

  assert.equal(widgets.length, 1);
  assert.equal(widgets[0].id, "favorite-games");
  assert.deepEqual(widgets[0].favoriteGameLeagues, ["nba", "nhl"]);
  assert.equal(widgets[0].favoriteGamesAutoPlay, false);
});

test("serializes Favorite Games settings with the current schema", () => {
  const serialized = JSON.parse(
    serializeExploreWidgets([
      {
        id: "favorite-games",
        type: "favorite_games",
        title: "Favorite Games",
        createdAt: 10,
        size: "medium",
        order: 0,
        favoriteGameLeagues: ["nba", "nhl"],
        favoriteGamesAutoPlay: false,
      },
    ]),
  );

  assert.equal(serialized.version, EXPLORE_WIDGETS_SCHEMA_VERSION);
  assert.deepEqual(serialized.widgets[0].favoriteGameLeagues, ["nba", "nhl"]);
  assert.equal(serialized.widgets[0].favoriteGamesAutoPlay, false);
});

test("accepts UFL and college baseball Favorite Games selections", () => {
  const widgets = normalizeStoredWidgets([
    {
      id: "favorite-games",
      type: "favorite_games",
      title: "Favorite Games",
      createdAt: 10,
      size: "medium",
      order: 0,
      favoriteGameLeagues: ["cb", "ufl"],
    },
  ]);

  assert.deepEqual(widgets[0].favoriteGameLeagues, ["cb", "ufl"]);
});
