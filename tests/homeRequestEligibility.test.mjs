import assert from "node:assert/strict";
import test from "node:test";
import {
  sportsHookHarness,
  deferred,
  flush,
} from "./helpers/sportsHookHarness.mjs";

const game = (id = "game") => ({
  id,
  date: new Date().toISOString(),
  status: { state: "pre" },
  home: { id: 1 },
  away: { id: 2 },
});
const response = (id) => ({
  data: { games: [game(id)], events: [game(id)], matches: [game(id)] },
});

function setup(
  preferences = {},
  tab = "scores",
  source = "hooks/useHomeData.ts",
) {
  const h = sportsHookHarness();
  const requests = [],
    subscriptions = [];
  let refreshes = 0;
  const favorites = {
    favorites: [],
    favoriteSports: [],
    favoriteSportsReady: true,
    favoriteSportsError: null,
    ready: true,
    userId: 1,
    refreshFavorites: async () => {
      refreshes++;
    },
    loadFavoriteSports: async () => {
      refreshes++;
    },
    ...preferences,
  };
  Object.assign(h.modules, {
    "contexts/FavoriteTeamsContext": {
      useFavoriteTeamsContext: () => favorites,
    },
    "./useForYouFeed": {
      useForYouFeed: () => ({ loading: false, refresh: async () => {} }),
    },
    "@/utils/common/dateUtils": { filterByDate: (games) => games },
    "utils/games/games": {
      normalizeGames: (games) => games,
      isGameLive: (game) => game.status?.state === "in",
    },
    "utils/volleyball": { volleyballDirectoryTeam: (team) => team },
    "utils/apiClient": {
      apiClient: {
        get(url, config) {
          const pending = deferred();
          requests.push({ url, config, ...pending });
          return pending.promise;
        },
      },
    },
    "hooks/useLiveSportsSubscription": {
      useLiveSportsSubscription(options) {
        const record = h.react.useRef(null);
        if (!record.current) subscriptions.push(record);
        record.current = options;
      },
    },
  });
  h.start(h.load(source).useHomeData, [tab]);
  return Object.assign(h, {
    requests,
    favorites,
    subscriptions,
    getRefreshCount: () => refreshes,
    settle(id = "game") {
      requests.forEach((request) => request.resolve(response(id)));
    },
    activeLeagues: () =>
      subscriptions
        .filter((record) => record.current.enabled)
        .map((record) => record.current.payload.league)
        .sort(),
  });
}

for (const [name, preferences, expected] of [
  ["general Home", {}, 26],
  [
    "guest waiting for authenticated-only sports preferences",
    { userId: null, favoriteSportsReady: false },
    26,
  ],
  ["one favorite team", { favorites: ["nba:1"] }, 1],
  [
    "teams and sports share league requests",
    { favorites: ["nba:1", "nba:2", "nfl:1"], favoriteSports: ["nba", "epl"] },
    3,
  ],
  ["preferences loading", { favoriteSportsReady: false }, 0],
  ["favorite teams loading", { ready: false }, 0],
  ["loaded empty favorites", { favorites: [], favoriteSports: [] }, 26],
  ["unsupported Home league", { favoriteSports: ["f1"] }, 0],
  [
    "preference failure falls back without a permanent loader",
    { favoriteSportsReady: false, favoriteSportsError: "offline" },
    26,
  ],
]) {
  test(`${name}: requests ${expected} league feeds without rerender duplicates`, async () => {
    const h = setup(preferences);
    try {
      await flush();
      assert.equal(h.requests.length, expected);
      h.update();
      await flush();
      assert.equal(h.requests.length, expected);
      if (!expected) assert.deepEqual(h.activeLeagues(), []);
      h.settle();
      await flush();
      if (expected) assert.equal(h.state.loading, false);
    } finally {
      h.stop();
    }
  });
}

test("soccer team favorites retain all existing Home soccer competitions", async () => {
  const h = setup({ favorites: ["socc:1"] });
  try {
    await flush();
    assert.equal(h.requests.length, 12);
    assert.ok(h.requests.every(({ url }) => url.includes("/soccer/")));
  } finally {
    h.stop();
  }
});

test("For You suppresses score requests and subscriptions, then Scores loads only needed leagues", async () => {
  const h = setup({ favoriteSports: ["nba", "nfl", "atp"] }, "for you");
  try {
    await flush();
    assert.equal(h.requests.length, 0);
    assert.deepEqual(h.activeLeagues(), []);
    h.update(["scores"]);
    await flush();
    assert.equal(h.requests.length, 3);
    h.settle();
    await flush();
    assert.deepEqual(h.activeLeagues(), ["atp", "nba", "nfl"]);
    h.update(["for you"]);
    await flush();
    assert.deepEqual(h.activeLeagues(), []);
    assert.equal(h.requests.length, 3);
    h.update(["scores"]);
    assert.ok(
      h.state.homeGameSections.length,
      "retained same-account results render immediately",
    );
    assert.equal(h.state.loading, false);
    await flush();
    assert.equal(h.requests.length, 6, "one revalidation per eligible league");
  } finally {
    h.stop();
  }
});

test("preferences hydrate before deciding to load all leagues", async () => {
  const h = setup({ ready: false, favoriteSportsReady: false });
  try {
    await flush();
    assert.equal(h.requests.length, 0);
    assert.equal(h.state.loading, true);
    Object.assign(h.favorites, {
      ready: true,
      favoriteSportsReady: true,
      favorites: ["nhl:1"],
    });
    h.update();
    await flush();
    assert.equal(h.requests.length, 1);
    assert.ok(h.requests[0].url.includes("hockey"));
  } finally {
    h.stop();
  }
});

test("eligibility changes abort requests and ignore late results, including clients that ignore abort", async () => {
  const h = setup({ favoriteSports: ["nba", "nfl"] });
  try {
    await flush();
    const obsolete = [...h.requests];
    h.favorites.favoriteSports = ["mlb"];
    h.update();
    await flush();
    assert.ok(obsolete.every(({ config }) => config.signal.aborted));
    assert.equal(h.requests.length, 3);
    h.requests[2].resolve(response("new"));
    await flush();
    const displayed = JSON.stringify(h.state.homeGameSections);
    obsolete.forEach((request) => request.resolve(response("obsolete")));
    await flush();
    assert.equal(JSON.stringify(h.state.homeGameSections), displayed);
    assert.equal(h.state.loading, false);
    assert.deepEqual(h.activeLeagues(), ["mlb"]);
  } finally {
    h.stop();
  }
});

test("account switch masks retained results immediately and isolates late refresh responses", async () => {
  const h = setup({ favoriteSports: ["nba"] });
  try {
    await flush();
    h.settle("account-one");
    await flush();
    const pending = h.state.handleRefresh();
    await flush();
    const oldRefresh = h.requests.at(-1);
    h.favorites.userId = 2;
    h.update();
    assert.equal(h.state.homeGameSections.length, 0);
    await flush();
    assert.equal(oldRefresh.config.signal.aborted, true);
    h.requests.at(-1).resolve(response("account-two"));
    await flush();
    oldRefresh.resolve(response("account-one-late"));
    await pending;
    await flush();
    assert.ok(JSON.stringify(h.state.homeGameSections).includes("account-two"));
    assert.ok(
      !JSON.stringify(h.state.homeGameSections).includes("account-one"),
    );
  } finally {
    h.stop();
  }
});

test("pull-to-refresh preserves content and refreshes only required feeds once", async () => {
  const h = setup({ favorites: ["nba:1"], favoriteSports: ["nfl"] });
  try {
    await flush();
    h.settle();
    await flush();
    const sections = h.state.homeGameSections;
    const refresh = h.state.handleRefresh();
    await flush();
    assert.equal(h.requests.length, 4);
    assert.equal(h.getRefreshCount(), 2);
    assert.equal(h.state.homeGameSections, sections);
    await h.state.handleRefresh();
    assert.equal(h.requests.length, 4);
    h.settle();
    await refresh;
    await flush();
    assert.equal(h.state.refreshing, false);
  } finally {
    h.stop();
  }
});

test("date navigation and refresh date reset issue one request per eligible league", async () => {
  const h = setup({ favoriteSports: ["nba"] });
  try {
    await flush();
    h.settle();
    await flush();
    h.state.setSelectedDate(new Date(2026, 0, 1));
    await flush();
    assert.equal(h.requests.length, 2);
    h.requests[1].resolve(response("historical"));
    await flush();
    const refresh = h.state.handleRefresh();
    await flush();
    assert.equal(h.requests.length, 3);
    h.requests[2].resolve(response("today"));
    await refresh;
    await flush();
    assert.equal(h.state.refreshing, false);
  } finally {
    h.stop();
  }
});

// Optional local comparison against the preserved pre-edit working tree. No network calls.
if (process.env.TEMPO_HOME_BASELINE) {
  test("measured baseline: personalized Home formerly requested all 26 feeds", async () => {
    const h = setup(
      { favoriteSports: ["nba", "nfl", "atp"] },
      "scores",
      process.env.TEMPO_HOME_BASELINE,
    );
    try {
      await flush();
      assert.equal(h.requests.length, 26);
    } finally {
      h.stop();
    }
  });
}

test("personalized empty results settle without starting an all-league fallback", async () => {
  const h = setup({ favoriteSports: ["nba"] });
  try {
    await flush();
    h.requests[0].resolve({ data: { games: [] } });
    await flush();
    assert.equal(h.state.loading, false);
    assert.equal(h.state.homeGameSections.length, 0);
    assert.equal(h.requests.length, 1);
  } finally {
    h.stop();
  }
});

test("general empty results keep the existing upcoming-date search across all leagues", async () => {
  const h = setup();
  try {
    await flush();
    const initialDay = h.state.selectedDate.getTime();
    h.requests.forEach((request) =>
      request.resolve({ data: { games: [], matches: [], events: [] } }),
    );
    await flush();
    assert.equal(h.state.loading, true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await flush();
    assert.ok(h.state.selectedDate.getTime() > initialDay);
    assert.equal(h.requests.length, 52);
    h.settle();
    await flush();
    assert.equal(h.state.loading, false);
  } finally {
    h.stop();
  }
});

if (process.env.TEMPO_HOME_BASELINE) {
  for (const tab of ["scores", "for you"]) {
    test(`measured baseline: general Home ${tab} previously requested 26 feeds`, async () => {
      const h = setup({}, tab, process.env.TEMPO_HOME_BASELINE);
      try {
        await flush();
        assert.equal(h.requests.length, 26);
      } finally {
        h.stop();
      }
    });
  }
}
