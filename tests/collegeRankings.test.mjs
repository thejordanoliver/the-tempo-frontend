import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const polls = (league) => [
  {
    type: "ap",
    shortName: "AP Poll",
    ranks: [
      {
        current: 1,
        team: { id: league === "wcbb" ? 41 : league === "cfb" ? 61 : 150 },
      },
    ],
    droppedOut: [],
  },
];
const cacheKey = (league) => `college_basketball_rankings_cache_${league}_v3`;
const refreshKey = (league) =>
  `college_basketball_rankings_last_refresh_${league}_v3`;
const cacheEntry = (data, timestamp = Date.now()) =>
  JSON.stringify({ timestamp, data });

function setup(league, entries = [], storageFails = false) {
  const cache = new Map(entries),
    requests = [],
    slots = [],
    effects = [];
  let index = 0,
    queued = false,
    stopped = false,
    state,
    hook,
    updates = 0;
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
  const modules = {
    react: {
      useState(initial) {
        const i = index++;
        slots[i] ??= { value: initial };
        return [
          slots[i].value,
          (next) => {
            updates++;
            slots[i].value =
              typeof next === "function" ? next(slots[i].value) : next;
            schedule();
          },
        ];
      },
      useRef(current) {
        const i = index++;
        return (slots[i] ??= { current });
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
    },
    "@react-native-async-storage/async-storage": {
      getItem: async (key) => {
        if (storageFails) throw new Error("storage unavailable");
        return cache.get(key) ?? null;
      },
      setItem: async (key, value) => {
        if (storageFails) throw new Error("storage unavailable");
        cache.set(key, value);
      },
    },
    "utils/apiClient": {
      apiClient: {
        get: (url, options) =>
          new Promise((resolve, reject) => {
            requests.push({
              url,
              signal: options.signal,
              resolve: (data) => resolve({ data }),
              reject,
            });
          }),
      },
    },
  };
  function load(path) {
    const exports = {};
    vm.runInNewContext(
      ts.transpileModule(fs.readFileSync(path, "utf8"), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          esModuleInterop: true,
        },
      }).outputText,
      {
        exports,
        AbortController,
        JSON,
        console: { warn() {} },
        require(name) {
          assert.ok(name in modules, `Unexpected import: ${name}`);
          return modules[name];
        },
      },
    );
    return exports;
  }
  modules["utils/standings/collegeRankings"] = load(
    "utils/standings/collegeRankings.ts",
  );
  hook = load("hooks/LeagueHooks/useCollegeRankings.ts").useCollegeRankings;
  function render() {
    index = 0;
    state = hook(league);
    while (effects.length) effects.shift()();
  }
  render();
  return {
    cache,
    requests,
    get state() {
      return state;
    },
    get updates() {
      return updates;
    },
    changeLeague(next) {
      league = next;
      render();
    },
    stop() {
      stopped = true;
      slots.forEach((slot) => slot?.cleanup?.());
    },
  };
}

for (const league of ["mcbb", "wcbb", "cfb"]) {
  test(`${league} loads and refreshes its own endpoint`, async () => {
    const h = setup(league);
    try {
      await flush();
      assert.equal(h.state.loading, true);
      assert.equal(h.requests[0].url, `/api/standings/${league}/rankings`);
      h.requests[0].resolve({ rankings: polls(league) });
      await flush();
      assert.equal(h.state.loading, false);
      assert.deepEqual(h.state.rankings[0].ranks, polls(league)[0].ranks);
      assert.deepEqual(
        [...h.state.rankedTeamIds],
        [String(polls(league)[0].ranks[0].team.id)],
      );
      if (league === "cfb") assert.equal(h.cache.size, 0);
      else
        assert.deepEqual(
          JSON.parse(h.cache.get(cacheKey(league))).data,
          polls(league),
        );
      const pending = h.state.refresh();
      await flush();
      assert.equal(h.state.refreshing, true);
      assert.equal(h.state.loading, false);
      assert.equal(h.requests[1].url, `/api/standings/${league}/rankings`);
      h.requests[1].resolve({ rankings: polls(league) });
      await pending;
      await flush();
      assert.equal(h.state.refreshing, false);
    } finally {
      h.stop();
    }
  });
}

test("women's rankings ignore legacy and men's cached polls", async () => {
  const incorrect = cacheEntry(polls("mcbb"));
  const h = setup("wcbb", [
    ["mcbb_rankings_cache_wcbb_v2", incorrect],
    ["mcbb_rankings_last_refresh_wcbb_v2", String(Date.now())],
    [cacheKey("mcbb"), incorrect],
    [refreshKey("mcbb"), String(Date.now())],
  ]);
  try {
    await flush();
    assert.equal(h.requests[0].url, "/api/standings/wcbb/rankings");
    h.requests[0].resolve({ rankings: polls("wcbb") });
    await flush();
    assert.deepEqual(h.state.rankings, polls("wcbb"));
  } finally {
    h.stop();
  }
});

test("fresh basketball cache skips a request until a forced refresh", async () => {
  const h = setup("mcbb", [
    [cacheKey("mcbb"), cacheEntry(polls("mcbb"))],
    [refreshKey("mcbb"), String(Date.now())],
  ]);
  try {
    await flush();
    assert.equal(h.requests.length, 0);
    assert.equal(h.state.loading, false);
    assert.deepEqual(h.state.rankings, polls("mcbb"));
    const pending = h.state.refresh();
    await flush();
    assert.equal(h.requests.length, 1);
    h.requests[0].reject({ response: { data: { error: "Offline" } } });
    await pending;
    await flush();
    assert.equal(h.state.error, "Offline");
    assert.equal(h.state.refreshing, false);
    assert.deepEqual(h.state.rankings, polls("mcbb"));
  } finally {
    h.stop();
  }
});

test("cached basketball results stay visible during background revalidation", async () => {
  const h = setup("wcbb", [[cacheKey("wcbb"), cacheEntry(polls("wcbb"))]]);
  try {
    await flush();
    assert.equal(h.requests.length, 1);
    assert.equal(h.state.loading, false);
    assert.deepEqual(h.state.rankings, polls("wcbb"));
    h.requests[0].resolve({ rankings: [] });
    await flush();
    assert.equal(h.state.rankings.length, 0);
  } finally {
    h.stop();
  }
});

for (const cached of [
  "invalid json",
  cacheEntry(polls("mcbb"), Date.now() - 7 * 60 * 60 * 1000),
]) {
  test(`invalid or expired basketball cache fetches fresh rankings: ${cached.slice(0, 20)}`, async () => {
    const h = setup("mcbb", [[cacheKey("mcbb"), cached]]);
    try {
      await flush();
      assert.equal(h.requests.length, 1);
      h.requests[0].resolve({ rankings: polls("mcbb") });
      await flush();
      assert.equal(h.state.error, null);
      assert.deepEqual(h.state.rankings, polls("mcbb"));
    } finally {
      h.stop();
    }
  });
}

test("football retains separate AP, Coaches, CFP and FCS poll slots", async () => {
  const h = setup("cfb");
  try {
    await flush();
    const fcs = { current: 1, team: { id: 1, groups: { shortName: "FCS" } } };
    h.requests[0].resolve({
      rankings: [
        { type: "ap", shortName: "AP Poll", ranks: polls("cfb")[0].ranks },
        { type: "ap", shortName: "Coaches", ranks: [fcs] },
        { type: "playoff", shortName: "College Football Playoff", ranks: [] },
      ],
    });
    await flush();
    assert.deepEqual(
      Array.from(h.state.rankings, ({ type }) => type),
      ["ap", "coaches", "cfp", "fcs"],
    );
    assert.deepEqual(h.state.rankings[0].ranks, polls("cfb")[0].ranks);
    assert.equal(h.state.rankings[1].ranks.length, 0);
    assert.deepEqual(h.state.rankings[3].ranks, [fcs]);
    assert.equal(h.state.rankings[3].outsideTop25.length, 0);
  } finally {
    h.stop();
  }
});

test("a league change aborts and ignores the previous league's late response", async () => {
  const h = setup("mcbb");
  try {
    await flush();
    h.changeLeague("wcbb");
    assert.equal(h.state.rankings.length, 0);
    await flush();
    assert.equal(h.requests[0].signal.aborted, true);
    h.requests[1].resolve({ rankings: polls("wcbb") });
    await flush();
    h.requests[0].resolve({ rankings: polls("mcbb") });
    await flush();
    assert.deepEqual(h.state.rankings, polls("wcbb"));
    assert.equal(h.cache.has(cacheKey("mcbb")), false);
  } finally {
    h.stop();
  }
});

test("the newest refresh wins even if an earlier request resolves later", async () => {
  const h = setup("cfb");
  try {
    await flush();
    const pending = h.state.refresh();
    await flush();
    h.requests[1].resolve({ rankings: polls("cfb") });
    await pending;
    await flush();
    h.requests[0].resolve({ rankings: [] });
    await flush();
    assert.deepEqual(h.state.rankings[0].ranks, polls("cfb")[0].ranks);
  } finally {
    h.stop();
  }
});

test("unmount aborts requests and prevents late state updates", async () => {
  const h = setup("cfb");
  await flush();
  h.stop();
  const updates = h.updates;
  assert.equal(h.requests[0].signal.aborted, true);
  h.requests[0].resolve({ rankings: polls("cfb") });
  await flush();
  assert.equal(h.updates, updates);
});

test("storage failures do not prevent successful basketball requests", async () => {
  const h = setup("wcbb", [], true);
  try {
    await flush();
    h.requests[0].resolve({ rankings: polls("wcbb") });
    await flush();
    assert.equal(h.state.error, null);
    assert.deepEqual(h.state.rankings, polls("wcbb"));
  } finally {
    h.stop();
  }
});
