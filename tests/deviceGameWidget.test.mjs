import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import babel from "@babel/core";
import {
  getExploreFavoriteGamePhase,
  prepareExploreFavoriteGames,
} from "../utils/widgets/exploreFavoriteGames.ts";

function load(sourcePath, modules) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    Date,
    require(name) {
      assert.ok(name in modules, `Unexpected import: ${name}`);
      return modules[name];
    },
  });
  return exports;
}

const { Colors, Fonts } = load("constants/styles.ts", {
  "react-native": { StyleSheet: { create: (value) => value } },
});
const widgetUtils = load("utils/widgets/deviceGameWidget.ts", {
  "../../constants/styles": { Colors, Fonts },
  "./exploreFavoriteGames": {
    getExploreFavoriteGamePhase,
    prepareExploreFavoriteGames,
  },
});
const {
  buildDeviceGameWidgetSnapshot: snapshot,
  buildDeviceGameWidgetTimeline: timeline,
  DEVICE_GAME_WIDGET_STALE_MS,
} = widgetUtils;
const now = Date.parse("2026-11-02T18:00:00Z");
const team = {
  name: "Boston Celtics",
  code: "BOS",
  record: "5-1",
  score: 0,
  primaryColor: "008348",
};
function game(id, league = "nba", state = "pre") {
  const sport =
    league === "nfl"
      ? "football"
      : league === "wcvb"
        ? "volleyball"
        : "basketball";
  return {
    key: `${sport}:${league}:${id}`,
    gameId: String(id),
    sport,
    league,
    favoriteTeamKeys: [`${league}:1`],
    game: {
      id,
      date: new Date(now + 3600000).toISOString(),
      status: {
        state,
        completed: state === "post",
        shortDetail:
          state === "in"
            ? "4:32 - 3rd"
            : state === "post"
              ? "Final/OT"
              : "Scheduled",
      },
      home: { ...team },
      away: { ...team, name: "New York Knicks", code: "NYK", score: 10 },
    },
  };
}
function props(games, overrides = {}) {
  return snapshot({
    games,
    userId: 1,
    hasFavorites: true,
    loading: false,
    error: null,
    colorScheme: "system",
    now,
    ...overrides,
  });
}

test("device snapshots prioritize live games, deduplicate matchups, and preserve zero scores", () => {
  const live = game(2, "nfl", "in");
  const value = props([game(1), live, live]);
  assert.equal(value.games.length, 2);
  assert.equal(value.games[0].league, "nfl");
  assert.equal(value.games[0].home.value, "0");
  assert.equal(value.games[0].away.value, "10");
  assert.equal(value.games[1].home.value, "5-1");
  assert.equal(value.games[0].home.color, "#008348");
  const url = new URL(value.games[0].url);
  assert.equal(url.pathname, "/(tabs)/(explore)/game/football/2");
  assert.equal(url.searchParams.get("league"), "nfl");
  assert.equal(url.searchParams.get("data"), null);
});

test("sign-out and removing favorites cannot retain shared games", () => {
  const games = [game(1)];
  const signedOut = props(games, { userId: null });
  assert.equal(signedOut.games.length, 0);
  assert.equal(signedOut.title, "Sign in to Tempo");
  const noFavorites = props(games, { hasFavorites: false });
  assert.equal(noFavorites.games.length, 0);
  assert.equal(noFavorites.title, "Follow your teams");
  assert.equal(props([], { error: "Offline" }).title, "Games unavailable");
  assert.equal(props([], { loading: true }).title, "Loading games");
});

test("volleyball shows sets won and exceptional statuses retain their descriptions", () => {
  const volleyball = game(3, "wcvb", "in");
  volleyball.game.home.setsWon = 2;
  volleyball.game.home.score = 24;
  assert.equal(props([volleyball]).games[0].home.value, "2");
  const postponed = game(4);
  postponed.game.status.shortDetail = "Postponed";
  assert.equal(props([postponed]).games[0].status, "Postponed");
  const missing = game(5, "nba", "in");
  missing.game.home.score = null;
  missing.game.home.primaryColor = "invalid";
  assert.equal(props([missing]).games[0].home.value, "—");
  assert.equal(props([missing]).games[0].home.color, Colors.midTone);
});

test("a future timeline marks cached scores stale without fabricating score updates", () => {
  const entries = timeline(props([game(1, "nba", "in")]));
  assert.equal(
    entries[1].date.getTime() - entries[0].date.getTime(),
    DEVICE_GAME_WIDGET_STALE_MS,
  );
  assert.equal(entries[1].props.stale, true);
  assert.equal(entries[0].props.stale, false);
  assert.equal(entries[1].props.games, entries[0].props.games);
});

// Compile the actual 'widget' function with Expo's Babel preset, then run the
// serialized result in isolation. No app variables or module imports are present.
const compiled = babel.transformFileSync(
  "components/DeviceWidgets/FavoriteGamesWidget.tsx",
  {
    configFile: false,
    presets: [["babel-preset-expo", { jsxRuntime: "classic" }]],
    caller: { name: "metro", platform: "ios", supportsStaticESM: false },
  },
).code;
const exports = {};
vm.runInNewContext(compiled, {
  exports,
  require: (name) =>
    name === "expo-widgets"
      ? { createWidget: (name, layout) => ({ name, layout }) }
      : {},
});
const layout = exports.default.layout;
const createElement = (type, elementProps, ...children) => ({
  type,
  props: elementProps ?? {},
  children: children
    .flat(Infinity)
    .filter((child) => child !== null && child !== false),
});
const runtime = { React: { createElement } };
for (const name of ["Divider", "HStack", "Link", "Spacer", "Text", "VStack"])
  runtime[name] = name;
for (const name of [
  "containerBackground",
  "font",
  "foregroundStyle",
  "frame",
  "lineLimit",
  "minimumScaleFactor",
  "monospacedDigit",
  "padding",
  "widgetURL",
])
  runtime[name] = (value) => ({ name, value });
const renderWidget = vm.runInNewContext(`(${layout})`, runtime);
function nodes(tree, type) {
  if (!tree || typeof tree !== "object") return [];
  return [
    ...(tree.type === type ? [tree] : []),
    ...(tree.children ?? []).flatMap((child) => nodes(child, type)),
  ];
}

test("the isolated widget renders all sizes, league configurations, stale labels, and empty props", () => {
  assert.equal(exports.default.name, "TempoFavoriteGames");
  const value = props([game(1, "nba", "in"), game(2, "nfl"), game(3), game(4)]);
  for (const [family, count] of [
    ["systemSmall", 1],
    ["systemMedium", 1],
    ["systemLarge", 3],
  ]) {
    const tree = renderWidget(value, {
      widgetFamily: family,
      colorScheme: "dark",
      configuration: { league: "all" },
    });
    assert.equal(nodes(tree, "Link").length, count);
    assert.equal(
      tree.props.modifiers.find(
        (modifier) => modifier.name === "containerBackground",
      ).value,
      Colors.dark.background,
    );
  }
  const filtered = renderWidget(
    { ...value, stale: true },
    { widgetFamily: "systemLarge", configuration: { league: "nfl" } },
  );
  assert.equal(nodes(filtered, "Link").length, 1);
  assert.ok(
    nodes(filtered, "Text").some((node) =>
      node.children.includes("Open Tempo to refresh"),
    ),
  );
  assert.ok(!JSON.stringify(filtered).includes("LIVE"));
  assert.doesNotThrow(() => renderWidget({}, { widgetFamily: "systemSmall" }));
});

function syncHarness(initial, supported = true) {
  const slots = [],
    effects = [],
    writes = [],
    timers = new Map();
  let index = 0,
    listener,
    timerId = 0;
  const same = (a, b) =>
    a?.length === b?.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    useRef(value) {
      const position = index++;
      return (slots[position] ??= { current: value });
    },
    useEffect(callback, deps) {
      const position = index++;
      if (slots[position] && same(slots[position].deps, deps)) return;
      const previous = slots[position];
      slots[position] = { deps };
      effects.push(() => {
        previous?.cleanup?.();
        slots[position].cleanup = callback();
      });
    },
  };
  const modules = {
    react,
    "contexts/PreferencesContext": {
      usePreferences: () => ({ colorScheme: "dark" }),
    },
    "services/deviceGameWidgets": {
      deviceGameWidgetsSupported: supported,
      updateDeviceGameWidgets: (value) => writes.push(value),
    },
    "utils/apiClient": {
      subscribeAuthSession: (callback) => {
        listener = callback;
        return () => {};
      },
    },
    "utils/widgets/deviceGameWidget": widgetUtils,
  };
  const exports = {};
  const source = ts.transpileModule(
    fs.readFileSync("hooks/useDeviceGameWidgets.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(source, {
    exports,
    Date,
    console,
    setTimeout: (callback) => {
      timers.set(++timerId, callback);
      return timerId;
    },
    clearTimeout: (id) => timers.delete(id),
    require: (name) => {
      assert.ok(name in modules, `Unexpected import: ${name}`);
      return modules[name];
    },
  });
  const render = (value) => {
    index = 0;
    exports.useDeviceGameWidgets(value);
    while (effects.length) effects.shift()();
  };
  render(initial);
  return {
    writes,
    render,
    logout: () => listener({ accessToken: null }),
    flush: () => {
      const queued = [...timers.values()];
      timers.clear();
      queued.forEach((callback) => callback());
    },
    stop: () => slots.forEach((slot) => slot.cleanup?.()),
  };
}
const syncOptions = {
  cache: {
    key: "account-1",
    userId: 1,
    fetchedAt: now,
    response: { games: [game(1)] },
  },
  dataKey: "account-1",
  userId: 1,
  favoriteKeys: new Set(["nba:1"]),
  ready: true,
  foreground: true,
  error: null,
};

test("queued score updates cannot republish a signed-out account", () => {
  const h = syncHarness(syncOptions);
  try {
    assert.equal(h.writes[0].games.length, 1);
    h.render({
      ...syncOptions,
      cache: { ...syncOptions.cache, updatedAt: now + 10 },
    });
    assert.equal(h.writes.length, 1);
    h.logout();
    assert.equal(h.writes.at(-1).games.length, 0);
    h.flush();
    assert.equal(h.writes.at(-1).title, "Sign in to Tempo");
    h.render({ ...syncOptions, userId: 2, dataKey: "account-2" });
    assert.equal(h.writes.at(-1).games.length, 0);
  } finally {
    h.stop();
  }
});

test("appearance and background sync keep the original score timestamp; unsupported builds do nothing", () => {
  const h = syncHarness(syncOptions);
  try {
    h.render({ ...syncOptions, foreground: false });
    assert.equal(h.writes.at(-1).updatedAt, now);
    assert.equal(h.writes.at(-1).colorScheme, "dark");
    h.render({ ...syncOptions, foreground: false, favoriteKeys: new Set() });
    assert.equal(h.writes.at(-1).games.length, 0);
  } finally {
    h.stop();
  }
  const unsupported = syncHarness(syncOptions, false);
  assert.equal(unsupported.writes.length, 0);
  unsupported.stop();
});
