import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function setup(ack = true) {
  const handlers = new Map(),
    events = [],
    updates = [];
  const codec = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync("utils/games/liveDelta.ts", "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    { exports: codec },
  );
  const socket = {
    connected: true,
    on(name, fn) {
      handlers.set(name, fn);
    },
    emit(name, payload, callback) {
      events.push({ name, payload });
      if (ack) callback?.({ ok: true, subscriptionKey: "server-key" });
    },
    connect() {
      this.connected = true;
    },
    disconnect() {
      this.connected = false;
    },
  };
  const modules = {
    "react-native": {
      AppState: { currentState: "active", addEventListener() {} },
    },
    "socket.io-client": { io: () => socket },
    "utils/apiClient": { getAccessToken: async () => "test" },
    "utils/apiConfig": {
      getSocketNamespaceUrl: () => "https://example.test/sports-live",
    },
    "utils/games/liveDelta": codec,
  };
  const api = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync("services/liveSportsSocket.ts", "utf8"),
      { compilerOptions: { module: ts.ModuleKind.CommonJS } },
    ).outputText,
    { exports: api, __DEV__: false, require: (name) => modules[name] },
  );
  const stop = api.subscribeSportsLive({
    kind: "game",
    payload: { sport: "football", league: "nfl", gameId: "401" },
    listener: (frame) => updates.push(frame.payload),
  });
  const frame = (extra) => ({
    kind: "game",
    sport: "football",
    league: "nfl",
    gameId: "401",
    subscriptionKey: "server-key",
    emittedAt: "2026-10-25",
    representation: "delta-v1",
    ...extra,
  });
  return {
    socket,
    handlers,
    events,
    updates,
    stop,
    send: (extra) => handlers.get("sports:game:delta")(frame(extra)),
  };
}

test("delta subscriptions reconstruct full payloads, recover missing bases once, and reset after reconnect", () => {
  const h = setup();
  try {
    assert.equal(h.events[0].payload.representation, "delta-v1");
    h.send({
      revision: 1,
      snapshot: { score: { clock: "1:00", venue: "Arena" } },
    });
    h.send({
      revision: 3,
      baseRevision: 2,
      changes: [{ path: ["score", "clock"], value: "0:58" }],
      removed: [],
    });
    h.send({ revision: 4, baseRevision: 3, changes: [], removed: [] });
    assert.equal(
      h.events.filter((e) => e.name === "sports:game:subscribe").length,
      2,
    );
    assert.equal(h.updates.length, 1);
    h.send({
      revision: 4,
      snapshot: { score: { clock: "0:57", venue: "Arena" } },
    });
    h.send({
      revision: 5,
      baseRevision: 4,
      changes: [{ path: ["score", "clock"], value: "0:56" }],
      removed: [],
    });
    assert.equal(h.updates.at(-1).score.clock, "0:56");
    assert.equal(h.updates.at(-1).score.venue, "Arena");
    h.handlers.get("connect")();
    h.send({ revision: 1, snapshot: { score: { clock: "0:55" } } });
    assert.equal(h.updates.at(-1).score.clock, "0:55");
  } finally {
    h.stop();
  }
});

test("a lost join acknowledgement is recovered by the first matching snapshot", () => {
  const h = setup(false);
  try {
    h.send({ revision: 1, snapshot: { score: { clock: "1:00" } } });
    assert.equal(h.updates.length, 1);
    assert.equal(h.updates[0].score.clock, "1:00");
  } finally {
    h.stop();
  }
});

test("legacy server full updates remain supported", () => {
  const h = setup();
  try {
    h.handlers.get("sports:game:update")({
      subscriptionKey: "server-key",
      payload: { score: { clock: "1:00" } },
    });
    assert.equal(h.updates[0].score.clock, "1:00");
  } finally {
    h.stop();
  }
});
