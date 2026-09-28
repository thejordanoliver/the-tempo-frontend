import assert from "node:assert/strict";
import test from "node:test";
import type { ExploreWidgetGame } from "../types/widgets";
import {
  getExploreFavoriteGamePhase,
  prepareExploreFavoriteGames,
} from "../utils/exploreFavoriteGames";

function game({
  id,
  date,
  state = "pre",
  completed = false,
  favoriteTeamKeys = [`nba:${id}`],
}: {
  id: string;
  date: string;
  state?: string;
  completed?: boolean;
  favoriteTeamKeys?: string[];
}): ExploreWidgetGame {
  return {
    key: `basketball:nba:${id}`,
    gameId: id,
    sport: "basketball",
    league: "nba",
    favoriteTeamKeys,
    game: {
      id: Number(id),
      date,
      startDate: date,
      timestamp: Date.parse(date),
      status: {
        state,
        completed,
        description: state,
        detail: state,
        shortDetail: state,
      },
      home: {},
      away: {},
    },
  } as unknown as ExploreWidgetGame;
}

test("orders live, upcoming, and completed games for the carousel", () => {
  const result = prepareExploreFavoriteGames([
    game({ id: "1", date: "2026-09-24T19:00:00Z", state: "post", completed: true }),
    game({ id: "2", date: "2026-09-28T19:00:00Z" }),
    game({ id: "3", date: "2026-09-26T19:00:00Z", state: "in" }),
    game({ id: "4", date: "2026-09-27T19:00:00Z" }),
    game({ id: "5", date: "2026-09-25T19:00:00Z", state: "post", completed: true }),
  ]);

  assert.deepEqual(
    result.map(({ gameId }) => gameId),
    ["3", "4", "2", "5", "1"],
  );
});

test("deduplicates a game and retains every matching favorite team", () => {
  const result = prepareExploreFavoriteGames([
    game({
      id: "10",
      date: "2026-09-27T19:00:00Z",
      favoriteTeamKeys: ["nba:1"],
    }),
    game({
      id: "10",
      date: "2026-09-27T19:00:00Z",
      state: "in",
      favoriteTeamKeys: ["nba:2"],
    }),
  ]);

  assert.equal(result.length, 1);
  assert.equal(getExploreFavoriteGamePhase(result[0]), "live");
  assert.deepEqual(result[0].favoriteTeamKeys, ["nba:1", "nba:2"]);
});

test("recognizes descriptive live and completed statuses", () => {
  const halftime = game({ id: "20", date: "2026-09-26T19:00:00Z", state: "Halftime" });
  const final = game({ id: "21", date: "2026-09-26T19:00:00Z", state: "Final/OT" });

  assert.equal(getExploreFavoriteGamePhase(halftime), "live");
  assert.equal(getExploreFavoriteGamePhase(final), "completed");
});
