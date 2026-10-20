import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup(initialFavorites = {}) {
  const slots = [];
  const effects = [];
  const requests = [];
  let index = 0;
  let queued = false;
  let stopped = false;
  let state;
  let favorites = { userId: 1, favorites: ["nba:1"], ready: true, isLoading: false, ...initialFavorites };
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const schedule = () => {
    if (queued || stopped) return;
    queued = true;
    queueMicrotask(() => { queued = false; if (!stopped) render(); });
  };
  const memo = (factory, deps) => {
    const position = index++;
    if (!slots[position] || !same(slots[position].deps, deps)) slots[position] = { value: factory(), deps };
    return slots[position].value;
  };
  const react = {
    createContext: () => ({ Provider: "provider" }),
    useState(initial) {
      const position = index++;
      slots[position] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slots[position].value, (next) => {
        const value = typeof next === "function" ? next(slots[position].value) : next;
        if (Object.is(value, slots[position].value)) return;
        slots[position].value = value;
        schedule();
      }];
    },
    useRef(initial) { const position = index++; slots[position] ??= { current: initial }; return slots[position]; },
    useMemo: memo,
    useCallback: (callback, deps) => memo(() => callback, deps),
    useEffect(callback, deps) {
      const position = index++;
      if (slots[position] && same(slots[position].deps, deps)) return;
      const previous = slots[position];
      slots[position] = { deps, cleanup: previous?.cleanup };
      effects.push(() => { previous?.cleanup?.(); slots[position].cleanup = callback(); });
    },
  };
  const modules = {
    react,
    "react/jsx-runtime": { jsx: (_type, props) => props },
    "./FavoriteTeamsContext": { useFavoriteTeamsContext: () => favorites },
    "hooks/ExploreHooks/useExploreWidgetConfiguration": {
      useExploreWidgetConfiguration: () => ({ widgets: [{ id: "games", type: "favorite_games", favoriteGameLeagues: ["nba"] }], ready: true }),
    },
    "hooks/ExploreHooks/useExploreWidgetLiveUpdates": { useExploreWidgetLiveUpdates() {} },
    "utils/widgets/exploreFavoriteGames": { prepareExploreFavoriteGames: (games) => games },
    "types/widgets": { EXPLORE_WIDGET_LEAGUES: ["nba"] },
    "services/exploreWidgetsApi": {
      getExploreWidgets: () => new Promise((resolve, reject) => requests.push({ resolve, reject })),
    },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync("contexts/ExploreWidgetsContext.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    exports, AbortController, console, setTimeout, clearTimeout,
    require(name) { assert.ok(name in modules, `Unexpected import: ${name}`); return modules[name]; },
  });
  function render() {
    index = 0;
    state = exports.ExploreWidgetsProvider({ children: null }).value;
    while (effects.length) effects.shift()();
  }
  render();
  return {
    get state() { return state; },
    requests,
    updateFavorites(next) { favorites = { ...favorites, ...next }; render(); },
    stop() { stopped = true; slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

const emptyResponse = { version: 1, requestedLeagues: ["nba"], favoriteTeamKeys: ["nba:1"], games: [], failures: [] };

test("games remain loading before the focus request starts and until it completes", async () => {
  const h = setup();
  try {
    assert.equal(h.state.loading, true);
    await flush();
    assert.equal(h.state.loading, true);
    const pending = h.state.ensureWidgetData();
    await flush();
    assert.equal(h.requests.length, 1);
    assert.equal(h.state.loading, true);
    h.requests[0].resolve(emptyResponse);
    await pending; await flush();
    assert.equal(h.state.loading, false);
  } finally { h.stop(); }
});

test("a failed games request settles the loading gate and preserves its retry error", async () => {
  const h = setup();
  try {
    await flush();
    const pending = h.state.ensureWidgetData();
    h.requests[0].reject(new Error("Unavailable"));
    await pending; await flush();
    assert.equal(h.state.loading, false);
    assert.ok(h.state.error);
  } finally { h.stop(); }
});

test("favorites must finish loading before no favorites counts as a ready empty state", async () => {
  const h = setup({ favorites: [], ready: false, isLoading: true });
  try {
    assert.equal(h.state.loading, true);
    await flush();
    h.updateFavorites({ ready: true, isLoading: false });
    assert.equal(h.state.loading, false);
    await h.state.ensureWidgetData(); await flush();
    assert.equal(h.requests.length, 0);
    assert.equal(h.state.loading, false);
  } finally { h.stop(); }
});
