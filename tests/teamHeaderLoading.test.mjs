import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { resolveTeamRoute } from "../utils/navigation/teamNavigation.ts";

const element = (type, props, key) => ({ type, props, key });

function loadModule(file, modules) {
  const exports = {};
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === "react/jsx-runtime") {
        return { jsx: element, jsxs: element };
      }
      assert.ok(name in modules, `Unexpected module import: ${name}`);
      const module = modules[name];
      return "default" in module ? { __esModule: true, ...module } : module;
    },
  });
  return exports;
}

test("the team hook keeps its header hidden while loading and restores actions afterward", () => {
  const CustomHeader = () => {};
  const GameHeaderPlaceholder = () => {};
  const actions = [];
  let options;
  const back = () => actions.push(["back"]);
  const { useTeamDetailScreen: renderScreen } = loadModule(
    "hooks/TeamHooks/useTeamDetailScreen.tsx",
    {
      "components/CustomHeader": { CustomHeader },
      "components/CustomHeader/GameHeaderPlaceholder": {
        GameHeaderPlaceholder,
      },
      "contexts/FavoriteTeamsContext": {
        useFavoriteTeamsContext: () => ({
          isFavorite: () => true,
          toggleFavorite: (...args) => actions.push(["favorite", ...args]),
        }),
      },
      "contexts/NotificationContext": {
        useNotifications: () => ({
          isNotified: () => true,
          toggleNotifications: (...args) => actions.push(["notify", ...args]),
        }),
      },
      "contexts/PreferencesContext": {
        usePreferences: () => ({ resolvedColorScheme: "dark" }),
      },
      "expo-router": {
        useNavigation: () => ({ setOptions: (next) => (options = next) }),
      },
      "hooks/useScopedRouter": { useScopedRouter: () => ({ back }) },
      "hooks/LeagueHooks/useLeagueTabs": {
        useTeamTabs: () => ({
          tabs: ["schedule", "news"],
          selectedTab: "schedule",
          hasVisitedTab: () => false,
        }),
      },
      "hooks/usePagerTabScrollProgress": {
        usePagerTabScrollProgress: () => ({}),
      },
      "hooks/useTeams": { default: () => ({ loading: false }) },
      react: {
        useState: (value) => [value, () => {}],
        useCallback: (callback) => callback,
        useEffect: () => {},
        useLayoutEffect: (callback) => callback(),
      },
    },
  );
  const config = {
    tabLeague: "nba",
    header: {
      league: "nba",
      teamId: 1,
      notificationTeamId: 2,
      teamName: "Team",
      teamColor: "#123456",
      logo: "team-logo",
      favorite: { lookupId: 1, toggleId: 3 },
      infoEnabled: true,
    },
  };

  for (const loading of [true, false, true]) {
    const screen = renderScreen({ ...config, loading });
    assert.equal(screen.loading, loading);
    const header = options.header();
    assert.equal(header.type, loading ? GameHeaderPlaceholder : CustomHeader);
    if (loading) {
      assert.equal(header.props.children, undefined);
      assert.equal(header.props.onBack, undefined);
      continue;
    }
    assert.equal(header.props.logo, "team-logo");
    assert.equal(header.props.teamColor, "#123456");
    assert.equal(header.props.isFavorite, true);
    assert.equal(header.props.isNotified, true);
    header.props.onBack();
    header.props.onToggleFavorite();
    header.props.onToggleNotifications();
    assert.deepEqual(actions, [
      ["back"],
      ["favorite", "nba", 3],
      ["notify", "nba", 2],
    ]);
  }
});

const descendants = (node) => {
  if (Array.isArray(node)) return node.flatMap(descendants);
  if (!node || typeof node !== "object") return [];
  return [node, ...descendants(node.props?.children)];
};

test("the shared team screen shows only its indicator while loading", () => {
  const platform = { OS: "ios" };
  const { default: TeamDetailScreen } = loadModule(
    "components/Team/TeamDetailScreen.tsx",
    {
      "@/components/Team/TeamInfoModal": { default: "TeamInfoModal" },
      "components/CustomActivityIndicator": { default: "Loading" },
      "components/TabBars/MainTabScrollBar": { default: "Tabs" },
      "components/Team/TeamPager": { default: "Pager" },
      "constants/styles": {
        Colors: { dark: { background: "#111" }, light: { background: "#fff" } },
        globalStyles: () => ({}),
      },
      react: {
        Children: {
          forEach: (children, callback) => children.forEach(callback),
        },
        isValidElement: (node) => Boolean(node?.type),
        useRef: () => ({ current: null }),
      },
      "react-native": { Platform: platform, Text: "Text", View: "View" },
      "styles/TeamStyles/TeamDetailsStyles": {
        TeamDetailStyles: { container: {}, contentArea: {}, loadContainer: {} },
      },
    },
  );
  const children = [element("Schedule", {}, "schedule")];
  const screen = {
    loading: true,
    isDark: false,
    tabs: ["schedule"],
    selectedTab: "schedule",
    hasVisitedTab: () => true,
    teamInfo: { enabled: true },
  };
  const render = (ready = true) =>
    descendants(
      TeamDetailScreen({
        ready,
        screen,
        children,
        footer: element("Footer", {}),
      }),
    );

  for (const isDark of [false, true]) {
    screen.isDark = isDark;
    const loading = render();
    assert.deepEqual(
      loading.map((node) => node.type),
      ["View", "Loading"],
    );
  }

  const unavailable = render(false);
  assert.ok(
    unavailable.some((node) => node.props?.children === "Team unavailable"),
  );
  assert.ok(!unavailable.some((node) => node.type === "Loading"));

  screen.loading = false;
  for (const OS of ["ios", "web"]) {
    platform.OS = OS;
    const loaded = render();
    for (const type of ["Tabs", "Schedule", "TeamInfoModal", "Footer"]) {
      assert.ok(
        loaded.some((node) => node.type === type),
        `${OS}: ${type}`,
      );
    }
    assert.ok(!loaded.some((node) => node.type === "Loading"));
  }
});

test("unsupported team routes restore a visible error header and back navigation", () => {
  let params = { teamId: "12", sport: "unsupported" };
  let options;
  let backCount = 0;
  const file = "components/Navigation/TeamRouteScreen.tsx";
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const modules = {
    "components/CustomHeader": { CustomHeader: "Header" },
    "constants/styles": { globalStyles: () => ({}) },
    "contexts/PreferencesContext": {
      usePreferences: () => ({ resolvedColorScheme: "light" }),
    },
    "expo-router": {
      useLocalSearchParams: () => params,
      useNavigation: () => ({
        setOptions: (next) => (options = next),
        goBack: () => backCount++,
      }),
    },
    react: { useLayoutEffect: (callback) => callback() },
    "react-native": { Text: "Text", View: "View" },
    "utils/navigation/teamNavigation": { resolveTeamRoute },
  };
  for (const node of source.statements) {
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier.text.startsWith("components/Sports/")
    ) {
      modules[node.moduleSpecifier.text] = {
        default: node.moduleSpecifier.text,
      };
    }
  }
  const { default: renderRoute } = loadModule(file, modules);
  for (const sport of ["unsupported", "invalid-sport", "mcvb", "wcvb"]) {
    params = { teamId: "12", sport };
    const unavailable = renderRoute();
    const result = descendants(unavailable.type());
    assert.ok(
      result.some((node) => node.props.children === "Team unavailable"),
    );
    const header = options.header();
    assert.equal(header.type, "Header");
    assert.equal(header.props.title, "Team unavailable");
    header.props.onBack();
  }
  assert.equal(backCount, 4);
  for (const [sport, league, component] of [
    [undefined, "nba", "Basketball"],
    ["wnba", "wnba", "Basketball"],
    ["basketball", "mcbb", "Basketball"],
    ["football", "nfl", "Football"],
    ["hockey", "mch", "Hockey"],
    ["soccer", "epl", "Soccer"],
    ["baseball", "sb", "Baseball"],
  ]) {
    params = { teamId: "12", sport, league };
    options = undefined;
    const result = renderRoute();
    assert.equal(
      result.type,
      `components/Sports/${component}/${component}TeamScreen`,
    );
    assert.equal(result.props.teamId, "12");
    assert.equal(result.props.league, league);
    assert.equal(result.key, `${league}:12`);
    assert.equal(options, undefined, "supported team owns its header setup");
  }
});

for (const sport of [
  "Basketball",
  "Football",
  "Hockey",
  "Soccer",
  "Baseball",
]) {
  test(`${sport} team screen uses its primary schedule request to control entry loading`, () => {
    const file = `components/Sports/${sport}/${sport}TeamScreen.tsx`;
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const scheduleDeclarations = [];
    let screenCall;
    function visit(node) {
      if (
        ts.isVariableDeclaration(node) &&
        node.initializer &&
        ts.isCallExpression(node.initializer) &&
        ts.isIdentifier(node.initializer.expression) &&
        /^use(?:Basketball|Football|Baseball|Soccer)?TeamGames$/.test(
          node.initializer.expression.text,
        )
      ) {
        scheduleDeclarations.push(node);
      }
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "useTeamDetailScreen"
      )
        screenCall = node;
      ts.forEachChild(node, visit);
    }
    visit(source);
    assert.equal(
      scheduleDeclarations.length,
      1,
      "request the schedule only once",
    );
    const schedule = scheduleDeclarations[0];
    assert.ok(screenCall, "configure the shared team screen");
    assert.ok(
      schedule.pos < screenCall.pos,
      "schedule loading exists before header configuration",
    );
    const loadingProperty = screenCall.arguments[0].properties.find(
      (property) => property.name?.getText(source) === "loading",
    );
    assert.ok(loadingProperty, "pass schedule loading to the shared screen");
    const compiled = ts.transpileModule(
      `const routeLoading = () => { const ${schedule.getText(source)}; return (${loadingProperty.initializer.getText(source)}); };`,
      {},
    ).outputText;
    for (const [team, loading, expected] of [
      [{ id: 1 }, true, true],
      [{ id: 1 }, false, false],
      [undefined, true, file.includes("HockeyTeamScreen")],
    ]) {
      let requests = 0;
      const context = vm.createContext({
        team,
        teamIdNum: 1,
        league: "nba",
        [schedule.initializer.expression.text]: () => {
          requests++;
          return { loading };
        },
      });
      vm.runInContext(compiled, context);
      assert.equal(vm.runInContext("routeLoading()", context), expected);
      assert.equal(requests, 1);
    }
  });
}
