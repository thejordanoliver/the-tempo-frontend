import assert from "node:assert/strict";
import test from "node:test";
import {
  deferred,
  flush,
  sportsHookHarness,
} from "./helpers/sportsHookHarness.mjs";

function createRacingScreen() {
  const h = sportsHookHarness();
  const requests = [];
  h.modules["utils/common/dateUtils"] = {
    formatDateToUTCYYYYMMDD: (date) =>
      date ? String(date).slice(0, 10) : null,
  };
  h.modules["utils/apiClient"] = {
    apiClient: {
      get(url, config) {
        const request = deferred();
        requests.push({ url, config, ...request });
        return request.promise;
      },
    },
  };
  const { useRacingEvents } = h.load("hooks/RacingHooks/useRacingEvents.ts");
  const calendar = () => {};
  const args = (date) => [
    { date, league: "f1", onScoreboardCalendar: calendar },
  ];
  h.start(useRacingEvents, args(null));
  return { h, requests, selectDate: (date) => h.update(args(date)) };
}

test("racing is pending before its first effect and when the calendar selects an event", async () => {
  const { h, requests, selectDate } = createRacingScreen();
  try {
    assert.equal(requests.length, 0);
    assert.equal(h.state.loading, true);
    await flush();
    requests[0].resolve({ data: { events: [] } });
    await flush();
    assert.equal(h.state.loading, false);

    selectDate("2026-11-08");
    assert.equal(
      requests.length,
      1,
      "the selected event request has not started yet",
    );
    assert.equal(
      h.state.loading,
      true,
      "hide league chrome before the effect starts",
    );
    await flush();
    requests[1].resolve({ data: { events: [] } });
    await flush();
    assert.equal(
      h.state.loading,
      false,
      "an empty event result settles loading",
    );
  } finally {
    h.stop();
  }
});

test("racing selected-event failures settle loading and same-event refresh remains refreshing only", async () => {
  const { h, requests, selectDate } = createRacingScreen();
  try {
    await flush();
    requests[0].resolve({ data: { events: [] } });
    await flush();
    selectDate("2026-11-08");
    await flush();
    requests[1].reject(new Error("Event unavailable"));
    await flush();
    assert.equal(h.state.loading, false);
    assert.equal(h.state.error.message, "Event unavailable");

    const refreshing = h.state.refreshEvents();
    await flush();
    assert.equal(h.state.loading, false);
    assert.equal(h.state.refreshing, true);
    requests[2].resolve({ data: { events: [] } });
    await refreshing;
    await flush();
    assert.equal(h.state.loading, false);
    assert.equal(h.state.refreshing, false);
  } finally {
    h.stop();
  }
});

test("an obsolete racing completion cannot settle a newly selected event", async () => {
  const { h, requests, selectDate } = createRacingScreen();
  try {
    await flush();
    selectDate("2026-11-08");
    await flush();
    requests[0].resolve({ data: { events: [] } });
    await flush();
    assert.equal(h.state.loading, true);
    requests[1].resolve({ data: { events: [] } });
    await flush();
    assert.equal(h.state.loading, false);
  } finally {
    h.stop();
  }
});
