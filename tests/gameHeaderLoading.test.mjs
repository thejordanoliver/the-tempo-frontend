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
  "mma",
  "racing",
  "soccer",
  "tennis",
  "volleyball",
];

// Execute the route's actual header effect in isolation from native modules and
// network hooks so loading can be controlled independently of team metadata.
function createHeaderHarness(sport) {
  const file = `app/(tabs)/(home)/game/${sport}/[game].tsx`;
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
  const back = () => {};
  let options;
  const context = vm.createContext({
    exports: {},
    CustomHeader,
    GameHeaderPlaceholder,
    navigation: { setOptions: (next) => (options = next) },
    goBack: back,
    router: { back },
    isLoading: true,
    loading: true,
    home: undefined,
    away: undefined,
    homeCode: "TBD",
    awayCode: "TBD",
    homeColor: undefined,
    awayColor: undefined,
    homeHeaderLogo: undefined,
    awayHeaderLogo: undefined,
    homeLogo: undefined,
    awayLogo: undefined,
    homeId: 0,
    awayId: 0,
    gameId: 1,
    LEAGUE: sport,
    league: sport,
    neutralSite: false,
    gameNotificationsEnabled: false,
    isFinal: false,
    openGameNotificationSettings() {},
    game: undefined,
    gameName: "",
    match: undefined,
    firstFighter: undefined,
    secondFighter: undefined,
    firstFighterLastName: "TBD",
    secondFighterLastName: "TBD",
    firstFighterFlag: undefined,
    secondFighterFlag: undefined,
    firstFighterColor: undefined,
    secondFighterColor: undefined,
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

  return (state = {}) => {
    Object.assign(context, state);
    options = undefined;
    vm.runInContext("configureHeader()", context);
    assert.equal(typeof options?.header, "function");
    const header = options.header();
    const isPending =
      context.isLoading && (sport !== "volleyball" || context.loading);
    assert.equal(
      header?.type,
      isPending ? GameHeaderPlaceholder : CustomHeader,
      `${sport}: reserve header height without visible content while loading`,
    );
    if (isPending) {
      assert.equal(header.props.children, undefined);
      assert.equal(header.props.onBack, undefined);
    } else {
      assert.equal(
        header.props.onBack,
        back,
        `${sport}: retain back navigation`,
      );
    }
    return header.props;
  };
}

for (const sport of sports) {
  test(`${sport} reserves invisible header space throughout game loading`, () => {
    const renderHeader = createHeaderHarness(sport);
    const initial = renderHeader();
    assert.equal(initial.title, undefined);
    assert.equal(initial.tabName, undefined);

    const home = { id: 1, code: "HOME", primaryColor: "#123456" };
    const away = { id: 2, code: "AWAY", primaryColor: "#654321" };
    const routeMetadata = {
      home,
      away,
      homeCode: home.code,
      awayCode: away.code,
      game: { home, away },
      firstFighter: { lastName: "Home" },
      secondFighter: { lastName: "Away" },
      firstFighterLastName: "Home",
      secondFighterLastName: "Away",
      gameName: "Grand Prix",
      match: { tournamentShortName: "Open" },
    };
    const pending = renderHeader(routeMetadata);
    assert.equal(
      pending.tabName,
      undefined,
      "route metadata stays hidden while loading",
    );
    const loaded = renderHeader({ isLoading: false, loading: false });

    if (sport !== "racing" && sport !== "tennis") {
      assert.equal(loaded.tabName, "Game");
      assert.equal(loaded.homeTeamCode, sport === "mma" ? "Home" : "HOME");
      assert.equal(loaded.awayTeamCode, sport === "mma" ? "Away" : "AWAY");
    } else {
      assert.equal(loaded.tabName, sport === "racing" ? "Grand Prix" : "Open");
    }

    const refreshing = renderHeader({ isLoading: true, loading: true });
    assert.equal(refreshing.tabName, undefined);
  });
}

test("volleyball restores navigation when a match request fails", () => {
  const renderHeader = createHeaderHarness("volleyball");
  const header = renderHeader({ isLoading: true, loading: false });
  assert.ok(header.title || header.tabName);
});

function loadComponent(file, modules) {
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
        return { jsx: (type, props) => ({ type, props }) };
      }
      assert.ok(name in modules, `Unexpected component import: ${name}`);
      return modules[name];
    },
  });
  return exports;
}

test("the loading placeholder reserves safe-area height without visible or interactive content", () => {
  let top = 0;
  const { GameHeaderPlaceholder } = loadComponent(
    "components/CustomHeader/GameHeaderPlaceholder.tsx",
    {
      "react-native": { View: "View" },
      "react-native-safe-area-context": { useSafeAreaInsets: () => ({ top }) },
    },
  );

  for (top of [0, 24, 62, 100]) {
    const placeholder = GameHeaderPlaceholder();
    assert.equal(placeholder.type, "View");
    assert.equal(placeholder.props.style.height, 56 + top);
    assert.equal(placeholder.props.children, undefined);
    assert.equal(placeholder.props.pointerEvents, "none");
    assert.equal(placeholder.props.accessible, false);
    assert.equal(
      placeholder.props.importantForAccessibility,
      "no-hide-descendants",
    );
  }
});

for (const tab of ["home", "league", "explore", "profile"]) {
  test(`${tab} starts detail routes with reserved invisible header space`, () => {
    const Stack = () => {};
    const CustomHeader = () => {};
    const GameHeaderPlaceholder = () => {};
    const { default: Layout } = loadComponent(
      `app/(tabs)/(${tab})/_layout.tsx`,
      {
        "expo-router": { Stack },
        "components/CustomHeader": { CustomHeader },
        "components/CustomHeader/GameHeaderPlaceholder": {
          GameHeaderPlaceholder,
        },
      },
    );
    const stack = Layout();
    assert.equal(stack.type, Stack);
    const back = () => {};
    const headerFor = (name, title) =>
      stack.props
        .screenOptions({
          route: { name },
          navigation: { canGoBack: () => true, goBack: back },
        })
        .header({ options: { title } });

    for (const route of [
      "game/football/[game]",
      "game/[sport]/[game]",
      "player/basketball/[id]",
      "player/[sport]/[id]",
      "team/[teamId]",
      "team/nfl/[teamId]",
      "team/[teamType]/[teamId]",
      "league/[sport]",
    ]) {
      assert.equal(headerFor(route).type, GameHeaderPlaceholder);
    }
    const messages = headerFor("messages/index", "Messages");
    assert.equal(messages.type, CustomHeader);
    assert.equal(messages.props.title, "Messages");
    assert.equal(messages.props.onBack, back);
  });
}
