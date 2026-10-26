import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js";

dayjs.extend(isBetween);

// Exercise the actual screen's calendar -> week selector -> games hook wiring
// without loading native UI modules.
const source = ts.createSourceFile(
  "football.tsx",
  fs.readFileSync(
    new URL("../app/league/football.tsx", import.meta.url),
    "utf8",
  ),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const screenSource = source.statements
  .filter(
    (node) =>
      ts.isFunctionDeclaration(node) &&
      [
        "CFBLeagueScreen",
        "getSeasonTypeFromStage",
        "getSeasonSlugFromStage",
      ].includes(node.name?.text),
  )
  .map((node) => node.getText(source))
  .join("\n");
const code = ts.transpileModule(
  screenSource + "\nexport { CFBLeagueScreen };",
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  },
).outputText;

const regularWeeks = [7, 8, 9].map((number, index) => ({
  label: `Week ${number}`,
  stage: "Regular Season",
  weekNumber: number,
  startDate: `2026-10-${12 + index * 7}T07:00Z`,
  endDate: `2026-${index === 2 ? "11-02" : `10-${19 + index * 7}`}T06:59Z`,
}));

function setup() {
  const state = [];
  let stateIndex, tree, request;
  let calendar = [],
    calendarLoading = true;
  const calendarCalls = [];
  const exports = {};
  const context = {
    exports,
    React: {
      createElement: (type, props, ...children) => ({
        type,
        props: props ?? {},
        children,
      }),
    },
    useState: (initial) => {
      const index = stateIndex++;
      if (!(index in state))
        state[index] = typeof initial === "function" ? initial() : initial;
      return [
        state[index],
        (next) => {
          state[index] = typeof next === "function" ? next(state[index]) : next;
        },
      ];
    },
    useRef: (current) => ({ current }),
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useEffect: () => {},
    useLayoutEffect: () => {},
    dayjs: (value) => dayjs(value ?? "2026-10-23T12:00:00-04:00"),
    getFootballSeason: () => 2026,
    getRecruitYear: () => 2027,
    useLeagueFavoriteHeader: () => ({}),
    useNavigation: () => ({}),
    usePreferences: () => ({ resolvedColorScheme: "light" }),
    LeagueScreenStyles: () => ({}),
    useLeagueTabs: () => ({
      tabs: ["scores"],
      selectedTab: "scores",
      hasVisitedTab: () => false,
    }),
    usePagerTabScrollProgress: () => ({}),
    useLeagueCalendar: (...args) => {
      calendarCalls.push(args);
      return { calendar, loading: calendarLoading };
    },
    getCFBConferenceSelectionName: () => "Top 25",
    useFootballGames: (params) => {
      request = params;
      return { games: [], loading: false };
    },
    useLeaguesNews: () => ({}),
    useCFBPlayoffs: () => ({}),
    useSeasonLeaders: () => ({}),
    useConferenceStandings: () => ({}),
  };
  for (const name of [
    "MainScrollTabBar",
    "View",
    "PagerView",
    "WeekSelector",
    "GamesList",
    "ConferenceListModal",
  ]) {
    context[name] = name;
  }
  vm.runInNewContext(code, context);
  const render = () => {
    stateIndex = 0;
    tree = exports.CFBLeagueScreen();
  };
  const find = (type, node = tree) =>
    node?.type === type
      ? node
      : node?.children?.map((child) => find(type, child)).find(Boolean);
  render();
  return {
    get request() {
      return request;
    },
    get selector() {
      return find("WeekSelector").props;
    },
    get calendarCalls() {
      return calendarCalls;
    },
    loadCalendar(weeks = regularWeeks) {
      calendar = weeks;
      calendarLoading = false;
      render();
    },
    selectWeek(index) {
      find("WeekSelector").props.onSelectWeek(index);
      render();
    },
    selectConference(id) {
      find("ConferenceListModal").props.onSelect(id);
      render();
    },
  };
}

test("college football waits for its calendar before fetching games", () => {
  const screen = setup();
  assert.equal(screen.request.enabled, false);
  assert.equal(screen.selector.loading, true);
  // The calendar must load independently to avoid waiting for a disabled games request.
  assert.deepEqual(screen.calendarCalls[0], ["cfb", "football"]);
});

test("the first enabled college football request matches the current week selector", () => {
  const screen = setup();
  screen.loadCalendar();
  assert.equal(screen.selector.selectedWeekIndex, 1);
  assert.equal(screen.request.enabled, true);
  assert.equal(screen.request.week, 8);
  assert.equal(screen.request.season, 2026);
  assert.equal(screen.request.seasontype, 2);
  assert.equal(screen.request.league, "cfb");
});

test("manual week and conference selections keep requesting the selected week", () => {
  const screen = setup();
  screen.loadCalendar();
  screen.selectWeek(0);
  screen.selectConference(8);
  assert.equal(screen.request.week, 7);
  assert.equal(screen.request.conferenceId, 8);
  assert.equal(screen.selector.selectedWeekIndex, 0);
});

test("college football selects the postseason week with its season type", () => {
  const screen = setup();
  screen.loadCalendar([
    { ...regularWeeks[1], label: "Bowls", stage: "Postseason", weekNumber: 1 },
  ]);
  assert.equal(screen.request.week, 1);
  assert.equal(screen.request.seasontype, 3);
});
