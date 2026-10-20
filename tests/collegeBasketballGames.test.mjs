import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import dayjs from "dayjs";

function loadModule(path, modules) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => {
    assert.ok(name in modules, `Unexpected import: ${name}`);
    return modules[name];
  }, console });
  return exports;
}

async function fetchGames(league, conferenceId) {
  const requests = [], states = [], effects = [];
  let subscription;
  const games = [{ id: 3 }, { id: 1 }, { id: 2 }];
  const hook = loadModule("hooks/BasketballHooks/useBasketballGames.ts", {
    react: {
      useState(initial) {
        const slot = { value: initial };
        states.push(slot);
        return [initial, (next) => { slot.value = next; }];
      },
      useRef: (current) => ({ current }),
      useMemo: (callback) => callback(),
      useCallback: (callback) => callback,
      useEffect: (callback) => effects.push(callback),
    },
    dayjs,
    "utils/games/gameStatus": { shouldTrackGameUpdates: () => true },
    "hooks/useLiveSportsSubscription": { useLiveSportsSubscription: (options) => { subscription = options; } },
    "utils/apiClient": { apiClient: { get: async (url, options) => {
      requests.push({ url, ...options });
      return { data: { games } };
    } } },
  });
  const result = hook.useBasketballGames(new Date(2025, 0, 15), league, conferenceId);
  effects.forEach((effect) => effect());
  await new Promise((resolve) => setTimeout(resolve, 0));
  return { requests, states, subscription, result, games };
}

for (const league of ["mcbb", "wcbb"]) {
  for (const selection of ["top25", 50, 2]) {
    test(`${league} forwards ${selection} through HTTP, refresh, and live subscriptions`, async () => {
      const { requests, states, subscription, result, games } = await fetchGames(league, selection);
      const expected = { date: "20250115", conferenceId: String(selection) };
      assert.equal(requests[0].url, `api/games/basketball/${league}`);
      assert.equal(JSON.stringify(requests[0].params), JSON.stringify(expected));
      assert.equal(subscription.payload.conferenceId, String(selection));
      assert.equal(subscription.payload.date, "20250115");
      assert.deepEqual(states[0].value, games);
      await result.refreshGames();
      assert.equal(JSON.stringify(requests[1].params), JSON.stringify(expected));
      const liveGames = [{ id: 2 }, { id: 3 }, { id: 1 }];
      subscription.onUpdate({ games: liveGames });
      assert.deepEqual(states[0].value, liveGames);
    });
  }
}

test("NBA ignores college selections", async () => {
  const { requests, subscription } = await fetchGames("nba", "top25");
  assert.equal(requests[0].params.conferenceId, undefined);
  assert.equal(subscription.payload.conferenceId, undefined);
});

const { getSportsLiveSubscriptionLocalKey } = loadModule("services/liveSportsSocket.ts", {
  "react-native": { AppState: {} },
  "socket.io-client": {},
  "utils/apiClient": {},
  "utils/apiConfig": { getSocketNamespaceUrl: () => "/sports-live" },
});

for (const league of ["mcbb", "wcbb"]) {
  test(`${league} uses separate local subscriptions for Top 25, Division I, and each conference`, () => {
    const input = { sport: "basketball", league, date: "20250115" };
    const key = (payload) => getSportsLiveSubscriptionLocalKey("scoreboard", payload);
    const keys = ["top25", 50, 2, 3].map(conferenceId => key({ ...input, conferenceId }));
    assert.equal(new Set(keys).size, 4);
    assert.equal(key({ ...input, groups: "2" }), keys[2]);
    assert.equal(key({ ...input, groupId: 2 }), keys[2]);
  });
}
