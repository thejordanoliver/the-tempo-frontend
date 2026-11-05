import assert from "node:assert/strict";
import test from "node:test";
import type { ExploreWidgetGame } from "../types/widgets";
import {
  getExploreFavoriteGamePhase,
  mergeExploreFavoriteGameUpdate,
  prepareExploreFavoriteGames,
  selectExploreFavoriteGames,
} from "../utils/widgets/exploreFavoriteGames";

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

test("orders live games first, then upcoming and completed games closest to now", () => {
  const result = prepareExploreFavoriteGames(
    [
      game({
        id: "1",
        date: "2026-09-24T19:00:00Z",
        state: "post",
        completed: true,
      }),
      game({ id: "2", date: "2026-09-28T19:00:00Z" }),
      game({ id: "3", date: "2026-09-26T19:00:00Z", state: "in" }),
      game({ id: "4", date: "2026-09-27T19:00:00Z" }),
      game({
        id: "5",
        date: "2026-09-25T19:00:00Z",
        state: "post",
        completed: true,
      }),
    ],
    Date.parse("2026-09-26T20:00:00Z"),
  );

  assert.deepEqual(
    result.map(({ gameId }) => gameId),
    ["3", "4", "5", "2", "1"],
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
  const halftime = game({
    id: "20",
    date: "2026-09-26T19:00:00Z",
    state: "Halftime",
  });
  const final = game({
    id: "21",
    date: "2026-09-26T19:00:00Z",
    state: "Final/OT",
  });

  assert.equal(getExploreFavoriteGamePhase(halftime), "live");
  assert.equal(getExploreFavoriteGamePhase(final), "completed");
});

test("keeps games with equal start times in the same order after live updates", () => {
  const first = game({ id: "30", date: "2026-10-31T19:00:00Z", state: "in" });
  const second = game({ id: "31", date: "2026-10-31T19:00:00Z", state: "in" });

  const ids = (games: ExploreWidgetGame[]) =>
    prepareExploreFavoriteGames(games).map(({ gameId }) => gameId);

  assert.deepEqual(ids([first, second]), ["30", "31"]);
  assert.deepEqual(ids([second, first]), ["30", "31"]);
});

test("puts undated games last within both upcoming games and finals", () => {
  for (const state of ["pre", "post"]) {
    const undated = game({ id: "40", date: "", state });
    const invalid = game({ id: "41", date: "invalid", state });
    const dated = game({ id: "42", date: "2026-10-31T19:00:00Z", state });
    const missingTimestamp = {
      ...undated,
      game: { ...undated.game, timestamp: null },
    } as ExploreWidgetGame;

    assert.deepEqual(
      prepareExploreFavoriteGames([missingTimestamp, invalid, dated]).map(
        ({ gameId }) => gameId,
      ),
      ["42", "40", "41"],
    );
  }
});

test("uses a valid date when startDate is invalid and accepts numeric or string timestamps", () => {
  const earlier = game({ id: "50", date: "2026-10-31T18:00:00Z" });
  earlier.game.startDate = "invalid";
  const later = game({ id: "51", date: "" });
  later.game.timestamp = Date.parse("2026-10-31T19:00:00Z") / 1_000;
  const latest = game({ id: "52", date: "" });
  latest.game.timestamp = String(Date.parse("2026-10-31T20:00:00Z"));

  assert.deepEqual(
    prepareExploreFavoriteGames(
      [latest, later, earlier],
      Date.parse("2026-10-31T17:00:00Z"),
    ).map(({ gameId }) => gameId),
    ["50", "51", "52"],
  );
});

test("completed games take precedence over stale live status fields", () => {
  const completed = game({
    id: "60",
    date: "2026-10-31T19:00:00Z",
    state: "in",
    completed: true,
  });

  assert.equal(getExploreFavoriteGamePhase(completed), "completed");
});

test("recognizes normalized live states with whitespace", () => {
  for (const state of [" in ", "LIVE", "in_progress", "in_play"]) {
    assert.equal(
      getExploreFavoriteGamePhase(
        game({ id: "70", date: "2026-10-31T19:00:00Z", state }),
      ),
      "live",
    );
  }
});

test("selects one closest game per favorite from its full schedule", () => {
  const lastWeek = game({
    id: "80",
    date: "2026-10-25T17:00:00Z",
    state: "post",
    favoriteTeamKeys: ["nba:1"],
  });
  const tomorrow = game({
    id: "81",
    date: "2026-11-01T18:00:00Z",
    favoriteTeamKeys: ["nba:1", "nba:2"],
  });
  const later = game({
    id: "82",
    date: "2026-11-08T18:00:00Z",
    favoriteTeamKeys: ["nba:2"],
  });

  const result = selectExploreFavoriteGames(
    [lastWeek, tomorrow, later],
    Date.parse("2026-10-31T16:00:00Z"),
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].gameId, "81");
  assert.deepEqual(result[0].favoriteTeamKeys, ["nba:1", "nba:2"]);
});

test("an old latest-game socket response cannot replace tomorrow's selected game", () => {
  const tomorrow = game({
    id: "90",
    date: "2026-11-01T18:00:00Z",
    favoriteTeamKeys: ["nba:1", "nba:2"],
  });
  const lastWeek = game({
    id: "91",
    date: "2026-10-25T17:00:00Z",
    state: "post",
    favoriteTeamKeys: ["nba:1"],
  });

  const result = mergeExploreFavoriteGameUpdate(
    [tomorrow],
    lastWeek,
    Date.parse("2026-10-31T16:00:00Z"),
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].gameId, "90");
  assert.deepEqual(result[0].favoriteTeamKeys, ["nba:1", "nba:2"]);
});

test("live updates replace the same game's snapshot and retain both favorites", () => {
  const live = game({
    id: "100",
    date: "2026-10-31T15:00:00Z",
    state: "in",
    favoriteTeamKeys: ["nba:1", "nba:2"],
  });
  const final = game({
    id: "100",
    date: "2026-10-31T15:00:00Z",
    state: "post",
    completed: true,
    favoriteTeamKeys: ["nba:1"],
  });

  const result = mergeExploreFavoriteGameUpdate(
    [live],
    final,
    Date.parse("2026-10-31T18:00:00Z"),
  );

  assert.equal(result.length, 1);
  assert.equal(getExploreFavoriteGamePhase(result[0]), "completed");
  assert.deepEqual(result[0].favoriteTeamKeys, ["nba:1", "nba:2"]);
});
