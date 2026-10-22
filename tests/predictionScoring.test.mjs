import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function harness() {
  const slots = [], effects = [];
  const timers = new Set(); let appState = "active", listener;
  let index = 0, queued = false, stopped = false, hook, args, state;
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const schedule = () => {
    if (queued || stopped) return;
    queued = true;
    queueMicrotask(() => { queued = false; if (!stopped) render(); });
  };
  const memo = (factory, deps) => {
    const i = index++;
    if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { value: factory(), deps };
    return slots[i].value;
  };
  const react = {
    useState(initial) {
      const i = index++;
      slots[i] ??= { value: typeof initial === "function" ? initial() : initial };
      return [slots[i].value, (next) => {
        const value = typeof next === "function" ? next(slots[i].value) : next;
        if (!Object.is(value, slots[i].value)) { slots[i].value = value; schedule(); }
      }];
    },
    useRef(initial) { const i = index++; return slots[i] ??= { current: initial }; },
    useMemo: memo,
    useCallback: (callback, deps) => memo(() => callback, deps),
    useEffect(callback, deps) {
      const i = index++;
      if (slots[i] && same(slots[i].deps, deps)) return;
      const previous = slots[i];
      slots[i] = { deps, cleanup: previous?.cleanup };
      effects.push(() => { previous?.cleanup?.(); slots[i].cleanup = callback(); });
    },
  };
  const modules = {
    react,
    "react-native": { AppState: { get currentState() { return appState; }, addEventListener(_, fn) { listener = fn; return { remove() { listener = undefined; } }; } } },
  };
  function load(path) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, {
      exports, setInterval: (fn) => { timers.add(fn); return fn; }, clearInterval: (fn) => timers.delete(fn), console: { error() {}, warn() {} }, AbortController, setTimeout, clearTimeout,
      require(name) {
        if (name.startsWith("assets/")) return name;
        assert.ok(name in modules, `Unexpected import: ${name}`);
        return modules[name];
      },
    });
    return exports;
  }
  function render() {
    index = 0;
    state = hook(...args);
    while (effects.length) effects.shift()();
  }
  return {
    react, modules, load,
    tick() { timers.forEach(fn => fn()); },
    app(next) { appState = next; listener?.(next); },
    start(fn, initialArgs = []) { hook = fn; args = initialArgs; render(); },
    update(nextArgs = args) { args = nextArgs; render(); },
    get state() { return state; },
    stop() { stopped = true; slots.forEach((slot) => slot?.cleanup?.()); },
  };
}

function scoringHarness() {
  const h = harness(), requests = [];
  h.modules["services/fanPredictionsApi"] = { fetchPredictionScoring(gameId, context, signal) {
    const r = deferred(); requests.push({ gameId, context, signal, ...r }); return r.promise;
  } };
  const context = { sport: "basketball", league: "mcbb", state: "pre" };
  h.start(h.load("hooks/usePredictionScoring.ts").usePredictionScoring, [99, context]);
  return Object.assign(h, { requests, context });
}
const regular = { pointsValue: 1, bonusReason: null };
const ranked = { pointsValue: 2, bonusReason: "ranked" };

test("visible predictions refresh both up and down without clearing their current points", async () => {
  const h = scoringHarness();
  try {
    h.requests[0].resolve(regular); await flush();
    assert.equal(h.state.scoring.pointsValue, 1);
    h.tick(); h.tick();
    assert.equal(h.requests.length, 2, "one in-flight request per game");
    assert.equal(h.state.scoring.pointsValue, 1);
    h.requests[1].resolve(ranked); await flush();
    assert.equal(h.state.scoring.pointsValue, 2);
    h.tick(); h.requests[2].resolve(regular); await flush();
    assert.equal(h.state.scoring.pointsValue, 1);
  } finally { h.stop(); }
});
test("skips background polling and refreshes on foreground return", async () => {
  const h = scoringHarness();
  try {
    h.requests[0].resolve(regular); await flush();
    h.app("background"); h.tick();
    assert.equal(h.requests.length, 1);
    h.app("active");
    assert.equal(h.requests.length, 2);
    h.requests[1].resolve(ranked); await flush();
    assert.equal(h.state.scoring.pointsValue, 2);
  } finally { h.stop(); }
});
test("keeps known points after a failed refresh and retries without hiding them", async () => {
  const h = scoringHarness();
  try {
    h.requests[0].resolve(ranked); await flush();
    h.tick(); h.requests[1].reject(new Error("offline")); await flush();
    assert.equal(h.state.scoring.pointsValue, 2);
    assert.equal(h.state.scoringError, true);
    h.state.retryScoring(); await flush();
    assert.equal(h.state.scoring.pointsValue, 2);
    h.requests[2].resolve(regular); await flush();
    assert.equal(h.state.scoringError, false);
  } finally { h.stop(); }
});
test("stops refreshing at tipoff and ignores the old game's pending response", async () => {
  const h = scoringHarness();
  try {
    h.requests[0].resolve(ranked); await flush();
    h.update([99, { ...h.context, state: "in" }]);
    h.tick(); assert.equal(h.requests.length, 1);
    assert.equal(h.state.scoring.pointsValue, 2);
    h.update([100, h.context]);
    assert.equal(h.state.scoring, null);
    h.update([101, h.context]);
    assert.equal(h.requests[1].signal.aborted, true);
    h.requests[1].resolve(regular); await flush();
    assert.equal(h.state.scoring, null);
    h.requests[2].resolve(ranked); await flush();
    assert.equal(h.state.scoring.pointsValue, 2);
  } finally { h.stop(); }
});
