import assert from "node:assert/strict";
import test from "node:test";
import {
  sportsHookHarness,
  deferred,
  flush,
} from "./helpers/sportsHookHarness.mjs";

const date = new Date(2026, 9, 24);
const nextDate = new Date(2026, 9, 25);
const definitions = [
  ["Basketball", "useBasketballGames", "nba"],
  ["Baseball", "useBaseballGames", "mlb"],
  ["Hockey", "useHockeyGames", "nhl"],
  ["Soccer", "useSoccerGames", "epl"],
  ["Football", "useFootballGames", "nfl"],
  ["MMA", "useMMAEvents", "ufc"],
  ["Tennis", "useTennisMatches", "atp"],
  ["Volleyball", "useVolleyballGames", "mcvb"],
];
function args(sport, league, options = {}, selectedDate = date) {
  return ["Football", "MMA"].includes(sport)
    ? [{ date: selectedDate, league, ...options }]
    : [selectedDate, league, undefined, options];
}
function fixture(id) {
  const games = [{ id, status: { state: "pre" } }];
  return { games, events: games, matches: games };
}
function setup(sport, name, initialArgs) {
  const h = sportsHookHarness(),
    requests = [];
  h.modules["utils/volleyball"] = { volleyballDirectoryTeam: (team) => team };
  h.modules["utils/apiClient"] = {
    apiClient: {
      get(url, config) {
        const pending = deferred();
        requests.push({ url, config, ...pending });
        return pending.promise;
      },
    },
  };
  h.start(
    h.load(
      `hooks/${sport}Hooks/${sport === "Volleyball" ? "useVolleyball" : name}.ts`,
    )[name],
    initialArgs,
  );
  return Object.assign(h, {
    requests,
    rows: () => h.state.games ?? h.state.matches,
  });
}
for (const [sport, name, league] of definitions) {
  test(`${sport}: disabled hooks and refreshes do no network/subscription work; enabling fetches once`, async () => {
    const h = setup(sport, name, args(sport, league, { enabled: false }));
    try {
      await flush();
      assert.equal(h.requests.length, 0);
      assert.equal(h.subscription.enabled, false);
      await (h.state.refreshGames ?? h.state.refreshMatches)();
      assert.equal(h.requests.length, 0);
      assert.equal(h.state.loading, false);
      h.update(args(sport, league, { enabled: true }));
      await flush();
      assert.equal(h.requests.length, 1);
      h.requests[0].resolve({ data: fixture("retained") });
      await flush();
      assert.equal(h.rows()[0].id, "retained");
      assert.equal(h.subscription.enabled, true);
      h.update(args(sport, league, { enabled: false }));
      await flush();
      assert.equal(h.subscription.enabled, false);
      assert.equal(h.rows()[0].id, "retained");
      h.update(args(sport, league, { enabled: true }));
      assert.equal(h.rows()[0].id, "retained");
      assert.equal(h.state.loading, false);
      await flush();
      assert.equal(h.requests.length, 2);
    } finally {
      h.stop();
    }
  });
  test(`${sport}: disabling cancels in-flight results and unmount cancels deferred work`, async () => {
    const h = setup(sport, name, args(sport, league));
    try {
      await flush();
      const old = h.requests[0];
      const obsoleteRefresh = h.state.refreshGames ?? h.state.refreshMatches;
      h.update(args(sport, league, { enabled: false }));
      assert.equal(old.config.signal.aborted, true);
      await obsoleteRefresh();
      assert.equal(
        h.requests.length,
        1,
        "a retained obsolete refresh callback cannot start a request",
      );
      old.resolve({ data: fixture("cancelled") });
      await flush();
      assert.equal(h.rows().length, 0);
      assert.equal(h.state.loading, false);
    } finally {
      h.stop();
    }
    const stopped = setup(sport, name, args(sport, league));
    stopped.stop();
    await flush();
    assert.equal(stopped.requests.length, 0);
  });
  test(`${sport}: account/date changes immediately mask retained data and ignore old refresh completion`, async () => {
    const h = setup(
      sport,
      name,
      args(sport, league, { scopeKey: "account-one" }),
    );
    try {
      await flush();
      h.requests[0].resolve({ data: fixture("old") });
      await flush();
      const pending = (h.state.refreshGames ?? h.state.refreshMatches)();
      await flush();
      const obsolete = h.requests[1];
      h.update(args(sport, league, { scopeKey: "account-two" }, nextDate));
      assert.equal(h.rows().length, 0);
      await flush();
      assert.equal(obsolete.config.signal.aborted, true);
      h.requests[2].resolve({ data: fixture("new") });
      await flush();
      obsolete.resolve({ data: fixture("obsolete") });
      await pending;
      await flush();
      assert.equal(h.rows()[0].id, "new");
      assert.equal(h.state.loading, false);
    } finally {
      h.stop();
    }
  });
  test(`${sport}: live updates win over an older HTTP refresh`, async () => {
    const h = setup(sport, name, args(sport, league));
    try {
      await flush();
      h.requests[0].resolve({ data: fixture("initial") });
      await flush();
      const pending = (h.state.refreshGames ?? h.state.refreshMatches)();
      await flush();
      h.subscription.onUpdate(fixture("live"));
      await flush();
      assert.equal(h.requests[1].config.signal.aborted, true);
      h.requests[1].resolve({ data: fixture("stale-http") });
      await pending;
      await flush();
      assert.equal(h.rows()[0].id, "live");
      assert.equal(h.state.loading, false);
    } finally {
      h.stop();
    }
  });
}
