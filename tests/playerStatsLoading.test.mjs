import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));


function setup(file, hookName, initialArgs) {
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
    axios: { isAxiosError: (error) => error?.isAxiosError === true, isCancel: () => false },
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
  const hook = load(file)[hookName];
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

const cases = [
  {
    sport: "baseball",
    file: "hooks/BaseballHooks/usePlayerSeasons.ts",
    hook: "useBaseballPlayerSeasons",
    args: (id) => [id, "mlb"],
    loading: "loading",
    error: "error",
  },
  {
    sport: "hockey",
    file: "hooks/HockeyHooks/usePlayerSeasons.ts",
    hook: "usePlayerSeasons",
    args: (id) => [id, "nhl"],
    loading: "seasonsLoading",
    error: "seasonsError",
  },
  {
    sport: "soccer",
    file: "hooks/SoccerHooks/usePlayerSeasons.ts",
    hook: "usePlayerSeasons",
    args: (id) => [id],
    loading: "seasonsLoading",
    error: "seasonsError",
  },
];

for (const config of cases) {
  const setupHook = () => setup(config.file, config.hook, config.args(100));

  test(`${config.sport} waits from the first render and finishes for empty stats`, async () => {
    const h = setupHook();
    try {
      assert.equal(h.state[config.loading], true);
      await flush();
      h.requests[0].resolve({ data: { seasons: [] } });
      await flush();
      assert.equal(h.state[config.loading], false);
      assert.equal(h.state[config.error], null);
    } finally {
      h.stop();
    }
  });

  test(`${config.sport} keeps waiting for a new player when an old request finishes`, async () => {
    const h = setupHook();
    try {
      await flush();
      h.update(config.args(200));
      assert.equal(h.state[config.loading], true);
      await flush();
      h.requests[0].resolve({ data: { seasons: [] } });
      await flush();
      assert.equal(h.state[config.loading], true);
      h.requests[1].resolve({ data: { seasons: [] } });
      await flush();
      assert.equal(h.state[config.loading], false);
    } finally {
      h.stop();
    }
  });

  test(`${config.sport} starts loading immediately after switching from a loaded player`, async () => {
    const h = setupHook();
    try {
      await flush();
      h.requests[0].resolve({ data: { seasons: [] } });
      await flush();
      assert.equal(h.state[config.loading], false);
      h.update(config.args(200));
      assert.equal(h.state[config.loading], true);
    } finally {
      h.stop();
    }
  });

  test(`${config.sport} settles into an error instead of loading forever`, async () => {
    const h = setupHook();
    try {
      await flush();
      h.requests[0].reject(new Error("Stats unavailable"));
      await flush();
      assert.equal(h.state[config.loading], false);
      assert.ok(h.state[config.error]);
    } finally {
      h.stop();
    }
  });
}

test("soccer waits for the current team filter before exposing stats", async () => {
  const h = setup("hooks/SoccerHooks/usePlayerSeasons.ts", "usePlayerSeasons", [100]);
  try {
    await flush();
    h.requests[0].resolve({ data: { seasons: [], filters: { teamId: "1" } } });
    await flush();
    h.update([100, { teamId: "2" }]);
    assert.equal(h.state.seasonsLoading, true);
    assert.equal(h.state.selectedFilters, null);
    await flush();
    h.requests[1].resolve({ data: { seasons: [], filters: { teamId: "2" } } });
    await flush();
    assert.equal(h.state.seasonsLoading, false);
    assert.equal(h.state.selectedFilters.teamId, "2");
  } finally {
    h.stop();
  }
});
