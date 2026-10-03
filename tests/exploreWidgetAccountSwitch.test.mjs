import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { ExploreWidgetSync } from "../utils/exploreWidgetSync.ts";

const widget = { id: "account-a-widget", type: "standings", title: "Standings", createdAt: 1, size: "medium", order: 0, standingsLeague: "nba" };
const accountSettings = { schemaVersion: 2, widgets: [widget], revision: 1, updatedAt: "2026-10-02T00:00:00Z" };
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// Exercise the actual hook's effects and session subscription without native UI modules.
function setup() {
  const slots = [];
  let index = 0, queued = false, contextUserId = 1, storedUserId = 1, listener;
  let result, unmounted = false;
  const effects = [];
  const calls = [];
  const caches = new Map([["1", { version: 2, widgets: [widget], revision: 1, pending: false }]]);
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const schedule = () => {
    if (queued || unmounted) return;
    queued = true;
    queueMicrotask(() => { queued = false; if (!unmounted) render(); });
  };
  const memo = (factory, deps) => {
    const position = index++;
    if (!slots[position] || !same(slots[position].deps, deps)) slots[position] = { value: factory(), deps };
    return slots[position].value;
  };
  const react = {
    useState(initial) {
      const position = index++;
      slots[position] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slots[position].value, (next) => {
        const value = typeof next === "function" ? next(slots[position].value) : next;
        if (Object.is(value, slots[position].value)) return;
        slots[position].value = value; schedule();
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
    "react-native": { AppState: { addEventListener: () => ({ remove() {} }) } },
    "@react-native-async-storage/async-storage": { getItem: async () => String(storedUserId) },
    "utils/apiClient": { subscribeAuthSession: (callback) => { listener = callback; return () => { listener = null; }; } },
    "utils/exploreWidgetSync": { ExploreWidgetSync },
    "constants/exploreWidgets": { getWidgetTitle: () => "Standings", widgetAllowsDuplicates: () => false },
    "types/widgets": { EXPLORE_WIDGET_LEAGUES: ["nba"] },
    "utils/collegePollWidget": { normalizeCollegePollType: (_league, poll) => poll },
    "utils/exploreWidgetStorage": {
      createExploreWidgetId: () => "new",
      withSequentialOrder: (widgets) => widgets.map((widget, order) => ({ ...widget, order })),
      loadExploreWidgetSettingsCache: async (id) => { calls.push(["load", id]); return caches.get(id) ?? null; },
      saveExploreWidgetSettingsCache: async (id, cache) => { caches.set(id, structuredClone(cache)); },
    },
    "services/exploreWidgetsApi": {
      getExploreWidgetSettings: async (id) => {
        calls.push(["get", id]);
        assert.equal(id, storedUserId, "requests must use the current account");
        return id === 1 ? accountSettings : null;
      },
      saveExploreWidgetSettings: async (id, widgets, revision) => {
        calls.push(["put", id]);
        assert.equal(id, storedUserId);
        return { ...accountSettings, widgets, revision: revision + 1 };
      },
    },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync("hooks/ExploreHooks/useExploreWidgetConfiguration.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, require: (name) => {
    assert.ok(name in modules, `Unexpected import: ${name}`);
    return modules[name];
  }, AbortController, console });
  function render() {
    index = 0;
    result = exports.useExploreWidgetConfiguration(contextUserId);
    while (effects.length) effects.shift()();
  }
  render();
  return {
    get state() { return result; }, calls, caches,
    publishAccount(id) { storedUserId = id; listener({ accessToken: `account-${id}` }); },
    updateFavoritesAccount(id) { contextUserId = id; render(); },
    stop() { unmounted = true; slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

test("switching from widgets to an account with no widgets never imports the previous board", async () => {
  const h = setup();
  try {
    await flush(); await flush();
    assert.equal(h.state.widgets[0].id, widget.id);
    h.publishAccount(2);
    await flush();
    // FavoriteTeamsContext is still publishing account 1 during this window.
    assert.equal(h.state.widgets.length, 0);
    assert.equal(h.state.ready, false);
    h.updateFavoritesAccount(2);
    await flush(); await flush();
    assert.equal(h.state.ready, true);
    assert.equal(h.state.widgets.length, 0);
    assert.equal(h.caches.get("2").widgets.length, 0);
    assert.equal(h.calls.filter(([operation]) => operation === "put").length, 0);
    assert.equal(h.caches.get("1").widgets[0].id, widget.id);
  } finally { h.stop(); }
});

test("token rotation for the same account reloads its own settings", async () => {
  const h = setup();
  try {
    await flush(); await flush();
    h.publishAccount(1);
    await flush(); await flush();
    assert.equal(h.state.ready, true);
    assert.equal(h.state.widgets[0].id, widget.id);
    assert.equal(h.calls.filter(([operation]) => operation === "put").length, 0);
  } finally { h.stop(); }
});
