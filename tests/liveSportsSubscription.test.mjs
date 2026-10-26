import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function setup() {
  const slots = [],
    subscriptions = [];
  let cursor = 0,
    pending = [],
    focused = true;
  const same = (a, b) =>
    a?.length === b.length && a.every((x, i) => Object.is(x, b[i]));
  const react = {
    useRef(initial) {
      const i = cursor++;
      slots[i] ??= { current: initial };
      return slots[i];
    },
    useCallback(callback, deps) {
      const i = cursor++;
      if (!same(slots[i]?.deps, deps)) slots[i] = { deps, callback };
      return slots[i].callback;
    },
    useEffect(callback, deps) {
      const i = cursor++;
      if (same(slots[i]?.deps, deps)) return;
      const previous = slots[i];
      pending.push(() => {
        previous?.cleanup?.();
        slots[i] = { deps, cleanup: callback() };
      });
    },
  };
  const dependencies = {
    react,
    "expo-router": {
      useFocusEffect: (callback) =>
        react.useEffect(
          () => (focused ? callback() : undefined),
          [callback, focused],
        ),
    },
    "services/liveSportsSocket": {
      getSportsLiveSubscriptionLocalKey: (kind, payload) =>
        JSON.stringify([kind, payload]),
      subscribeSportsLive(options) {
        const record = { ...options, active: true };
        subscriptions.push(record);
        return () => {
          record.active = false;
        };
      },
    },
  };
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync("hooks/useLiveSportsSubscription.ts", "utf8"),
      {
        compilerOptions: { module: ts.ModuleKind.CommonJS },
      },
    ).outputText,
    { exports, require: (name) => dependencies[name] },
  );
  return {
    subscriptions,
    render(options, focus = true) {
      cursor = 0;
      focused = focus;
      exports.useLiveSportsSubscription(options);
      const effects = pending;
      pending = [];
      effects.forEach((effect) => effect());
    },
  };
}

test("selection changes replace the active subscription and discard queued old updates", () => {
  const hook = setup(),
    received = [];
  const payloads = [
    {
      sport: "basketball",
      league: "mcbb",
      date: "20261017",
      conferenceId: "1",
    },
    {
      sport: "basketball",
      league: "mcbb",
      date: "20261018",
      conferenceId: "1",
    },
    {
      sport: "basketball",
      league: "mcbb",
      date: "20261018",
      conferenceId: "2",
    },
    {
      sport: "basketball",
      league: "wcbb",
      date: "20261018",
      conferenceId: "2",
    },
  ];
  for (const payload of payloads) {
    hook.render({
      kind: "scoreboard",
      payload,
      onUpdate: (value) => received.push(value),
    });
    assert.deepEqual(hook.subscriptions.at(-1).payload, payload);
    assert.equal(hook.subscriptions.filter((s) => s.active).length, 1);
  }
  assert.equal(hook.subscriptions.length, payloads.length);
  hook.subscriptions[0].listener({ payload: "old" });
  hook.subscriptions.at(-1).listener({ payload: "current" });
  assert.deepEqual(received, ["current"]);
});

test("game changes resubscribe, equal payloads keep the subscription, and listeners stay current", () => {
  const hook = setup(),
    received = [];
  const payload = { sport: "football", league: "nfl", gameId: "1" };
  hook.render({
    kind: "game",
    payload,
    onUpdate: () => received.push("old callback"),
  });
  hook.render({
    kind: "game",
    payload: { ...payload },
    onUpdate: () => received.push("new callback"),
  });
  assert.equal(hook.subscriptions.length, 1);
  hook.subscriptions[0].listener({ payload: {} });
  assert.deepEqual(received, ["new callback"]);
  hook.render({
    kind: "game",
    payload: { ...payload, gameId: "2" },
    onUpdate() {},
  });
  assert.equal(hook.subscriptions.length, 2);
  assert.equal(hook.subscriptions[0].active, false);
});

test("disabled and blurred screens clean up and resume with the latest selection", () => {
  const hook = setup();
  const options = {
    kind: "game",
    payload: { sport: "football", league: "nfl", gameId: "1" },
    onUpdate() {},
  };
  hook.render(options);
  hook.render({ ...options, enabled: false });
  assert.equal(hook.subscriptions[0].active, false);
  hook.render(options, false);
  hook.render(
    { ...options, payload: { ...options.payload, gameId: "2" } },
    false,
  );
  assert.equal(hook.subscriptions.length, 1);
  hook.render({ ...options, payload: { ...options.payload, gameId: "2" } });
  assert.equal(hook.subscriptions.at(-1).payload.gameId, "2");
});
