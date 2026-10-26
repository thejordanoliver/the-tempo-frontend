import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import dayjs from "dayjs";
import ts from "typescript";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function harness() {
  const slots = [],
    effects = [];
  let index = 0,
    queued = false,
    stopped = false,
    hook,
    args,
    state,
    subscription;
  const same = (a, b) =>
    a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const schedule = () => {
    if (queued || stopped) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      if (!stopped) render();
    });
  };
  const memo = (factory, deps) => {
    const i = index++;
    if (!slots[i] || !same(slots[i].deps, deps))
      slots[i] = { value: factory(), deps };
    return slots[i].value;
  };
  const react = {
    useState(initial) {
      const i = index++;
      slots[i] ??= {
        value: typeof initial === "function" ? initial() : initial,
      };
      return [
        slots[i].value,
        (next) => {
          const value =
            typeof next === "function" ? next(slots[i].value) : next;
          if (!Object.is(value, slots[i].value)) {
            slots[i].value = value;
            schedule();
          }
        },
      ];
    },
    useRef(initial) {
      const i = index++;
      return (slots[i] ??= { current: initial });
    },
    useMemo: memo,
    useCallback: (callback, deps) => memo(() => callback, deps),
    useEffect(callback, deps) {
      const i = index++;
      if (slots[i] && same(slots[i].deps, deps)) return;
      const previous = slots[i];
      slots[i] = { deps, cleanup: previous?.cleanup };
      effects.push(() => {
        previous?.cleanup?.();
        slots[i].cleanup = callback();
      });
    },
  };
  const modules = {
    react,
    dayjs,
    "dayjs/plugin/timezone": () => {},
    "dayjs/plugin/utc": () => {},
    "hooks/useLiveSportsSubscription": {
      useLiveSportsSubscription(options) {
        subscription = options;
      },
    },
    "@/utils/games/games": { isGameLive: () => false },
  };
  function load(path) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }).outputText;
    vm.runInNewContext(source, {
      exports,
      console: { error() {}, warn() {} },
      AbortController,
      setTimeout,
      clearTimeout,
      require(name) {
        if (name === "hooks/Sports/useSportsRequestScope")
          return load("hooks/Sports/useSportsRequestScope.ts");
        if (name.startsWith("assets/")) return name;
        assert.ok(name in modules, `Unexpected import: ${name}`);
        return modules[name];
      },
    });
    return exports;
  }
  modules["utils/games/gameStatus"] = load("utils/games/gameStatus.ts");
  function render() {
    index = 0;
    state = hook(...args);
    while (effects.length) effects.shift()();
  }
  return {
    react,
    modules,
    load,
    start(fn, initialArgs = []) {
      hook = fn;
      args = initialArgs;
      render();
    },
    update(nextArgs = args) {
      args = nextArgs;
      render();
    },
    get state() {
      return state;
    },
    get subscription() {
      return subscription;
    },
    stop() {
      stopped = true;
      slots.forEach((slot) => slot?.cleanup?.());
    },
  };
}

function homeHarness(tab = "scores") {
  const h = harness(),
    requests = [];
  const request = (kind) => {
    const pending = deferred();
    requests.push({ kind, ...pending });
    return pending.promise;
  };
  h.modules["contexts/FavoriteTeamsContext"] = {
    useFavoriteTeamsContext: () => ({
      favorites: [],
      favoriteSports: [],
      favoriteSportsReady: true,
      favoriteSportsError: null,
      ready: true,
      userId: 1,
      refreshFavorites: () => request("teams"),
      loadFavoriteSports: (force) => {
        assert.equal(force, true);
        return request("sports");
      },
    }),
  };
  h.modules["./useForYouFeed"] = {
    useForYouFeed: () => ({ loading: false, refresh: () => request("feed") }),
  };
  h.modules["constants/leagueIds"] = h.load("constants/leagueIds.ts");
  h.modules["constants/leagues"] = h.load("constants/leagues.ts");
  h.modules["@/utils/common/dateUtils"] = { filterByDate: (games) => games };
  h.modules["utils/games/games"] = { normalizeGames: (games) => games };
  h.modules["utils/games/homeGames"] = {
    ...h.load("utils/games/homeGames.ts"),
    buildHomeGameSections: ({ sources }) =>
      sources.map(({ id, games }) => ({ id, data: games })),
  };
  function gameHook(date, league) {
    const [loading, setLoading] = h.react.useState(false);
    const initialDate = h.react.useRef(date);
    h.react.useEffect(() => {
      if (initialDate.current === date) return;
      initialDate.current = date;
      // Match game hooks' deferred automatic date fetch.
      void Promise.resolve().then(() => {
        setLoading(true);
        void request(`date:${league}`).finally(() => setLoading(false));
      });
    }, [date]);
    const games = h.react.useMemo(
      () => [{ id: `${league}:${dayjs(date).format("YYYYMMDD")}` }],
      [date, league],
    );
    return {
      games,
      matches: games,
      loading,
      refreshGames: () => request(league),
      refreshMatches: () => request(league),
    };
  }
  for (const sport of ["Basketball", "Baseball", "Hockey", "Soccer"]) {
    h.modules[`./${sport}Hooks/use${sport}Games`] = {
      [`use${sport}Games`]: gameHook,
    };
  }
  h.modules["./FootballHooks/useFootballGames"] = {
    useFootballGames: ({ date, league }) => gameHook(date, league),
  };
  h.modules["./MMAHooks/useMMAEvents"] = {
    useMMAEvents: ({ date, league }) => gameHook(date, league),
  };
  h.modules["./TennisHooks/useTennisMatches"] = { useTennisMatches: gameHook };
  h.modules["./VolleyballHooks/useVolleyball"] = {
    useVolleyballGames: gameHook,
  };
  h.start(h.load("hooks/useHomeData.ts").useHomeData, [tab]);
  return Object.assign(h, { requests });
}

test("home sources retain volleyball games using the canonical league IDs", () => {
  const h = homeHarness();
  try {
    for (const [key, config] of Object.entries(
      h.modules["constants/leagues"].LEAGUE_CONFIG,
    )) {
      assert.equal(config.id, key);
    }
    for (const league of ["mcvb", "wcvb"]) {
      const section = h.state.homeGameSections.find(({ id }) => id === league);
      assert.ok(section, `${league} must be included in home sources`);
      assert.equal(section.data.length, 1);
      assert.ok(section.data[0].id.startsWith(`${league}:`));
    }
    assert.ok(
      h.state.homeGameSections.every(({ data }) => Array.isArray(data)),
    );
  } finally {
    h.stop();
  }
});

test("Scores refresh starts favorites and all leagues together, keeps content, and waits for the last request", async () => {
  const h = homeHarness();
  try {
    const sections = h.state.homeGameSections;
    const pending = h.state.handleRefresh();
    await flush();
    assert.equal(h.requests.length, 28);
    assert.equal(new Set(h.requests.map(({ kind }) => kind)).size, 28);
    assert.equal(h.state.refreshing, true);
    assert.equal(h.state.loading, false);
    assert.equal(h.state.homeGameSections, sections);
    await h.state.handleRefresh();
    assert.equal(h.requests.length, 28);
    h.requests.slice(1).forEach((r) => r.resolve());
    await flush();
    assert.equal(h.state.refreshing, true, "favorite teams are still pending");
    h.requests[0].reject(new Error("offline"));
    await pending;
    await flush();
    assert.equal(h.state.refreshing, false);
    assert.equal(h.state.loading, false);
  } finally {
    h.stop();
  }
});

test("a date reset uses automatic date requests and waits for all of them", async () => {
  const h = homeHarness();
  try {
    h.state.setSelectedDate(dayjs().subtract(1, "day").startOf("day").toDate());
    await flush();
    h.requests.forEach((r) => r.resolve());
    await flush();
    h.requests.length = 0;
    const sections = h.state.homeGameSections;
    const pending = h.state.handleRefresh();
    await flush();
    assert.equal(h.requests.length, 28);
    assert.equal(
      h.requests.filter(({ kind }) => kind.startsWith("date:")).length,
      26,
    );
    assert.equal(h.state.homeGameSections, sections);
    assert.equal(h.state.loading, false);
    h.requests.slice(0, -1).forEach((r) => r.resolve());
    await flush();
    assert.equal(h.state.refreshing, true);
    h.requests.at(-1).resolve();
    await pending;
    await flush();
    assert.equal(h.state.refreshing, false);
    assert.equal(dayjs(h.state.selectedDate).isSame(dayjs(), "day"), true);
  } finally {
    h.stop();
  }
});

test("For You refresh remains scoped to its feed", async () => {
  const h = homeHarness("for you");
  try {
    const pending = h.state.handleRefresh();
    assert.deepEqual(
      h.requests.map(({ kind }) => kind),
      ["feed"],
    );
    h.requests[0].resolve();
    await pending;
    await flush();
    assert.equal(h.state.refreshing, false);
  } finally {
    h.stop();
  }
});

function favoritesHarness() {
  const h = harness(),
    requests = [],
    reads = [],
    writes = [];
  const request = (kind) => {
    const pending = deferred();
    requests.push({ kind, ...pending });
    return pending.promise;
  };
  h.modules["services/usersApi"] = {
    getFavoriteTeams: () => request("teams"),
    getFavoriteSports: () => request("sports"),
  };
  h.modules["@react-native-async-storage/async-storage"] = {
    getItem: async (key) => {
      reads.push(key);
      return key === "userId" ? "1" : JSON.stringify(["nba:cached"]);
    },
    setItem: async (key, value) => {
      writes.push({ key, value });
    },
    removeItem: async () => {},
  };
  h.modules["hooks/useScopedRouter"] = { useScopedRouter: () => ({}) };
  h.modules["contexts/NotificationContext"] = { useNotifications: () => ({}) };
  h.modules["utils/apiClient"] = { subscribeAuthSession: () => () => {} };
  h.modules["utils/profile/userProfileCache"] = {};
  h.modules["hooks/VolleyballHooks/useVolleyball"] = {
    useVolleyballDirectory: () => ({
      teams: [],
      loading: false,
      error: null,
      refresh: async () => {},
    }),
  };
  h.modules["utils/favorites/favoriteTeamEligibility"] = {
    isEligibleFavoriteTeam: () => true,
  };
  h.modules["utils/favorites/favoriteSports"] = {};
  h.modules["types/favorites"] = { normalizeFavoriteTeamKeys: (keys) => keys };
  h.modules["react-native"] = { Animated: { Value: class {} } };
  h.modules["expo-haptics"] = {};
  for (const [path, name] of [
    ["constants/teams", "teams"],
    ["constants/teamsCB", "cbTeams"],
    ["constants/teamsMCBB", "mcbbTeams"],
    ["@/constants/teamsWCBB", "wcbbTeams"],
    ["constants/teamsCFB", "cfbTeams"],
    ["constants/teamsMLB", "mlbTeams"],
    ["constants/teamsNFL", "nflTeams"],
    ["constants/teamsNHL", "nhlTeams"],
    ["@/constants/teamsSOCC", "soccerTeams"],
    ["constants/teamsSB", "sbTeams"],
    ["constants/teamsWNBA", "wnbaTeams"],
  ])
    h.modules[path] = { [name]: [] };
  h.modules["./useFavoriteSports"] = h.load(
    "hooks/UserHooks/useFavoriteSports.ts",
  );
  h.start(h.load("hooks/UserHooks/useFavoriteTeams.ts").useFavoriteTeams);
  return Object.assign(h, { requests, reads, writes });
}

test("favorites refresh bypasses same-user hydration and cache without hiding or clearing existing favorites", async () => {
  const h = favoritesHarness();
  try {
    await flush();
    h.requests.find(({ kind }) => kind === "teams").resolve(["nba:server"]);
    h.requests.find(({ kind }) => kind === "sports").resolve(["nba"]);
    await flush();
    assert.deepEqual(h.state.favorites, ["nba:server"]);
    const requestCount = h.requests.length;
    await h.state.loadFavorites();
    assert.equal(
      h.requests.length,
      requestCount,
      "ordinary hydration still skips the loaded user",
    );
    const readCount = h.reads.length;
    const teams = h.state.refreshFavorites();
    const sports = h.state.loadFavoriteSports(true);
    await flush();
    assert.equal(h.requests.length, requestCount + 2);
    assert.equal(
      h.reads.length,
      readCount,
      "refresh goes directly to the backend",
    );
    assert.equal(h.state.isLoading, false);
    assert.equal(h.state.ready, true);
    assert.equal(h.state.favoriteSportsReady, true);
    assert.deepEqual(h.state.favorites, ["nba:server"]);
    h.requests.slice(-2).forEach((r) => r.reject(new Error("offline")));
    await Promise.all([teams, sports]);
    await flush();
    assert.deepEqual(h.state.favorites, ["nba:server"]);
    assert.deepEqual(h.state.favoriteSports, ["nba"]);
    const next = h.state.refreshFavorites();
    h.requests.at(-1).resolve(["mlb:new"]);
    await next;
    await flush();
    assert.deepEqual(h.state.favorites, ["mlb:new"]);
    assert.equal(h.writes.at(-1).value, JSON.stringify(["mlb:new"]));
  } finally {
    h.stop();
  }
});

test("a favorite teams refresh cannot restore a signed-out user's favorites", async () => {
  const h = favoritesHarness();
  try {
    await flush();
    h.requests.find(({ kind }) => kind === "teams").resolve(["nba:server"]);
    h.requests.find(({ kind }) => kind === "sports").resolve(["nba"]);
    await flush();
    const pending = h.state.refreshFavorites();
    const lateRequest = h.requests.at(-1);
    h.state.clearFavorites();
    await flush();
    lateRequest.resolve(["mlb:old-account"]);
    await pending;
    await flush();
    assert.equal(h.state.userId, null);
    assert.equal(h.state.favorites.length, 0);
    assert.equal(
      h.writes.some(({ value }) => value.includes("old-account")),
      false,
    );
  } finally {
    h.stop();
  }
});

for (const [sport, hookName, args, response] of [
  [
    "Basketball",
    "useBasketballGames",
    [new Date(), "nba"],
    { games: [{ id: "game" }] },
  ],
  [
    "Baseball",
    "useBaseballGames",
    [new Date(), "mlb"],
    { games: [{ id: "game" }] },
  ],
  [
    "Hockey",
    "useHockeyGames",
    [new Date(), "nhl"],
    { games: [{ id: "game" }] },
  ],
  [
    "Football",
    "useFootballGames",
    [{ date: new Date(), league: "nfl" }],
    { games: [{ id: "game" }] },
  ],
  [
    "Soccer",
    "useSoccerGames",
    [new Date(), "epl"],
    { games: [{ id: "game" }] },
  ],
  [
    "MMA",
    "useMMAEvents",
    [{ date: new Date(), league: "ufc" }],
    { events: [{ id: "game" }] },
  ],
  [
    "Tennis",
    "useTennisMatches",
    [new Date(), "atp"],
    { matches: [{ id: "game", status: { state: "pre" } }] },
  ],
]) {
  test(`${sport} preserves loaded results after a failed pull-to-refresh`, async () => {
    const h = harness(),
      requests = [];
    h.modules["utils/apiClient"] = {
      apiClient: {
        get: () => {
          const pending = deferred();
          requests.push(pending);
          return pending.promise;
        },
      },
    };
    try {
      h.start(h.load(`hooks/${sport}Hooks/${hookName}.ts`)[hookName], args);
      await flush();
      requests[0].resolve({ data: response });
      await flush();
      const games = h.state.games ?? h.state.matches;
      assert.equal(games.length, 1);
      const pending = (h.state.refreshGames ?? h.state.refreshMatches)();
      await flush();
      assert.equal(h.state.loading, false);
      requests[1].reject(new Error("offline"));
      await pending;
      await flush();
      assert.equal(h.state.games ?? h.state.matches, games);
      assert.ok(h.state.error);
    } finally {
      h.stop();
    }
  });

  test(`${sport} observes kickoff without manual refresh and stops after final`, async () => {
    const h = harness(),
      pending = deferred();
    h.modules["utils/apiClient"] = {
      apiClient: { get: () => pending.promise },
    };
    const field = sport === "Tennis" ? "matches" : "games";
    const responseField = sport === "MMA" ? "events" : field;
    const game = (state) => ({ id: "game", status: { state } });
    try {
      h.start(h.load(`hooks/${sport}Hooks/${hookName}.ts`)[hookName], args);
      await flush();
      assert.equal(h.subscription.enabled, false);
      pending.resolve({ data: { [responseField]: [game("pre")] } });
      await flush();
      assert.equal(h.subscription.enabled, true, "must listen before kickoff");
      h.subscription.onUpdate({ [responseField]: [game("in")] });
      await flush();
      assert.equal(h.state[field][0].status.state, "in");
      assert.equal(h.subscription.enabled, true);
      h.subscription.onUpdate({ [responseField]: [game("post")] });
      await flush();
      assert.equal(h.state[field][0].status.state, "post");
      assert.equal(h.subscription.enabled, false);
    } finally {
      h.stop();
    }
  });
}

for (const [sport, league] of [
  ["Basketball", "nba"],
  ["Baseball", "mlb"],
  ["Football", "nfl"],
  ["Hockey", "nhl"],
  ["Soccer", "epl"],
]) {
  test(`${sport} details opened before kickoff receive live scores and final`, async () => {
    const h = harness(),
      pending = deferred();
    h.modules["utils/apiClient"] = {
      apiClient: { get: () => pending.promise },
    };
    const response = (state) => ({
      score: { status: { state }, playerStats: [] },
      details: {},
    });
    try {
      const name = `use${sport}GameDetails`;
      h.start(h.load(`hooks/${sport}Hooks/${name}.ts`)[name], [league, "401"]);
      await flush();
      assert.equal(h.subscription.enabled, false);
      pending.resolve({ data: response("pre") });
      await flush();
      assert.equal(h.subscription.enabled, true);
      assert.equal(h.state.isLive, false);
      h.subscription.onUpdate(response("in"));
      await flush();
      assert.equal(h.state.isLive, true);
      assert.equal(h.state.score.status.state, "in");
      h.subscription.onUpdate(response("post"));
      await flush();
      assert.equal(h.state.score.status.state, "post");
      assert.equal(h.state.isLive, false);
      assert.equal(h.subscription.enabled, false);
    } finally {
      h.stop();
    }
  });
}

test("favorite-game widgets subscribe before kickoff and keep the final update", async () => {
  const h = harness(),
    subscriptions = [];
  const game = (state) => ({
    id: "401",
    status: { state },
    home: {},
    away: {},
  });
  let cache = {
    key: "widgets",
    response: {
      games: [
        {
          sport: "football",
          league: "nfl",
          key: "football:nfl:401",
          gameId: "401",
          favoriteTeamKeys: ["nfl:1"],
          game: game("pre"),
        },
      ],
    },
  };
  h.modules["services/liveSportsSocket"] = {
    subscribeSportsLive(options) {
      const record = { ...options, active: true };
      subscriptions.push(record);
      return () => {
        record.active = false;
      };
    },
  };
  const options = {
    cache,
    dataKey: "widgets",
    relevantFavoriteKeySet: new Set(["nfl:1"]),
    userId: 1,
    setCache(update) {
      cache = update(cache);
      h.update([{ ...options, cache }]);
    },
  };
  try {
    h.start(
      h.load("hooks/ExploreHooks/useExploreWidgetLiveUpdates.ts")
        .useExploreWidgetLiveUpdates,
      [options],
    );
    assert.equal(subscriptions.length, 1);
    assert.equal(subscriptions[0].active, true);
    subscriptions[0].listener({ payload: { game: game("in") } });
    assert.equal(cache.response.games[0].game.status.state, "in");
    assert.equal(subscriptions.length, 1);
    subscriptions[0].listener({ payload: { game: game("post") } });
    assert.equal(cache.response.games[0].game.status.state, "post");
    assert.equal(subscriptions[0].active, false);
  } finally {
    h.stop();
  }
});
