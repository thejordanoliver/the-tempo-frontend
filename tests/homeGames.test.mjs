import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const exports = {};
const source = ts.transpileModule(
  fs.readFileSync("utils/games/homeGames.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
vm.runInNewContext(source, {
  exports,
  __DEV__: false,
  require(name) {
    if (name === "constants/leagues") {
      return {
        LEAGUE_CONFIG: new Proxy({}, { get: (_, id) => ({ label: id }) }),
        MY_TEAMS_SECTION_ID: "my-teams",
        MY_TEAMS_SECTION_TITLE: "My Teams",
        isFavoriteSportId: () => true,
      };
    }
    assert.equal(name, "utils/games/games");
    return { isGameLive: (game) => game.status?.state === "in" };
  },
});

const topPriority = [2, -5, 0.9, 0.8];
const lowPriority = [0, 0, 0.2, 0.1];
function game(id, state, matchupPriority = lowPriority, home = {}) {
  return {
    id,
    status: { state },
    matchupPriority,
    home: { id: `${id}-home`, ...home },
    away: { id: `${id}-away` },
  };
}
function sections(games, options = {}) {
  return exports.buildHomeGameSections({
    sources: [{ id: "cfb", games }],
    favoriteTeams: [],
    favoriteSports: ["cfb"],
    favoriteSportsReady: true,
    maxGamesPerLeague: 20,
    ...options,
  });
}
const ids = (section) => Array.from(section.data, ({ game }) => game.id);

test("status takes precedence over backend priority within every status group", () => {
  const games = ["post", "pre", "in"].flatMap((state) => [
    game(`${state}-low`, state),
    game(`${state}-top`, state, topPriority),
  ]);
  const inputOrder = games.map(({ id }) => id);
  assert.deepEqual(
    ids(sections(games)[0]),
    ["in", "pre", "post"].flatMap((state) => [`${state}-top`, `${state}-low`]),
  );
  assert.deepEqual(
    games.map(({ id }) => id),
    inputOrder,
  );
});

for (const state of ["in", "pre", "post"]) {
  test(`${state}: selects backend top matchups before applying the five-game limit`, () => {
    const games = Array.from({ length: 7 }, (_, index) =>
      game(`game-${index}`, state),
    );
    games.push(game("top", state, topPriority));
    const result = ids(sections(games, { maxGamesPerLeague: 5 })[0]);
    assert.equal(result.length, 5);
    assert.equal(result[0], "top");
  });
}

for (const league of [
  "nba",
  "nfl",
  "mlb",
  "nhl",
  "epl",
  "mcvb",
  "ufc",
  "atp",
]) {
  test(`${league}: consumes backend priority without recalculating rankings or records`, () => {
    const games = [
      game("low", "in", lowPriority, { rank: 1, record: "10-0" }),
      game("top", "in", topPriority, { rank: 99, record: "0-10" }),
    ];
    assert.deepEqual(
      ids(
        sections([], {
          sources: [{ id: league, games }],
          favoriteSports: [league],
        })[0],
      ),
      ["top", "low"],
    );
  });
}

test("compares each priority value in order and keeps exact ties stable", () => {
  assert.deepEqual(
    ids(
      sections([
        game("records", "in", [1, -1, 1, 1]),
        game("lower-ranks", "in", [2, -30, 1, 1]),
        game("weaker-record", "in", [2, -5, 0.5, 0.4]),
        game("top", "in", topPriority),
        game("tied", "in", topPriority),
      ])[0],
    ),
    ["top", "tied", "weaker-record", "lower-ranks", "records"],
  );
});

test("older responses without priority keep status sorting and stable API order", () => {
  const games = [
    game("final", "post", null),
    game("first", "in", null),
    game("second", "in", null),
  ];
  delete games[1].matchupPriority;
  assert.deepEqual(ids(sections(games)[0]), ["first", "second", "final"]);
  games.splice(1, 0, game("top", "in", topPriority));
  assert.deepEqual(ids(sections(games)[0]), [
    "top",
    "first",
    "second",
    "final",
  ]);
});

test("My Teams keeps every favorite game and ranks within status", () => {
  const games = [
    game("scheduled", "pre", topPriority, { id: "favorite" }),
    game("low-live", "in", lowPriority, { id: "favorite" }),
    game("top-live", "in", topPriority, { id: "favorite" }),
  ];
  games.push(games[2]);
  const result = sections(games, {
    favoriteTeams: ["cfb:favorite"],
    maxGamesPerLeague: 1,
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "my-teams");
  assert.deepEqual(ids(result[0]), ["top-live", "low-live", "scheduled"]);
});

test("general home ranks across leagues within each status section", () => {
  const result = sections([], {
    favoriteSports: [],
    sources: [
      {
        id: "cfb",
        games: ["post", "pre", "in"].map((state) =>
          game(`${state}-low`, state),
        ),
      },
      {
        id: "mcbb",
        games: ["post", "pre", "in"].map((state) =>
          game(`${state}-top`, state, topPriority),
        ),
      },
    ],
  });
  assert.deepEqual(
    Array.from(result, ({ id }) => id),
    ["general-live", "general-upcoming", "general-final"],
  );
  for (const [index, state] of ["in", "pre", "post"].entries()) {
    assert.deepEqual(ids(result[index]), [`${state}-top`, `${state}-low`]);
  }
});

test("live updates reselect top games as games start and finish", () => {
  const games = [game("live", "in"), game("top", "pre", topPriority)];
  const selected = () => ids(sections(games, { maxGamesPerLeague: 1 })[0]);
  assert.deepEqual(selected(), ["live"]);
  games[1].status.state = "in";
  assert.deepEqual(selected(), ["top"]);
  games[1].status.state = "post";
  assert.deepEqual(selected(), ["live"]);
  games[0].status.state = "post";
  assert.deepEqual(selected(), ["top"]);
});
