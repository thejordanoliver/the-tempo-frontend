import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const polls = (league) => [{ type: "ap", shortName: "AP Poll", ranks: [
  { current: 1, team: { id: league === "wcbb" ? 41 : 150 } },
], droppedOut: [] }];

async function setup(league, entries = []) {
  const cache = new Map(entries), requests = [], states = [], effects = [];
  const modules = {
    react: {
      useState(initial) {
        const slot = { value: initial };
        states.push(slot);
        return [initial, (next) => { slot.value = next; }];
      },
      useMemo: (callback) => callback(),
      useCallback: (callback) => callback,
      useEffect: (callback) => effects.push(callback),
    },
    "@react-native-async-storage/async-storage": {
      getItem: async (key) => cache.get(key) ?? null,
      setItem: async (key, value) => { cache.set(key, value); },
      removeItem: async (key) => { cache.delete(key); },
    },
    "utils/apiClient": { apiClient: { get: async (url) => {
      requests.push(url);
      return { data: { rankings: polls(league) } };
    } } },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync("hooks/BasketballHooks/useCollegeBasketballRankings.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, { exports, require: (name) => modules[name], console });
  const result = exports.useCollegeBasketballRankings(league);
  effects.forEach((effect) => effect());
  await new Promise((resolve) => setTimeout(resolve, 0));
  return { cache, requests, states, result };
}

for (const league of ["mcbb", "wcbb"]) {
  test(`${league} loads and refreshes its own poll endpoint`, async () => {
    const h = await setup(league);
    assert.deepEqual(h.requests, [`api/standings/${league}/rankings`]);
    assert.deepEqual(h.states[0].value, polls(league));
    await h.result.refresh();
    assert.deepEqual(h.requests, Array(2).fill(`api/standings/${league}/rankings`));
    assert.deepEqual(h.states[0].value, polls(league));
  });
}

test("women's rankings discard previously cached men's polls", async () => {
  const incorrectCache = JSON.stringify({ timestamp: Date.now(), data: polls("mcbb") });
  const h = await setup("wcbb", [
    ["mcbb_rankings_cache_wcbb_v2", incorrectCache],
    ["mcbb_rankings_last_refresh_wcbb_v2", String(Date.now())],
    ["college_basketball_rankings_cache_mcbb_v3", incorrectCache],
    ["college_basketball_rankings_last_refresh_mcbb_v3", String(Date.now())],
  ]);
  assert.deepEqual(h.requests, ["api/standings/wcbb/rankings"]);
  assert.deepEqual(h.states[0].value, polls("wcbb"));
  assert.deepEqual(JSON.parse(h.cache.get("college_basketball_rankings_cache_wcbb_v3")).data, polls("wcbb"));
});
