import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import dayjs from "dayjs";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup(
  initialArgs = ["/api/games/volleyball/mcvb"],
  hookName = "useVolleyballResource",
) {
  const slots = [];
  const effects = [];
  const requests = [];
  let index = 0;
  let queued = false;
  let stopped = false;
  let args = initialArgs;
  let result;
  let subscription;
  const same = (a, b) =>
    a &&
    b &&
    a.length === b.length &&
    a.every((value, i) => Object.is(value, b[i]));
  const schedule = () => {
    if (queued || stopped) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      if (!stopped) render();
    });
  };
  const modules = {
    react: {
      useState(initial) {
        const position = index++;
        slots[position] ??= { value: initial };
        return [
          slots[position].value,
          (next) => {
            const value =
              typeof next === "function" ? next(slots[position].value) : next;
            if (Object.is(value, slots[position].value)) return;
            slots[position].value = value;
            schedule();
          },
        ];
      },
      useRef(initial) {
        const position = index++;
        slots[position] ??= { current: initial };
        return slots[position];
      },
      useCallback(callback, deps) {
        const position = index++;
        if (!slots[position] || !same(slots[position].deps, deps)) {
          slots[position] = { value: callback, deps };
        }
        return slots[position].value;
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
    },
    dayjs,
    "hooks/useLiveSportsSubscription": {
      useLiveSportsSubscription(options) {
        subscription = options;
      },
    },
    "utils/volleyball": { volleyballDirectoryTeam: (team) => team },
    "utils/apiClient": {
      apiClient: {
        get(url, options) {
          let resolve;
          let reject;
          const promise = new Promise((yes, no) => {
            resolve = yes;
            reject = no;
          });
          requests.push({ url, ...options, resolve, reject });
          return promise;
        },
      },
    },
  };
  function load(file) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }).outputText;
    vm.runInNewContext(source, {
      exports,
      require(name) {
        assert.ok(name in modules, `Unexpected import: ${name}`);
        return modules[name];
      },
      AbortController,
      Error,
      console: { error() {} },
    });
    return exports;
  }
  const base = load("hooks/VolleyballHooks/useVolleyball.ts");
  modules["./useVolleyball"] = base;
  modules["utils/navigation/volleyballGame"] = load(
    "utils/navigation/volleyballGame.ts",
  );
  const hook =
    hookName === "useVolleyballGameDetails"
      ? load("hooks/VolleyballHooks/useVolleyballGameDetails.ts")[hookName]
      : base[hookName];
  function render() {
    index = 0;
    result = hook(...args);
    while (effects.length) effects.shift()();
  }
  render();
  return {
    requests,
    get subscription() {
      return subscription;
    },
    get state() {
      return result;
    },
    update(next) {
      args = next;
      render();
    },
    stop() {
      stopped = true;
      slots.forEach((slot) => slot?.cleanup?.());
    },
  };
}

test("volleyball requests use the shared backend client and abort obsolete league requests", async () => {
  const h = setup();
  await flush();
  assert.equal(h.requests[0].url, "/api/games/volleyball/mcvb");
  h.update(["/api/games/volleyball/wcvb"]);
  assert.equal(h.state.data, null);
  await flush();
  assert.equal(h.requests[0].signal.aborted, true);
  h.requests[1].resolve({ data: { games: [{ id: "women" }] } });
  await flush();
  h.requests[0].resolve({ data: { games: [{ id: "men" }] } });
  await flush();
  assert.equal(h.state.data.games[0].id, "women");
  assert.equal(h.state.loading, false);
  h.stop();
});

test("refresh failures retain the displayed match data and expose retry state", async () => {
  const h = setup();
  await flush();
  h.requests[0].resolve({ data: { games: [{ id: "match" }] } });
  await flush();
  const refresh = h.state.refresh();
  await flush();
  assert.equal(h.state.data.games[0].id, "match");
  assert.equal(h.state.refreshing, true);
  h.requests[1].reject(new Error("offline"));
  await refresh;
  await flush();
  assert.equal(h.state.data.games[0].id, "match");
  assert.equal(h.state.error.message, "offline");
  assert.equal(h.state.refreshing, false);
  h.stop();
});

test("live replacements invalidate older HTTP responses", async () => {
  const h = setup();
  await flush();
  h.state.replace({ games: [{ id: "live", sets: [25, 27] }] });
  await flush();
  assert.equal(h.requests[0].signal.aborted, true);
  h.requests[0].resolve({ data: { games: [{ id: "stale" }] } });
  await flush();
  assert.equal(h.state.data.games[0].id, "live");
  h.stop();
});

test("unmount before the deferred effect prevents a request", async () => {
  const h = setup();
  h.stop();
  await flush();
  assert.equal(h.requests.length, 0);
});

test("disabled volleyball resources do not request a fallback endpoint", async () => {
  const h = setup([null]);
  await flush();
  assert.equal(h.requests.length, 0);
  assert.equal(h.state.loading, false);
  h.stop();
});

for (const league of ["mcvb", "wcvb"]) {
  test(`${league} game hook requests and subscribes with the league key while retaining metadata`, async () => {
    const h = setup([league, "401902970"], "useVolleyballGame");
    await flush();
    assert.equal(
      h.requests[0].url,
      `/api/games/volleyball/game/${league}/401902970`,
    );
    assert.equal(h.subscription.kind, "game");
    assert.equal(h.subscription.payload.league, league);
    assert.equal(h.subscription.payload.gameId, "401902970");
    const season = { year: 2026, type: 2, slug: "regular-season" };
    const details = {
      league,
      season,
      game: {
        id: "401902970",
        season,
        league: {
          id: league === "mcvb" ? 401 : 402,
          uid: `s:400~l:${league === "mcvb" ? 401 : 402}`,
          code: league,
          name: "College Volleyball",
          slug: `${league === "mcvb" ? "mens" : "womens"}-college-volleyball`,
        },
      },
    };
    h.requests[0].resolve({ data: details });
    await flush();
    assert.equal(h.state.data, details);
    assert.equal(h.state.data.game.league.code, league);
    assert.equal(h.state.data.game.season.slug, "regular-season");
    const updated = {
      ...details,
      game: {
        ...details.game,
        season: { year: 2026, type: 3, slug: "post-season" },
      },
    };
    h.subscription.onUpdate(updated);
    await flush();
    assert.equal(h.state.data, updated);
    assert.equal(h.state.data.game.season.slug, "post-season");
    h.stop();
  });

  test(`${league} scoreboard hook preserves game metadata and calendar responses`, async () => {
    const calendars = [];
    const h = setup(
      [new Date(2026, 9, 19), league, (data) => calendars.push(data)],
      "useVolleyballGames",
    );
    await flush();
    assert.equal(
      h.requests[0].url,
      `/api/games/volleyball/${league}?date=20261019`,
    );
    assert.equal(h.subscription.payload.league, league);
    assert.equal(h.subscription.payload.date, "20261019");
    const season = { year: 2026, type: 2, slug: "regular-season" };
    const data = {
      league,
      season,
      games: [{ id: "401902970", league: { code: league }, season }],
      calendar: ["2026-10-19"],
    };
    h.requests[0].resolve({ data });
    await flush();
    assert.equal(h.state.games, data.games);
    assert.equal(h.state.data.season, season);
    assert.equal(calendars.at(-1), data);
    h.stop();
  });

  test(`${league} schedule hook uses the key for historical requests and live subscriptions`, async () => {
    const h = setup([league, "221", "2026"], "useVolleyballSchedule");
    await flush();
    assert.equal(
      h.requests[0].url,
      `/api/games/volleyball/team/${league}/221/2026`,
    );
    assert.equal(h.subscription.payload.league, league);
    assert.equal(h.subscription.payload.season, "2026");
    assert.equal(h.subscription.payload.feed, "teamSchedule");
    h.stop();
  });
}

test("game hook disables HTTP and live updates without a game ID", async () => {
  const h = setup(["wcvb", ""], "useVolleyballGame");
  await flush();
  assert.equal(h.requests.length, 0);
  assert.equal(h.subscription.enabled, false);
  assert.equal(h.state.loading, false);
  h.stop();
});

for (const league of ["mcvb", "wcvb"]) {
  test(`${league} details hook uses the standard endpoint and exposes score and details`, async () => {
    const h = setup([league, "401902970"], "useVolleyballGameDetails");
    await flush();
    assert.equal(
      h.requests[0].url,
      `/api/volleyball/details?league=${league}&gameId=401902970`,
    );
    assert.equal(h.subscription.payload.league, league);
    assert.equal(h.subscription.kind, "game");
    const data = {
      score: {
        gameId: "401902970",
        status: { state: "in" },
        sets: [{ number: 1, home: 18, away: 20 }],
      },
      details: { available: { playerStats: false } },
    };
    h.requests[0].resolve({ data });
    await flush();
    assert.equal(h.state.score, data.score);
    assert.equal(h.state.details, data.details);
    assert.equal(h.state.isLive, true);
    assert.equal(h.state.loading, false);
    const updated = {
      ...data,
      score: { ...data.score, status: { state: "post" } },
    };
    h.subscription.onUpdate(updated);
    await flush();
    assert.equal(h.state.score, updated.score);
    assert.equal(h.state.isLive, false);
    h.stop();
  });
}

test("details hook ignores a previous match response after route changes", async () => {
  const h = setup(["mcvb", "401870470"], "useVolleyballGameDetails");
  await flush();
  h.update(["wcvb", "401902970"]);
  await flush();
  assert.equal(h.requests[0].signal.aborted, true);
  const current = {
    score: { gameId: "401902970", status: { state: "pre" } },
    details: {},
  };
  h.requests[1].resolve({ data: current });
  await flush();
  h.requests[0].resolve({
    data: { score: { gameId: "old", status: { state: "post" } }, details: {} },
  });
  await flush();
  assert.equal(h.state.score.gameId, "401902970");
  h.stop();
});

test("details hook keeps loaded details visible if pull to refresh fails", async () => {
  const h = setup(["wcvb", 401902970], "useVolleyballGameDetails");
  await flush();
  const data = {
    score: { status: { state: "in" } },
    details: { headline: "Match" },
  };
  h.requests[0].resolve({ data });
  await flush();
  const refresh = h.state.refresh();
  h.requests[1].reject(new Error("offline"));
  await refresh;
  await flush();
  assert.equal(h.state.score, data.score);
  assert.equal(h.state.details, data.details);
  assert.equal(h.state.error.message, "offline");
  assert.equal(h.state.refreshing, false);
  h.stop();
});

test("invalid match links disable the details request and subscription", async () => {
  for (const args of [
    [null, "401902970"],
    ["wcvb", "bad"],
    ["wcvb", null],
    ["nfl", "401902970"],
  ]) {
    const h = setup(args, "useVolleyballGameDetails");
    await flush();
    assert.equal(h.requests.length, 0);
    assert.equal(h.subscription.enabled, false);
    assert.equal(h.state.loading, false);
    h.stop();
  }
});
