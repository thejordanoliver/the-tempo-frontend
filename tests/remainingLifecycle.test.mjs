import test from "node:test";
import assert from "node:assert/strict";
import {
  sportsHookHarness,
  deferred,
  flush,
} from "./helpers/sportsHookHarness.mjs";

function setup(file, name, args) {
  const timers = new Map();
  let timerId = 0,
    focused = true;
  const h = sportsHookHarness({
    globals: {
      setInterval(fn) {
        const id = ++timerId;
        timers.set(id, fn);
        return id;
      },
      clearInterval(id) {
        timers.delete(id);
      },
      setTimeout(fn) {
        const id = ++timerId;
        timers.set(id, fn);
        return id;
      },
      clearTimeout(id) {
        timers.delete(id);
      },
    },
  });
  const listeners = new Set(),
    requests = [];
  const app = {
    currentState: "active",
    addEventListener(_, fn) {
      listeners.add(fn);
      return { remove: () => listeners.delete(fn) };
    },
  };
  h.modules["react-native"] = { AppState: app };
  h.modules["expo-router"] = {
    useFocusEffect(callback) {
      h.react.useEffect(
        () => (focused ? callback() : undefined),
        [callback, focused],
      );
    },
  };
  h.modules["utils/apiClient"] = {
    apiClient: {
      get(url, config) {
        const r = deferred();
        requests.push({ url, config, ...r });
        return r.promise;
      },
    },
  };
  h.start(h.load(file)[name], args);
  return Object.assign(h, {
    requests,
    timers,
    focus(value) {
      focused = value;
      h.update();
    },
    app(value) {
      app.currentState = value;
      listeners.forEach((fn) => fn(value));
    },
    tick() {
      const current = [...timers.values()];
      timers.clear();
      current.forEach((fn) => fn());
    },
  });
}

for (const [file, name, args, response, dataKey] of [
  [
    "hooks/BasketballHooks/useWNBAPlayoffs.ts",
    "useWNBAPlayoffs",
    [2026],
    {
      season: 2026,
      rounds: [{ series: [{ games: [{ status: { state: "in" } }] }] }],
    },
    "data",
  ],
  [
    "hooks/LeagueHooks/useLeagueDraft.ts",
    "useDraft",
    ["nfl", 2026],
    { year: 2026, status: { state: "in" } },
    "draft",
  ],
])
  test(`${name} pauses, retains data, cancels old work, and resumes without duplicate requests`, async () => {
    const h = setup(file, name, args);
    try {
      await flush();
      assert.equal(h.requests.length, 1);
      h.requests[0].resolve({ data: response });
      await flush();
      assert.ok(h.state[dataKey]);
      h.focus(false);
      await flush();
      assert.equal(h.timers.size, 0);
      h.tick();
      assert.equal(h.requests.length, 1);
      assert.ok(h.state[dataKey]);
      h.focus(true);
      await flush();
      assert.equal(h.requests.length, 2);
      assert.ok(h.state[dataKey]);
      h.app("background");
      await flush();
      assert.equal(h.requests[1].config.signal.aborted, true);
      h.requests[1].resolve({ data: { ...response, obsolete: true } });
      await flush();
      assert.equal(h.state[dataKey].obsolete, undefined);
      h.app("active");
      await flush();
      assert.equal(h.requests.length, 3);
      h.requests[2].resolve({ data: response });
      await flush();
      const next = args.slice();
      next[next.length - 1] = 2025;
      h.update(next);
      assert.equal(h.state[dataKey], null);
      await flush();
      assert.equal(h.requests.length, 4);
    } finally {
      h.stop();
      assert.equal(h.timers.size, 0);
    }
  });

test("vote sockets pause on blur/background, rejoin on foreground and ignore an obsolete room callback", async () => {
  const timers = new Map();
  let nextTimer = 0,
    focused = true;
  const h = sportsHookHarness({
    globals: {
      setTimeout(fn) {
        timers.set(++nextTimer, fn);
        return nextTimer;
      },
      clearTimeout(id) {
        timers.delete(id);
      },
    },
  });
  const listeners = new Set(),
    sockets = [];
  let token = "first";
  let fetchVoteResults = async () => ({ votes: [] });
  const app = {
    currentState: "active",
    addEventListener(_, fn) {
      listeners.add(fn);
      return { remove: () => listeners.delete(fn) };
    },
  };
  h.modules["react-native"] = { AppState: app };
  h.modules["expo-router"] = {
    useFocusEffect(fn) {
      h.react.useEffect(() => (focused ? fn() : undefined), [fn, focused]);
    },
  };
  h.modules["./usePredictionScoring"] = {
    usePredictionScoring: () => ({ scoring: null, retryScoring() {} }),
  };
  h.modules["services/fanPredictionsApi"] = {
    castRankedPrediction: async () => {},
  };
  h.modules["./useGameVotes"] = {
    fetchVoteResults: (...args) => fetchVoteResults(...args),
  };
  h.modules["utils/apiConfig"] = {
    getSocketNamespaceUrl: () => "https://backend.test/votes",
  };
  h.modules["utils/apiClient"] = {
    getAccessToken: async () => token,
    apiClient: { post: async () => {} },
  };
  h.modules["socket.io-client"] = {
    io(_url, options) {
      const handlers = {};
      const s = {
        options,
        handlers,
        connected: false,
        on(name, fn) {
          handlers[name] = fn;
        },
        emit(name, id, ack) {
          if (name === "joinGame")
            ack?.({ ok: true, gameId: id, votes: [{ teamId: 1, count: 3 }] });
        },
        connect() {
          this.connected = true;
          handlers.connect?.();
        },
        disconnect() {
          this.connected = false;
        },
        removeAllListeners() {},
      };
      sockets.push(s);
      return s;
    },
  };
  h.start(h.load("hooks/useLiveVotes.ts").useLiveVotes, [401]);
  try {
    await flush();
    assert.equal(sockets.length, 1);
    assert.equal(h.state.isConnected, true);
    assert.equal(h.state.votes[0].count, 3);
    const stale = sockets[0].handlers.voteUpdate;
    focused = false;
    h.update();
    await flush();
    assert.equal(sockets[0].connected, false);
    assert.equal(h.state.votes[0].count, 3);
    focused = true;
    h.update();
    await flush();
    assert.equal(sockets.length, 2);
    token = "refreshed";
    let auth;
    await sockets[1].auth((value) => {
      auth = value;
    });
    assert.equal(auth.token, "refreshed");
    const oldVoteResult = deferred();
    fetchVoteResults = () => oldVoteResult.promise;
    sockets[1].connected = false;
    const pendingVote = h.state.castVote(1);
    await flush();
    h.update([402]);
    assert.equal(h.state.votes, null);
    await flush();
    oldVoteResult.resolve({ votes: [{ count: 999 }] });
    await pendingVote;
    stale({ gameId: 401, votes: [{ count: 999 }] });
    await flush();
    assert.equal(h.state.votes[0].count, 3);
    app.currentState = "background";
    listeners.forEach((fn) => fn("background"));
    await flush();
    assert.equal(sockets.at(-1).connected, false);
    app.currentState = "active";
    listeners.forEach((fn) => fn("active"));
    await flush();
    assert.equal(sockets.length, 4);
  } finally {
    h.stop();
    assert.ok(sockets.every((s) => !s.connected));
  }
});

test("root widget subscriptions follow board visibility and reject callbacks after cleanup", async () => {
  const h = sportsHookHarness();
  const registrations = [];
  let stopped = 0;
  h.modules["services/liveSportsSocket"] = {
    subscribeSportsLive(options) {
      registrations.push(options);
      return () => {
        stopped++;
      };
    },
  };
  const game = {
    id: "401",
    status: { state: "in" },
    home: { id: 1 },
    away: { id: 2 },
  };
  let cache = {
    key: "account:1",
    userId: 1,
    response: {
      games: [
        {
          key: "basketball:nba:401",
          gameId: "401",
          sport: "basketball",
          league: "nba",
          favoriteTeamKeys: ["nba:1"],
          game,
        },
      ],
    },
  };
  const options = {
    enabled: false,
    cache,
    dataKey: cache.key,
    relevantFavoriteKeySet: new Set(["nba:1"]),
    setCache(fn) {
      cache = fn(cache);
    },
    userId: 1,
  };
  const hook = h.load(
    "hooks/ExploreHooks/useExploreWidgetLiveUpdates.ts",
  ).useExploreWidgetLiveUpdates;
  h.start(hook, [options]);
  await flush();
  assert.equal(registrations.length, 0);
  h.update([{ ...options, enabled: true }]);
  await flush();
  assert.equal(registrations.length, 1);
  h.update([options]);
  await flush();
  assert.equal(stopped, 1);
  registrations[0].listener({ payload: { game: { ...game, id: "999" } } });
  assert.equal(cache.response.games[0].game.id, "401");
  h.stop();
});

for (const [file, name, args, response, key] of [
  [
    "hooks/BasketballHooks/useWNBAPlayoffs.ts",
    "useWNBAPlayoffs",
    [2026],
    { season: 2026, rounds: [] },
    "data",
  ],
  [
    "hooks/LeagueHooks/useLeagueDraft.ts",
    "useDraft",
    ["nfl", 2026],
    { year: 2026, status: { state: "in" } },
    "draft",
  ],
])
  test(`${name} disables a mounted hidden tab and clears interrupted refresh state on resume`, async () => {
    const h = setup(file, name, [...args, { enabled: false }]);
    try {
      await flush();
      assert.equal(h.requests.length, 0);
      h.update([...args, { enabled: true }]);
      await flush();
      assert.equal(h.requests.length, 1);
      h.requests[0].resolve({ data: response });
      await flush();
      assert.ok(h.state[key]);
      void h.state.refresh();
      await flush();
      assert.equal(h.requests.length, 2);
      h.app("background");
      await flush();
      h.requests[1].resolve({ data: response });
      await flush();
      h.app("active");
      await flush();
      assert.equal(h.requests.length, 3);
      assert.equal(h.state.loading, false);
      assert.notEqual(h.state.refreshing, true);
      h.update([...args, { enabled: false }]);
      await flush();
      assert.equal(h.requests[2].config.signal.aborted, true);
      assert.equal(h.timers.size, 0);
      assert.ok(h.state[key]);
    } finally {
      h.stop();
    }
  });
