import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

async function loadCalendar(source, month = "2026-10", format = "raw") {
  const requests = [];
  const cacheWrites = [];
  const states = [];
  const effects = [];
  const modules = {
    react: {
      useState(value) {
        const state = { value };
        states.push(state);
        return [value, (next) => { state.value = next; }];
      },
      useRef: (current) => ({ current }),
      useMemo: (fn) => fn(),
      useCallback: (fn) => fn,
      useEffect: (fn) => effects.push(fn),
    },
    "utils/apiClient": { apiClient: { get: async (url) => {
      requests.push(url);
      return { data: { calendar: ["2026-10-21"] } };
    } } },
    "utils/teams/leagueCalendarCache": {
      getCachedLeagueCalendar: async () => null,
      getLeagueCalendarCacheKey: (league, month) => `${league}:${month}`,
      getLeagueCalendarDateKey: (date) => date.slice(0, 10),
      getLeagueCalendarMonth: (date) => date?.slice(0, 7) ?? null,
      getLeagueCalendarMonthAnchor: (month) => `${month}-01`,
      normalizeLeagueCalendarLeague: (league) => league,
      setCachedLeagueCalendar: async (...args) => cacheWrites.push(args),
    },
  };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(new URL("../hooks/LeagueHooks/useLeagueCalendar.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => modules[name], AbortController, console });
  exports.useLeagueCalendar("nba", format, `${month}-01`, source);
  effects.forEach((fn) => fn());
  await new Promise((resolve) => setTimeout(resolve, 0));
  return JSON.parse(JSON.stringify({ requests, cacheWrites, calendar: states[0].value, loading: states[1].value }));
}

const source = {
  pending: false, calendar: ["2026-10-16"],
  startDate: "2026-09-30", endDate: "2027-06-26",
};

test("uses and caches scoreboard dates without a calendar request", async () => {
  const result = await loadCalendar(source);
  assert.equal(result.requests.length, 0);
  assert.deepEqual(result.calendar, source.calendar);
  assert.deepEqual(result.cacheWrites, [["nba", "2026-10", source.calendar]]);
});

test("waits for the initial scoreboard before requesting a fallback", async () => {
  assert.equal((await loadCalendar({ pending: true })).requests.length, 0);
});

test("falls back when scoreboard calendar is unavailable", async () => {
  assert.deepEqual((await loadCalendar({ pending: false })).requests, ["/api/games/calendar/nba"]);
});

test("fetches a separate calendar for months outside the scoreboard season", async () => {
  assert.deepEqual((await loadCalendar(source, "2028-01")).requests, ["/api/games/calendar/nba"]);
});

test("an empty scoreboard calendar is valid and does not trigger a fallback", async () => {
  assert.equal((await loadCalendar({ ...source, calendar: [] })).requests.length, 0);
});


test("keeps selector loading until the initial games request completes", async () => {
  assert.equal((await loadCalendar({ pending: true })).loading, true);
});

test("builds football weeks from the included calendar without a separate request", async () => {
  const result = await loadCalendar({ pending: false, calendar: [{
    label: "Regular Season", entries: [{ label: "Week 7", value: "7",
      startDate: "2026-10-15", endDate: "2026-10-21" }],
  }] }, "2026-10", "football");
  assert.equal(result.requests.length, 0);
  assert.deepEqual(result.calendar, [{ label: "Week 7", stage: "Regular Season",
    weekNumber: 7, startDate: "2026-10-15", endDate: "2026-10-21" }]);
});

for (const format of ["ufc", "racing"]) {
  test(`${format} builds event selections from the included calendar`, async () => {
    const result = await loadCalendar({ pending: false, calendar: [{
      label: "Event", value: "1", startDate: "2026-10-16", endDate: "2026-10-18",
      event: { $ref: "https://example.com/events/123" },
    }] }, "2026-10", format);
    assert.equal(result.requests.length, 0);
    assert.equal(result.calendar[0].eventId, "123");
    assert.equal(result.calendar[0].label, "Event");
  });
}

function loadBridge() {
  let result = null;
  let ref;
  const exports = {};
  const react = {
    useState: () => [result, (next) => { result = typeof next === "function" ? next(result) : next; }],
    useRef: (current) => (ref ??= { current }),
    useEffect: (fn) => fn(),
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
  };
  const code = ts.transpileModule(fs.readFileSync(new URL("../hooks/LeagueHooks/useScoreboardCalendar.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, { exports, require: () => react });
  return (league = "nfl") => exports.useScoreboardCalendar(league);
}

test("bridge retains an available calendar when a later refresh omits it", () => {
  const render = loadBridge();
  assert.equal(render().scoreboardCalendar.pending, true);
  render().onScoreboardCalendar({ calendar: ["2026-10-16"] });
  assert.equal(render().scoreboardCalendar.pending, false);
  render().onScoreboardCalendar(null);
  assert.deepEqual(render().scoreboardCalendar.calendar, ["2026-10-16"]);
});

test("bridge enables fallback after the initial games request fails", () => {
  const render = loadBridge();
  render().onScoreboardCalendar(null);
  assert.equal(render().scoreboardCalendar.pending, false);
  assert.equal(render().scoreboardCalendar.calendar, undefined);
});

test("bridge ignores a previous league's late response", () => {
  const render = loadBridge();
  const old = render("nfl");
  const current = render("cfb");
  current.onScoreboardCalendar({ calendar: ["2026-10-17"] });
  old.onScoreboardCalendar({ calendar: ["2026-10-16"] });
  assert.deepEqual(render("cfb").scoreboardCalendar.calendar, ["2026-10-17"]);
});
