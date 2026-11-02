import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { CanceledError, isCancel } from "axios";
import { selectExploreFavoriteGames } from "../utils/widgets/exploreFavoriteGames.ts";

const DAY = 24 * 60 * 60 * 1_000;
const now = Date.now();
function game(id, offset, state = "pre") {
  const date = new Date(now + offset).toISOString();
  return {
    id,
    date,
    startDate: date,
    timestamp: now + offset,
    status: { state, completed: state === "post" },
    home: { id: 30 },
    away: { id: 1 },
  };
}
function envelope(data, favoriteTeamKeys = ["nfl:30"]) {
  return {
    key: `football:nfl:${data.id}`,
    gameId: String(data.id),
    sport: "football",
    league: "nfl",
    favoriteTeamKeys,
    game: data,
  };
}
function setup(favorites, schedules, fallback = []) {
  const calls = [];
  const response = {
    version: 1,
    generatedAt: new Date(now).toISOString(),
    requestedLeagues: ["nfl"],
    favoriteTeamKeys: favorites,
    games: fallback,
    failures: [],
  };
  const modules = {
    axios: { CanceledError },
    "constants/exploreWidgets": { isExploreWidgetType: () => true },
    "utils/widgets/exploreWidgetStorage": {
      normalizeStoredWidgets: (value) => value.widgets,
    },
    "utils/widgets/exploreFavoriteGames": { selectExploreFavoriteGames },
    "utils/apiClient": {
      apiClient: {
        async get(url, options) {
          calls.push({ url, options });
          if (url === "/api/widgets/explore") return { data: response };
          const teamId = url.split("/").at(-1);
          const schedule = await schedules(teamId, options);
          return { data: schedule };
        },
      },
    },
  };
  const exports = {};
  const source = ts.transpileModule(
    fs.readFileSync("services/exploreWidgetsApi.ts", "utf8"),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    },
  ).outputText;
  vm.runInNewContext(source, {
    exports,
    Date,
    Map,
    Set,
    Array,
    Error,
    require(name) {
      assert.ok(name in modules, `Unexpected import: ${name}`);
      return modules[name];
    },
  });
  return { load: exports.getExploreWidgets, calls, response };
}

test("uses tomorrow's Jaguars game from the schedule despite an older aggregate final", async () => {
  const final = game(1, -6 * DAY, "post");
  const tomorrow = game(2, DAY);
  const h = setup(
    ["nfl:30"],
    async () => ({ games: [final, game(3, 8 * DAY), tomorrow] }),
    [envelope(final)],
  );
  const controller = new AbortController();
  const result = await h.load({ leagues: ["nfl"], signal: controller.signal });

  assert.equal(result.games.length, 1);
  assert.equal(result.games[0].gameId, "2");
  assert.equal(result.games[0].sport, "football");
  assert.deepEqual([...result.games[0].favoriteTeamKeys], ["nfl:30"]);
  assert.equal(h.calls[1].url, "/api/games/football/team/nfl/30");
  assert.equal(h.calls[1].options.signal, controller.signal);
});

test("deduplicates shared matchups selected from two favorite teams' schedules", async () => {
  const shared = game(4, DAY);
  const h = setup(["nfl:30", "nfl:1"], async () => ({ games: [shared] }));
  const result = await h.load({ leagues: ["nfl"] });

  assert.equal(result.games.length, 1);
  assert.deepEqual([...result.games[0].favoriteTeamKeys], ["nfl:30", "nfl:1"]);
});

test("keeps a failed team's fallback without discarding successful schedule selections", async () => {
  const fallback = envelope(game(5, -6 * DAY, "post"), ["nfl:1", "nfl:30"]);
  const h = setup(
    ["nfl:30", "nfl:1"],
    async (id) => {
      if (id === "1") throw new Error("Offline");
      return { games: [game(6, DAY)] };
    },
    [fallback],
  );
  const result = await h.load({ leagues: ["nfl"] });

  assert.deepEqual(
    result.games.map((value) => value.gameId),
    ["6", "5"],
  );
  assert.deepEqual([...result.games[0].favoriteTeamKeys], ["nfl:30"]);
  assert.deepEqual([...result.games[1].favoriteTeamKeys], ["nfl:1"]);
  assert.equal(result.failures[0].favoriteTeamKey, "nfl:1");
});

test("treats malformed schedules as a per-team failure and accepts empty schedules", async () => {
  const h = setup(["nfl:30", "nfl:1"], async (id) => ({
    games: id === "30" ? [{ id: 1 }] : [],
  }));
  const result = await h.load({ leagues: ["nfl"] });
  assert.equal(result.games.length, 0);
  assert.equal(result.failures.length, 1);
  assert.equal(result.failures[0].favoriteTeamKey, "nfl:30");
});

test("bounds schedule requests and requests each favorite only once", async () => {
  let active = 0;
  let maxActive = 0;
  const favorites = Array.from({ length: 13 }, (_, index) => `nfl:${index}`);
  const h = setup([...favorites, "nfl:1"], async () => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 0));
    active -= 1;
    return { games: [] };
  });
  await h.load({ leagues: ["nfl"] });
  assert.equal(h.calls.length, 14);
  assert.ok(maxActive <= 6);
});

test("cancellation rejects the load and stops queued schedule requests", async () => {
  const controller = new AbortController();
  const h = setup(["nfl:30", "nfl:1"], async () => {
    controller.abort();
    throw new CanceledError();
  });
  await assert.rejects(
    h.load({ leagues: ["nfl"], signal: controller.signal }),
    isCancel,
  );
});
