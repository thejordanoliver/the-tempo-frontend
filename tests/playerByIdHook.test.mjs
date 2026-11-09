import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup(initialArgs = [100, "cfb"]) {
  const slots = [];
  const effects = [];
  const requests = [];
  let index = 0;
  let queued = false;
  let stopped = false;
  let args = initialArgs;
  let result;
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
    axios: {
      isAxiosError: (error) => error?.isAxiosError === true,
      isCancel: () => false,
    },
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
      console: { error() {} },
    });
    return exports;
  }
  const hook = load("hooks/LeagueHooks/usePlayerById.ts").usePlayerById;
  function render() {
    index = 0;
    result = hook(...args);
    while (effects.length) effects.shift()();
  }
  render();
  return {
    requests,
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

test("loads profile identity without requesting stats", async () => {
  const h = setup();
  assert.equal(h.requests[0].url, "api/roster/cfb/player/100");
  h.requests[0].resolve({
    data: { player: { id: 200, cfb_player_id: 100 } },
  });
  await flush();
  assert.equal(h.state.player.id, 200);
  assert.equal(h.state.resolvedPlayerId, 200);
  assert.equal(h.state.resolvedLeague, "nfl");
  assert.equal(h.requests.length, 1);
  h.stop();
});
test("ignores late profile results after switching players", async () => {
  const h = setup();
  h.update([300, "mcbb"]);
  assert.equal(h.requests[0].signal.aborted, true);
  h.requests[1].resolve({
    data: { player: { id: 400, mcbb_player_id: 300 } },
  });
  await flush();
  h.requests[0].resolve({
    data: { player: { id: 200, cfb_player_id: 100 } },
  });
  await flush();
  assert.equal(h.state.resolvedLeague, "nba");
  assert.equal(h.state.player.id, 400);
  h.stop();
});
test("preserves noncollege routes and resolves identity from player.id", async () => {
  const h = setup([1, "nba"]);
  assert.equal(h.requests[0].url, "api/roster/nba/player/1");
  h.requests[0].resolve({ data: { player: { id: 1 } } });
  await flush();
  assert.equal(h.state.resolvedLeague, "nba");
  assert.equal(h.state.resolvedPlayerId, 1);
  h.stop();
});

for (const [college, pro, column] of [
  ["cfb", "nfl", "cfb_player_id"],
  ["mcbb", "nba", "mcbb_player_id"],
  ["wcbb", "wnba", "wcbb_player_id"],
]) {
  test(`resolves ${college} profiles from existing player fields without envelope metadata`, async () => {
    for (const linked of [true, false]) {
      const h = setup([100, college]);
      h.requests[0].resolve({
        data: {
          player: {
            id: linked ? 200 : 100,
            ...(linked ? { [column]: 100 } : {}),
          },
        },
      });
      await flush();
      assert.equal(h.state.resolvedLeague, linked ? pro : college);
      assert.equal(h.state.resolvedPlayerId, linked ? 200 : 100);
      h.stop();
    }
  });
}
