import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

// Exercise the real loading hooks without loading React Native UI modules.
function setup(initialIds) {
  const slots = [];
  let index = 0;
  let changed = false;
  let ids = initialIds;
  let state;
  let context;
  const react = {
    createContext(value) {
      context = { current: value };
      return context;
    },
    useContext(value) {
      return value.current;
    },
    useState(initial) {
      const position = index++;
      if (!(position in slots))
        slots[position] = typeof initial === "function" ? initial() : initial;
      return [
        slots[position],
        (next) => {
          const value =
            typeof next === "function" ? next(slots[position]) : next;
          if (!Object.is(value, slots[position])) {
            slots[position] = value;
            changed = true;
          }
        },
      ];
    },
    useCallback(callback) {
      return callback;
    },
    useMemo(factory) {
      return factory();
    },
    useEffect(callback) {
      callback();
    },
  };
  const exports = {};
  const source = ts.transpileModule(
    fs.readFileSync("hooks/ExploreHooks/useWidgetBoardLoading.tsx", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx: () => null };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  function render() {
    do {
      changed = false;
      index = 0;
      state = exports.useWidgetBoardLoading(ids);
    } while (changed);
  }
  render();
  return {
    get loading() {
      return state.loading;
    },
    updateIds(next) {
      ids = next;
      render();
    },
    report(id, loading) {
      context.current = () => state.onWidgetReady(id);
      exports.useWidgetLoadReady(loading);
      render();
    },
    reportOutsideBoard(loading) {
      context.current = null;
      exports.useWidgetLoadReady(loading);
    },
  };
}

test("all widget types stay hidden until the slowest initial load settles", () => {
  const ids = [
    "games",
    "teams",
    "picks",
    "post",
    "standings",
    "polls",
    "second-standings",
  ];
  const board = setup(ids);
  assert.equal(board.loading, true);
  for (const id of ids.slice().reverse()) {
    board.report(id, true);
    assert.equal(board.loading, true);
  }
  for (const id of ids.slice(1)) {
    board.report(id, false);
    assert.equal(board.loading, true);
  }
  board.report("games", false);
  assert.equal(board.loading, false);
});

test("empty and error states complete loading; retries and new widgets keep a revealed board visible", () => {
  const board = setup(["empty-teams", "failed-standings"]);
  board.report("empty-teams", false);
  assert.equal(board.loading, true);
  board.report("failed-standings", false);
  assert.equal(board.loading, false);
  board.report("failed-standings", true);
  board.updateIds(["empty-teams", "failed-standings", "new-polls"]);
  board.report("new-polls", true);
  assert.equal(board.loading, false);
});

test("removing a pending widget releases the remaining board and latches its visibility", () => {
  const board = setup(["ready", "pending"]);
  board.report("ready", false);
  assert.equal(board.loading, true);
  board.updateIds(["ready"]);
  assert.equal(board.loading, false);
  board.updateIds(["ready", "new"]);
  assert.equal(board.loading, false);
});

test("an empty board needs no data and widgets work outside a loading boundary", () => {
  const board = setup([]);
  assert.equal(board.loading, false);
  board.reportOutsideBoard(true);
  board.reportOutsideBoard(false);
  board.updateIds(["first"]);
  assert.equal(board.loading, true);
});
