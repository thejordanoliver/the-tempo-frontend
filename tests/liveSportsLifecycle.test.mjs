import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function setup() {
  let appStateChanged;
  const events = [],
    handlers = new Map();
  let connects = 0,
    disconnects = 0,
    clients = 0;
  const socket = {
    connected: true,
    on(name, callback) {
      handlers.set(name, callback);
    },
    emit(name, payload, ack) {
      events.push({ name, payload });
      ack?.({
        ok: true,
        subscriptionKey: `${payload.league}:${payload.gameId ?? payload.feed ?? "scoreboard"}`,
      });
    },
    connect() {
      connects++;
      this.connected = true;
      handlers.get("connect")?.();
    },
    disconnect() {
      disconnects++;
      this.connected = false;
    },
  };
  const appState = {
    currentState: "active",
    addEventListener(_name, callback) {
      appStateChanged = callback;
    },
  };
  const dependencies = {
    "react-native": { AppState: appState },
    "socket.io-client": {
      io() {
        clients++;
        return socket;
      },
    },
    "utils/apiClient": { getAccessToken: async () => "test-token" },
    "utils/apiConfig": {
      getSocketNamespaceUrl: () => "https://backend.test/sports-live",
    },
  };
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync("services/liveSportsSocket.ts", "utf8"),
      {
        compilerOptions: { module: ts.ModuleKind.CommonJS },
      },
    ).outputText,
    { exports, __DEV__: false, require: (name) => dependencies[name] },
  );
  return {
    service: exports,
    events,
    socket,
    send: (name, update) => handlers.get(name)(update),
    stats: () => ({ connects, disconnects, clients }),
    changeState(state) {
      appState.currentState = state;
      appStateChanged(state);
    },
  };
}

test("shared sports subscriptions disconnect in background and rejoin once on foreground", () => {
  const h = setup();
  const payload = { sport: "basketball", league: "nba", date: "20261024" };
  const first = h.service.subscribeSportsLive({
    kind: "scoreboard",
    payload,
    listener() {},
  });
  const second = h.service.subscribeSportsLive({
    kind: "scoreboard",
    payload,
    listener() {},
  });
  assert.equal(h.stats().clients, 1);
  assert.equal(
    h.events.filter(({ name }) => name.endsWith(":subscribe")).length,
    1,
  );
  h.changeState("background");
  assert.equal(h.socket.connected, false);
  h.changeState("active");
  assert.equal(h.socket.connected, true);
  assert.equal(
    h.events.filter(({ name }) => name.endsWith(":subscribe")).length,
    2,
  );
  first();
  assert.equal(h.socket.connected, true);
  second();
  assert.equal(h.socket.connected, false);
  const connects = h.stats().connects;
  h.changeState("active");
  assert.equal(
    h.stats().connects,
    connects,
    "no subscriptions means no reconnect",
  );
});

test("screens joining a shared scoreboard receive its current live status immediately", () => {
  const h = setup();
  const payload = { sport: "basketball", league: "nba", date: "20261031" };
  const firstUpdates = [],
    secondUpdates = [];
  const first = h.service.subscribeSportsLive({
    kind: "scoreboard",
    payload,
    listener: (update) => firstUpdates.push(update),
  });
  const live = {
    subscriptionKey: "nba:scoreboard",
    payload: { games: [{ id: "1", status: { state: "in" } }] },
    emittedAt: "2026-10-31T20:00:00Z",
  };
  h.send("sports:scoreboard:update", live);
  const second = h.service.subscribeSportsLive({
    kind: "scoreboard",
    payload,
    listener: (update) => secondUpdates.push(update),
  });
  assert.deepEqual(secondUpdates, [live]);
  assert.deepEqual(
    firstUpdates,
    [live],
    "joining does not notify existing listeners again",
  );
  assert.equal(
    h.events.filter(({ name }) => name.endsWith(":subscribe")).length,
    1,
  );
  first();
  const final = {
    ...live,
    payload: { games: [{ id: "1", status: { state: "post" } }] },
  };
  h.send("sports:scoreboard:update", final);
  assert.deepEqual(secondUpdates, [live, final]);
  assert.deepEqual(
    firstUpdates,
    [live],
    "departed screens stop receiving updates",
  );
  second();
  const thirdUpdates = [];
  const third = h.service.subscribeSportsLive({
    kind: "scoreboard",
    payload,
    listener: (update) => thirdUpdates.push(update),
  });
  assert.deepEqual(
    thirdUpdates,
    [],
    "unused feeds do not retain stale snapshots",
  );
  third();
});
