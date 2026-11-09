import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function createLoadingHarness() {
  let loadedLeague = null;
  let previousDependencies;
  let cleanup;
  let pendingEffect;
  const modules = {
    react: {
      useState: () => [loadedLeague, (value) => (loadedLeague = value)],
      useEffect(effect, dependencies) {
        if (
          previousDependencies &&
          dependencies.every((value, index) =>
            Object.is(value, previousDependencies[index]),
          )
        )
          return;
        previousDependencies = dependencies;
        cleanup?.();
        pendingEffect = effect;
      },
    },
  };
  const exports = {};
  const source = ts.transpileModule(
    fs.readFileSync("hooks/LeagueHooks/useLeagueEntryLoading.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(source, {
    exports,
    require(name) {
      assert.ok(name in modules, `Unexpected loading hook import: ${name}`);
      return modules[name];
    },
  });
  return {
    render(loading, league = "nba") {
      const entryLoading = exports.useLeagueEntryLoading(loading, league);
      if (pendingEffect) {
        cleanup = pendingEffect();
        pendingEffect = undefined;
      }
      return entryLoading;
    },
    flush: () => Promise.resolve(),
    unmount: () => cleanup?.(),
  };
}

test("league entry stays pending until the primary request settles", async () => {
  const screen = createLoadingHarness();
  assert.equal(screen.render(true), true);
  await screen.flush();
  assert.equal(screen.render(true), true);
  assert.equal(screen.render(false), false);
  await screen.flush();
  assert.equal(screen.render(false), false);
});

test("settled empty or failed requests expose the existing loaded error/empty view", async () => {
  for (const result of ["empty", "error"]) {
    const screen = createLoadingHarness();
    assert.equal(screen.render(true, result), true);
    assert.equal(screen.render(false, result), false);
    await screen.flush();
    assert.equal(screen.render(true, result), false);
  }
});

test("later date, conference, or refresh loading keeps the league view mounted", async () => {
  const screen = createLoadingHarness();
  assert.equal(screen.render(true), true);
  assert.equal(screen.render(false), false);
  await screen.flush();
  for (const operation of ["date", "conference", "refresh"]) {
    assert.equal(screen.render(true), false, operation);
    assert.equal(screen.render(false), false, operation);
    await screen.flush();
  }
});

test("a new league identity waits for its own first result", async () => {
  const screen = createLoadingHarness();
  assert.equal(screen.render(false, "nba"), false);
  await screen.flush();
  assert.equal(screen.render(true, "nba"), false);
  assert.equal(screen.render(true, "wnba"), true);
  await screen.flush();
  assert.equal(screen.render(true, "wnba"), true);
  assert.equal(screen.render(false, "wnba"), false);
  await screen.flush();
  assert.equal(screen.render(true, "wnba"), false);
  assert.equal(screen.render(true, "nba"), true);
});

test("a superseded completion cannot mark a pending league as loaded", async () => {
  const screen = createLoadingHarness();
  assert.equal(screen.render(false, "nba"), false);
  assert.equal(screen.render(true, "nba"), true);
  await screen.flush();
  assert.equal(screen.render(true, "nba"), true);
  assert.equal(screen.render(false, "nba"), false);
  screen.unmount();
  await screen.flush();
  assert.equal(screen.render(true, "nba"), true);
});
