import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import {
  mergeExploreFavoriteGameUpdate,
  selectExploreFavoriteGames,
} from "../utils/widgets/exploreFavoriteGames.ts";
import { shouldTrackGameUpdates } from "../utils/games/gameStatus.ts";

const DAY = 24 * 60 * 60 * 1_000;
const now = Date.now();
function game(id, offset, state = "pre") {
  return {
    id,
    date: new Date(now + offset).toISOString(),
    status: { state, completed: state === "post" },
    home: {},
    away: {},
  };
}
function envelope(
  data,
  sport = "football",
  league = "nfl",
  favoriteTeamKeys = ["nfl:30"],
) {
  return {
    key: `${sport}:${league}:${data.id}`,
    gameId: String(data.id),
    sport,
    league,
    favoriteTeamKeys,
    game: data,
  };
}
function setup(initialGames, enabled = true) {
  let cache = { key: "current-account", response: { games: initialGames } };
  const subscriptions = [];
  const cleanup = [];
  const modules = {
    react: {
      useMemo: (factory) => factory(),
      useRef: (current) => ({ current }),
      useEffect: (effect) => cleanup.push(effect()),
    },
    "utils/games/gameStatus": { shouldTrackGameUpdates },
    "utils/widgets/exploreFavoriteGames": {
      mergeExploreFavoriteGameUpdate,
      selectExploreFavoriteGames,
    },
    "services/liveSportsSocket": {
      subscribeSportsLive(options) {
        subscriptions.push(options);
        return () => {};
      },
    },
  };
  const exports = {};
  const source = ts.transpileModule(
    fs.readFileSync(
      "hooks/ExploreHooks/useExploreWidgetLiveUpdates.ts",
      "utf8",
    ),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    },
  ).outputText;
  vm.runInNewContext(source, {
    exports,
    Date,
    require: (name) => modules[name],
  });
  exports.useExploreWidgetLiveUpdates({
    enabled,
    cache,
    dataKey: cache.key,
    userId: 1,
    relevantFavoriteKeySet: new Set(
      initialGames.flatMap((value) => value.favoriteTeamKeys),
    ),
    setCache(updater) {
      cache = updater(cache);
    },
  });
  return {
    subscriptions,
    get games() {
      return cache.response.games;
    },
    stop() {
      cleanup.forEach((callback) => callback?.());
    },
  };
}

test("football subscribes to schedules and keeps tomorrow over last week's final", () => {
  const tomorrow = game(1, DAY);
  const lastWeek = game(2, -6 * DAY, "post");
  const h = setup([envelope(tomorrow)]);
  try {
    assert.equal(h.subscriptions[0].payload.feed, "teamSchedule");
    h.subscriptions[0].listener({ payload: { games: [lastWeek, tomorrow] } });
    assert.equal(h.games[0].gameId, "1");
  } finally {
    h.stop();
  }
});

test("a full schedule replaces stale live state when the selected game has finished", () => {
  const live = game(3, -6 * DAY, "in");
  const final = game(3, -6 * DAY, "post");
  const upcoming = game(4, DAY);
  const h = setup([envelope(live)]);
  try {
    h.subscriptions[0].listener({ payload: { games: [final, upcoming] } });
    assert.equal(h.games[0].gameId, "4");
    assert.equal(h.games[0].game.status.state, "pre");
  } finally {
    h.stop();
  }
});

test("shared matchups track each favorite team's schedule", () => {
  const shared = game(5, DAY);
  const h = setup([envelope(shared, "football", "nfl", ["nfl:30", "nfl:1"])]);
  try {
    assert.equal(h.subscriptions.length, 2);
    const teamOne = h.subscriptions.find(
      (value) => value.payload.teamId === "1",
    );
    teamOne.listener({ payload: { games: [game(6, 0, "in"), shared] } });
    assert.equal(h.games.length, 2);
    assert.equal(
      h.games.find((value) => value.gameId === "6").favoriteTeamKeys.join(","),
      "nfl:1",
    );
    assert.equal(
      h.games.find((value) => value.gameId === "5").favoriteTeamKeys.join(","),
      "nfl:30",
    );
  } finally {
    h.stop();
  }
});

test("hockey keeps its supported latest feed and rejects an older final", () => {
  const h = setup([envelope(game(7, DAY), "hockey", "nhl", ["nhl:1"])]);
  try {
    assert.equal(h.subscriptions[0].payload.feed, "teamLatest");
    h.subscriptions[0].listener({
      payload: { game: game(8, -6 * DAY, "post") },
    });
    assert.equal(h.games[0].gameId, "7");
  } finally {
    h.stop();
  }
});

test("hidden widgets and late socket responses do not update games", () => {
  const initial = envelope(game(9, DAY));
  assert.equal(setup([initial], false).subscriptions.length, 0);
  const h = setup([initial]);
  h.stop();
  h.subscriptions[0].listener({ payload: { games: [game(10, 0, "in")] } });
  assert.equal(h.games[0].gameId, "9");
});
