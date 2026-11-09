import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const sports = [
  "baseball",
  "basketball",
  "football",
  "hockey",
  "soccer",
  "mma",
  "racing",
];

// Run the actual route header effect without native rendering or network hooks.
function createHeaderHarness(sport) {
  const file = `app/(tabs)/(home)/player/${sport}/[id].tsx`;
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const effects = [];
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "useLayoutEffect"
    ) {
      effects.push(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.equal(effects.length, 1, `${sport}: expected one header effect`);

  const CustomHeader = () => {};
  const GameHeaderPlaceholder = () => {};
  let options;
  let backCount = 0;
  const context = vm.createContext({
    exports: {},
    CustomHeader,
    GameHeaderPlaceholder,
    navigation: {
      setOptions: (next) => (options = next),
      goBack: () => backCount++,
    },
    screenLoading: true,
    loading: true,
    player: undefined,
    teamLogo: "team-logo",
    teamColor: "#123456",
    flag: "fighter-flag",
    color: "#654321",
    league: sport,
    require(name) {
      assert.equal(name, "react/jsx-runtime");
      return { jsx: (type, props) => ({ type, props }) };
    },
  });
  const compiled = ts.transpileModule(
    `const configureHeader = ${effects[0].getText(source)};`,
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInContext(compiled, context);

  return (state = {}, expectedType = "placeholder") => {
    Object.assign(context, state);
    options = undefined;
    vm.runInContext("configureHeader()", context);
    assert.equal(typeof options?.header, "function");
    const header = options.header();
    assert.equal(
      header?.type,
      expectedType === "placeholder" ? GameHeaderPlaceholder : CustomHeader,
      `${sport}: retain header height without visible UI while loading`,
    );
    if (expectedType === "placeholder") {
      assert.equal(header.props.children, undefined);
      assert.equal(header.props.onBack, undefined);
    } else {
      assert.equal(typeof header.props.onBack, "function");
      const previous = backCount;
      header.props.onBack();
      assert.equal(backCount, previous + 1, `${sport}: retain back navigation`);
      assert.equal(header.props.isPlayerScreen, true);
    }
    return header.props;
  };
}

for (const sport of sports) {
  test(`${sport} keeps player headers invisible until the screen finishes loading`, () => {
    const renderHeader = createHeaderHarness(sport);
    const initial = renderHeader();
    assert.equal(initial.title, undefined);
    assert.equal(initial.tabName, undefined);

    // Known player/team metadata must not expose a header before data is ready.
    renderHeader({ player: { id: 1, name: "Player" } });
    const loaded = renderHeader(
      { loading: false, screenLoading: false },
      "loaded",
    );
    assert.equal(loaded.isTeamScreen, true);

    renderHeader({ loading: true, screenLoading: true });
  });
}
