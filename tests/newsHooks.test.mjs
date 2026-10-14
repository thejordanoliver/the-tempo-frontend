import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const response = (ids, hasMore = true) => ({
  data: { success: true, articles: ids.map((id) => ({ id })), hasMore },
});

function setup(hookName = "useLeaguesNews", initialArgs = ["nba", 2]) {
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
    axios: { isAxiosError: (error) => error?.isAxiosError === true },
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
    });
    return exports;
  }
  modules["./usePaginatedNews"] = load("hooks/NewsHooks/usePaginatedNews.ts");
  const hook = load(`hooks/NewsHooks/${hookName}.ts`)[hookName];
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

test("league news loads, paginates once, and refreshes without replacing the list with a skeleton", async () => {
  const h = setup();
  assert.equal(h.state.loading, true);
  assert.equal(h.requests[0].url, "/api/news/league/nba");
  h.requests[0].resolve(response([1, 2]));
  await flush();
  assert.equal(h.state.loading, false);

  const page = h.state.refresh("loadMore");
  await h.state.refresh("loadMore");
  assert.equal(h.requests.length, 2);
  assert.equal(h.requests[1].params.offset, 2);
  h.requests[1].resolve(response([3], false));
  await page;
  await flush();
  assert.deepEqual(
    Array.from(h.state.articles, (item) => item.id),
    [1, 2, 3],
  );
  await h.state.refresh("loadMore");
  assert.equal(h.requests.length, 2);

  const refresh = h.state.refresh();
  await flush();
  assert.equal(h.state.loading, false);
  assert.equal(h.state.refreshing, true);
  assert.equal(h.state.articles.length, 3);
  h.requests[2].resolve(response([4], false));
  await refresh;
  await flush();
  assert.deepEqual(
    Array.from(h.state.articles, (item) => item.id),
    [4],
  );
  h.stop();
});

test("team changes enter loading immediately and ignore the previous team's response", async () => {
  const h = setup("useTeamNews", ["nfl", 1, 2]);
  h.update(["nfl", 2, 2]);
  assert.equal(h.state.loading, true);
  assert.equal(h.requests[0].signal.aborted, true);
  assert.equal(h.requests[1].url, "/api/news/team/nfl/2");
  h.requests[1].resolve(response([2]));
  await flush();
  h.requests[0].resolve(response([1]));
  await flush();
  assert.deepEqual(
    Array.from(h.state.articles, (item) => item.id),
    [2],
  );
  h.stop();
});

test("disabling news or passing an invalid team avoids requests and cancels pending work", async () => {
  const h = setup("useTeamNews", ["nfl", 1, 2]);
  h.update(["nfl", 1, 2, { enabled: false }]);
  assert.equal(h.requests[0].signal.aborted, true);
  assert.equal(h.state.loading, false);
  await h.state.refresh();
  assert.equal(h.requests.length, 1);
  h.update(["nfl", 0, 2]);
  assert.equal(h.state.error, "A valid team is required.");
  assert.equal(h.state.loading, false);
  assert.equal(h.requests.length, 1);
  h.stop();
});

test("missing news is empty and retrying a network failure supersedes the old request", async () => {
  const h = setup();
  h.requests[0].reject({ isAxiosError: true, response: { status: 404 } });
  await flush();
  assert.equal(h.state.error, null);
  assert.equal(h.state.hasMore, false);
  assert.equal(h.state.loading, false);

  const first = h.state.refresh();
  const second = h.state.refresh();
  assert.equal(h.requests[1].signal.aborted, true);
  h.requests[1].reject(new Error("stale failure"));
  h.requests[2].resolve(response([9]));
  await Promise.all([first, second]);
  await flush();
  assert.equal(h.state.error, null);
  assert.deepEqual(
    Array.from(h.state.articles, (item) => item.id),
    [9],
  );
  h.stop();
});

test("unmounting cancels the active request", () => {
  const h = setup();
  h.stop();
  assert.equal(h.requests[0].signal.aborted, true);
});
