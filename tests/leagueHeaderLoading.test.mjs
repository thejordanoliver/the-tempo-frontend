import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const variants = {
  "basketball:NBALeagueScreen": ["combinedGamesLoading"],
  "basketball:WNBALeagueScreen": ["loadingWNBAGames"],
  "basketball:GLeagueScreen": ["loadingGLeagueGames"],
  "basketball:MCBBLeagueScreen": ["mcbbGamesLoading"],
  "basketball:WCBBLeagueScreen": ["wcbbGamesLoading"],
  "football:NFLLeagueScreen": ["calendarLoading", "gamesLoading"],
  "football:CFBLeagueScreen": ["calendarLoading", "gamesLoading"],
  "football:UFLLeagueScreen": ["gamesLoading"],
  "baseball:MLBLeagueScreen": ["loadingGames"],
  "baseball:CBLeagueScreen": ["loadingGames"],
  "baseball:SBLeagueScreen": ["loadingGames"],
  "hockey:NHLLeagueScreen": ["loadingGames"],
  "soccer:SoccerLeagueScreen": ["loadingGames"],
  "mma:UFCLeagueScreen": ["calendarLoading", "loading"],
  "racing:RacingLeagueScreen": ["calendarLoading", "loadingGames"],
  "tennis:TennisLeagueScreen": ["loading"],
  "volleyball:MCVBLeagueScreen": ["loadingGames"],
  "volleyball:WCVBLeagueScreen": ["loadingGames"],
};

const calls = (node, name) => {
  const found = [];
  function visit(current) {
    if (
      ts.isCallExpression(current) &&
      ts.isIdentifier(current.expression) &&
      (typeof name === "string"
        ? current.expression.text === name
        : name.test(current.expression.text))
    )
      found.push(current);
    ts.forEachChild(current, visit);
  }
  visit(node);
  return found;
};

for (const [label, flags] of Object.entries(variants)) {
  test(`${label} waits for its primary data and displays only the entry indicator`, () => {
    const [sport, name] = label.split(":");
    const file = `app/league/${sport}.tsx`;
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const component = source.statements.find(
      (node) => ts.isFunctionDeclaration(node) && node.name?.text === name,
    );
    assert.ok(component?.body, "league variant exists");
    const [entryCall, ...otherEntryCalls] = calls(
      component.body,
      "useLeagueEntryLoading",
    );
    assert.ok(entryCall, "entry loading uses the shared lifecycle hook");
    assert.equal(otherEntryCalls.length, 0);
    const effects = calls(component.body, "useLayoutEffect");
    assert.equal(effects.length, 1);
    const guardIndex = component.body.statements.findIndex(
      (node) =>
        ts.isIfStatement(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "entryLoading",
    );
    assert.ok(guardIndex >= 0, "pending entry has an early loading render");
    for (const statement of component.body.statements.slice(guardIndex + 1)) {
      assert.equal(
        calls(statement, /^use[A-Z]/).length,
        0,
        "all hooks run before the entry render guard",
      );
    }

    let options;
    let backCount = 0;
    const back = () => backCount++;
    const context = vm.createContext({
      exports: {},
      entryLoading: true,
      isDark: false,
      league: sport,
      leagueLabel: sport,
      roster: { loading: false },
      shows: { loading: false },
      CustomHeader: "Header",
      GameHeaderPlaceholder: "Placeholder",
      LeagueLoadingScreen: "LoadingScreen",
      navigation: { setOptions: (next) => (options = next), goBack: back },
      router: { back },
      favoriteHeaderProps: {},
      isConferenceModalOpen: false,
      setIsConferenceModalOpen() {},
      selectedConferenceName: "All",
      conferenceModalRef: { current: null },
      useLeagueEntryLoading: (loading) => loading,
      require: () => ({ jsx: (type, props) => ({ type, props }) }),
    });
    for (const flag of new Set(Object.values(variants).flat())) {
      if (!flag.includes(".")) context[flag] = false;
    }
    const compiled = ts.transpileModule(
      `const primaryPending = () => ${entryCall.getText(source)};
       const configureHeader = ${effects[0].arguments[0].getText(source)};
       const renderPending = () => { ${component.body.statements[guardIndex].getText(source)} return null; };`,
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
        },
      },
    ).outputText;
    vm.runInContext(compiled, context);
    assert.equal(vm.runInContext("primaryPending()", context), false);
    for (const flag of flags) {
      vm.runInContext(`${flag} = true`, context);
      assert.equal(vm.runInContext("primaryPending()", context), true, flag);
      vm.runInContext(`${flag} = false`, context);
    }
    vm.runInContext("configureHeader()", context);
    assert.equal(options.header().type, "Placeholder");
    for (const isDark of [false, true]) {
      context.isDark = isDark;
      const loading = vm.runInContext("renderPending()", context);
      assert.equal(loading.type, "LoadingScreen");
      assert.equal(loading.props.isDark, isDark);
    }
    context.entryLoading = false;
    vm.runInContext("configureHeader()", context);
    const loaded = options.header();
    assert.equal(loaded.type, "Header");
    loaded.props.onBack();
    assert.equal(backCount, 1);
    assert.equal(vm.runInContext("renderPending()", context), null);
  });
}

test("the league entry view contains only a centered indicator in either theme", () => {
  const exports = {};
  const source = ts.transpileModule(
    fs.readFileSync("components/League/LeagueLoadingScreen.tsx", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const emptyContainer = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  };
  const modules = {
    "components/CustomActivityIndicator": {
      __esModule: true,
      default: "Indicator",
    },
    "constants/styles": {
      Colors: { dark: { background: "#111" }, light: { background: "#fff" } },
      globalStyles: () => ({ emptyContainer }),
    },
    "react-native": { View: "View" },
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }) },
  };
  vm.runInNewContext(source, { exports, require: (name) => modules[name] });
  for (const isDark of [false, true]) {
    const view = exports.LeagueLoadingScreen({ isDark });
    assert.equal(view.type, "View");
    assert.equal(view.props.children.type, "Indicator");
    assert.equal(view.props.style[0], emptyContainer);
    assert.equal(view.props.style[1].backgroundColor, isDark ? "#111" : "#fff");
  }
});
