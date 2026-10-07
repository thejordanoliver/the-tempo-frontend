import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

// Run the real hook with an effect/state harness, without native UI modules.
function setup() {
  const slots = [], effects = [], writes = [], reads = [];
  let index = 0, queued = false, stopped = false, userId = 1, token = "account-1", listener, result;
  let read = async () => ({ userId, gameCardLayout: userId === 1 ? "grid" : "stacked" });
  let write = async layout => ({ userId, gameCardLayout: layout });
  const same = (a, b) => a && b && a.length === b.length && a.every((item, i) => Object.is(item, b[i]));
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
  const modules = {
    react: {
      useState(initial) {
        const position = index++;
        slots[position] ??= { value: initial };
        return [slots[position].value, next => {
          if (Object.is(next, slots[position].value)) return;
          slots[position].value = next; schedule();
        }];
      },
      useRef(initial) { const position = index++; slots[position] ??= { current: initial }; return slots[position]; },
      useCallback: (callback, deps) => memo(() => callback, deps),
      useEffect(callback, deps) {
        const position = index++;
        if (slots[position] && same(slots[position].deps, deps)) return;
        slots[position] = { deps };
        effects.push(() => { slots[position].cleanup = callback(); });
      },
    },
    "@react-native-async-storage/async-storage": { getItem: async () => String(userId) },
    "utils/apiClient": {
      getAccessToken: async () => token,
      subscribeAuthSession: callback => { listener = callback; return () => { listener = null; }; },
    },
    "services/gameCardLayoutApi": {
      getGameCardLayout: signal => { reads.push({ userId, signal }); return read(); },
      saveGameCardLayout: layout => { writes.push({ userId, layout }); return write(layout); },
    },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync("hooks/useGameCardLayoutPreference.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, require: name => {
    assert.ok(name in modules, `Unexpected import: ${name}`);
    return modules[name];
  }, AbortController });
  function render() {
    index = 0;
    result = exports.useGameCardLayoutPreference();
    while (effects.length) effects.shift()();
  }
  render();
  return {
    get state() { return result; }, reads, writes,
    setRead(fn) { read = fn; }, setWrite(fn) { write = fn; },
    publishAccount(id) { userId = id; token = id ? `account-${id}` : null; listener({ accessToken: token }); },
    stop() { stopped = true; slots.forEach(slot => slot?.cleanup?.()); },
  };
}

test("loads the saved account layout and persists a selection", async () => {
  const h = setup();
  await flush();
  assert.equal(h.state.gameCardLayout, "grid");
  assert.equal(h.state.gameCardLayoutLoading, false);
  await h.state.setGameCardLayout("stacked");
  await flush();
  assert.deepEqual(h.writes, [{ userId: 1, layout: "stacked" }]);
  assert.equal(h.state.gameCardLayout, "stacked");
  h.stop();
});

test("rolls back failed saves and exposes a retry message", async () => {
  const h = setup();
  await flush();
  h.setWrite(async () => { throw new Error("offline"); });
  await h.state.setGameCardLayout("list");
  await flush();
  assert.equal(h.state.gameCardLayout, "grid");
  assert.match(h.state.gameCardLayoutError, /Couldn't save/);
  assert.equal(h.state.gameCardLayoutSaving, false);
  h.stop();
});

test("blocks overlapping saves and retains a save through token refresh", async () => {
  const h = setup(), save = deferred();
  await flush();
  h.setWrite(() => save.promise);
  const pending = h.state.setGameCardLayout("stacked");
  await h.state.setGameCardLayout("list");
  h.publishAccount(1);
  await flush();
  assert.equal(h.writes.length, 1);
  assert.equal(h.reads.length, 1);
  save.resolve({ userId: 1, gameCardLayout: "stacked" });
  await pending;
  await flush();
  assert.equal(h.state.gameCardLayout, "stacked");
  assert.equal(h.state.gameCardLayoutSaving, false);
  h.stop();
});

test("ignores the previous account's in-flight save after switching accounts", async () => {
  const h = setup(), save = deferred();
  await flush();
  h.setWrite(() => save.promise);
  const pending = h.state.setGameCardLayout("list");
  h.publishAccount(2);
  await flush();
  assert.equal(h.state.gameCardLayout, "stacked");
  save.resolve({ userId: 1, gameCardLayout: "list" });
  await pending;
  await flush();
  assert.equal(h.state.gameCardLayout, "stacked");
  h.stop();
});

test("clears the account layout on logout and rejects stale load results", async () => {
  const h = setup(), load = deferred();
  await flush();
  h.setRead(() => load.promise);
  h.publishAccount(2);
  await flush();
  h.publishAccount(null);
  await flush();
  load.resolve({ userId: 2, gameCardLayout: "stacked" });
  await flush();
  assert.equal(h.state.gameCardLayout, "list");
  assert.equal(h.state.gameCardLayoutLoading, false);
  await h.state.setGameCardLayout("grid");
  assert.equal(h.writes.length, 0);
  h.stop();
});
