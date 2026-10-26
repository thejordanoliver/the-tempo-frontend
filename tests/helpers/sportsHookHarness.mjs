import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import dayjs from "dayjs";
import ts from "typescript";
export const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
export function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
export function sportsHookHarness({ globals = {} } = {}) {
  const slots = [],
    effects = [];
  let index = 0,
    queued = false,
    stopped = false,
    hook,
    args,
    state,
    subscription;
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
  const react = {
    useState(initial) {
      const i = index++;
      slots[i] ??= {
        value: typeof initial === "function" ? initial() : initial,
      };
      return [
        slots[i].value,
        (next) => {
          const value =
            typeof next === "function" ? next(slots[i].value) : next;
          if (!Object.is(value, slots[i].value)) {
            slots[i].value = value;
            schedule();
          }
        },
      ];
    },
    useRef(initial) {
      const i = index++;
      return (slots[i] ??= { current: initial });
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
  };
  const modules = {
    react,
    dayjs,
    "dayjs/plugin/timezone": () => {},
    "dayjs/plugin/utc": () => {},
    "hooks/useLiveSportsSubscription": {
      useLiveSportsSubscription(options) {
        subscription = options;
      },
    },
    "@/utils/games/games": { isGameLive: () => false },
  };
  function load(path) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(source, {
      __DEV__: false,
      exports,
      console: { error() {}, warn() {} },
      AbortController,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      ...globals,
      require(name) {
        if (name === "hooks/Sports/useSportsRequestScope")
          return load("hooks/Sports/useSportsRequestScope.ts");
        if (name.startsWith("assets/")) return name;
        if (!(name in modules)) {
          const candidate = name.startsWith("./")
            ? `hooks/${name.slice(2)}.ts`
            : `${name}.ts`;
          if (fs.existsSync(candidate)) modules[name] = load(candidate);
        }
        assert.ok(name in modules, `Unexpected import: ${name}`);
        return modules[name];
      },
    });
    return exports;
  }
  modules["utils/games/gameStatus"] = load("utils/games/gameStatus.ts");
  function render() {
    index = 0;
    state = hook(...args);
    while (effects.length) effects.shift()();
  }
  return {
    react,
    modules,
    load,
    start(fn, initialArgs = []) {
      hook = fn;
      args = initialArgs;
      render();
    },
    update(nextArgs = args) {
      args = nextArgs;
      render();
    },
    get state() {
      return state;
    },
    get subscription() {
      return subscription;
    },
    stop() {
      stopped = true;
      slots.forEach((slot) => slot?.cleanup?.());
    },
  };
}
