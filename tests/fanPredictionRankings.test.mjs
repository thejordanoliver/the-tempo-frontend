import assert from "node:assert/strict";
import test from "node:test";
import {
  deferred,
  flush,
  sportsHookHarness,
} from "./helpers/sportsHookHarness.mjs";

function rankingsHarness() {
  const h = sportsHookHarness();
  const requests = [];
  h.modules["services/fanPredictionsApi"] = {
    fetchPredictionRankings(signal, sport) {
      const request = { signal, sport, ...deferred() };
      requests.push(request);
      return request.promise;
    },
  };
  h.start(
    h.load("hooks/FanPredictionHooks/useFanPredictionRankings.ts")
      .useFanPredictionRankings,
  );
  return Object.assign(h, { requests });
}

const overall = {
  rankings: [{ userId: 1, points: 12 }],
  me: { userId: 1, points: 12 },
};
const football = {
  rankings: [{ userId: 2, points: 4 }],
  me: { userId: 1, points: 2 },
};

test("defaults to All Sports and loads the leaderboard and current fan together", async () => {
  const h = rankingsHarness();
  try {
    assert.equal(h.requests[0].sport, undefined);
    h.requests[0].resolve(overall);
    await flush();
    assert.equal(h.state.data, overall);
    assert.equal(h.state.loading, false);
  } finally {
    h.stop();
  }
});

test("changing sports immediately hides the previous record and ignores late responses", async () => {
  const h = rankingsHarness();
  try {
    h.requests[0].resolve(overall);
    await flush();
    h.update(["football"]);
    assert.equal(h.state.data, null);
    assert.equal(h.state.loading, true);
    assert.equal(h.requests[1].sport, "football");
    h.update(["basketball"]);
    assert.equal(h.requests[1].signal.aborted, true);
    h.requests[1].resolve(football);
    await flush();
    assert.equal(h.state.data, null);
    assert.equal(h.state.error, null);
    h.requests[2].resolve(overall);
    await flush();
    assert.equal(h.state.data, overall);
    h.update(["all"]);
    assert.equal(h.state.data, null);
    assert.equal(h.requests[3].sport, undefined);
  } finally {
    h.stop();
  }
});

test("refresh and retry keep the selected sport and its last successful standings", async () => {
  const h = rankingsHarness();
  try {
    h.update(["football"]);
    h.requests[1].resolve(football);
    await flush();
    h.state.refresh();
    await flush();
    assert.equal(h.requests[2].sport, "football");
    assert.equal(h.state.data, football);
    assert.equal(h.state.refreshing, true);
    h.requests[2].reject(new Error("offline"));
    await flush();
    assert.equal(h.state.data, football);
    assert.equal(h.state.refreshing, false);
    assert.match(h.state.error, /couldn't load/);
    h.state.refresh();
    await flush();
    assert.equal(h.state.error, null);
    h.requests[3].resolve(football);
    await flush();
    assert.equal(h.state.data, football);
    assert.equal(h.state.refreshing, false);
  } finally {
    h.stop();
  }
});

test("a failed request for a new sport settles loading without showing the previous sport", async () => {
  const h = rankingsHarness();
  try {
    h.requests[0].resolve(overall);
    await flush();
    h.update(["football"]);
    h.requests[1].reject(new Error("offline"));
    await flush();
    assert.equal(h.state.data, null);
    assert.equal(h.state.loading, false);
    assert.match(h.state.error, /couldn't load/);
    h.state.refresh();
    assert.equal(h.requests[2].sport, "football");
    await flush();
    assert.equal(h.state.refreshing, true);
    assert.equal(h.state.error, null);
    h.requests[2].resolve(football);
    await flush();
    assert.equal(h.state.data, football);
    assert.equal(h.state.loading, false);
  } finally {
    h.stop();
  }
});

test("returning to a previous sport during a pending request waits for fresh results", async () => {
  const h = rankingsHarness();
  try {
    h.requests[0].resolve(overall);
    await flush();
    h.update(["football"]);
    h.update(["all"]);
    assert.equal(h.requests[1].signal.aborted, true);
    assert.equal(h.state.data, null);
    assert.equal(h.state.loading, true);
    h.requests[1].resolve(football);
    await flush();
    assert.equal(h.state.data, null);
    h.requests[2].resolve(overall);
    await flush();
    assert.equal(h.state.data, overall);
    assert.equal(h.state.loading, false);
  } finally {
    h.stop();
  }
});

test("rankings API sends a sport query only when a specific sport is selected", async () => {
  const h = sportsHookHarness();
  const calls = [];
  h.modules["utils/games/predictionAvailability"] = {
    isUnavailablePrediction: () => false,
  };
  h.modules["services/predictionUpdates"] = {
    notifyPredictionPicksChanged() {},
  };
  h.modules["utils/apiClient"] = {
    apiClient: {
      get: async (url, config) => {
        calls.push({ url, config });
        return { data: overall };
      },
    },
  };
  const { fetchPredictionRankings } = h.load("services/fanPredictionsApi.ts");
  const request = new AbortController();
  await fetchPredictionRankings(request.signal, "football");
  assert.equal(calls[0].url, "/api/predictions/rankings");
  assert.equal(calls[0].config.params.sport, "football");
  assert.equal(calls[0].config.signal, request.signal);
  await fetchPredictionRankings(request.signal);
  assert.equal(calls[1].config.params, undefined);
});
