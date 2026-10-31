import { TickerRotationUnavailableError } from "../services/ticker/rotation";
import assert from "node:assert/strict";
import { TickerNameUnavailableError } from "../services/ticker/name";
import test from "node:test";
import {
  createTickerController,
  hasBlockingTickerCommand,
} from "../services/ticker/controller";
import type { TickerTransport } from "../services/ticker/transport";
import { favoriteTeamsSignature } from "../services/ticker/favorites";
import { TickerCustomHeaderUnavailableError } from "../services/ticker/customHeader";
import type {
  TickerBluetoothState,
  TickerCommand,
  TickerDevice,
  TickerFavoriteTeam,
  TickerRotationEntry,
} from "../types/ticker";

const device = { id: "device-peripheral-id", name: "Tempo-Ticker-A1B2" };
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
const statusFrame = () =>
  Uint8Array.from([
    1, 3, 0, 0, 0, 0, 15, 50, 1, 1, 2, 1, 2, 3, 0, 0, 0, 0, 0, 0,
  ]);
function harness(
  authorized = true,
  extended = false,
  content = false,
  rename = false,
  displayPreferences = false,
  favoritesMode = false,
  headerOptions = false,
  headerColors = false,
  customHeaders = false,
  rotationMode = false,
  smartPriority = false,
) {
  let notify: (bytes: Uint8Array) => void = () => {};
  let lose: () => void = () => {};
  let stateChange: (state: TickerBluetoothState) => void = () => {};
  let found: (device: TickerDevice) => void = () => {};
  let scanError: (error: Error) => void = () => {};
  let ack = true;
  let result = 0;
  let state: TickerBluetoothState = "PoweredOn";
  const writes: Uint8Array[] = [];
  const disconnected: string[] = [];
  let removed = 0;
  let connects = 0;
  const live = statusFrame();
  if (extended) {
    live[0] = 2;
    live[6] = 127;
    live[11] = 0;
    live[12] = 3;
    live[13] = 0;
    live[14] = 2;
    live[15] = 6;
    live[16] = 1;
  }
  if (content) {
    live[0] = 3;
    live[6] = 127;
    live[11] = 0;
    live[12] = 5;
    live[13] = 0;
    live[14] = 1;
    live[15] = 6;
    live[16] = 0;
  }
  let currentName = "Living Room Ticker";
  const nameWrites: string[] = [];
  if (rename) {
    live[6] |= 128;
    live[12] = 6;
  }
  if (displayPreferences) {
    live[0] = 4;
    live[12] = 7;
  }
  if (favoritesMode) {
    live[0] = 5;
    live[12] = 8;
  }
  if (headerOptions) {
    live[0] = 6;
    live[12] = 9;
  }
  if (headerColors) {
    live[0] = 7;
    live[12] = 10;
  }
  if (customHeaders) {
    live[0] = 8;
    live[12] = 11;
  }
  if (rotationMode) {
    live[0] = 9;
    live[12] = 12;
  }
  if (smartPriority) {
    live[0] = 10;
    live[12] = 14;
  }
  let currentRotation = new Uint8Array();
  let stagedRotation = new Uint8Array();
  let currentCustomHeader = "";
  const customHeaderWrites: string[] = [];
  const transport: TickerTransport = {
    async readRotation() {
      return currentRotation;
    },
    async readCustomHeader() {
      return currentCustomHeader;
    },
    async writeCustomHeader(_, text) {
      customHeaderWrites.push(text);
      currentCustomHeader = text;
    },
    async prepare(callback) {
      stateChange = callback;
      return state;
    },
    async scan(callback, error) {
      found = callback;
      scanError = error;
    },
    async stopScan() {},
    async connect() {
      connects++;
    },
    async discover() {},
    async readName() {
      return currentName;
    },
    async writeName(_, value) {
      nameWrites.push(value);
      currentName = value;
    },
    async readStatus() {
      return live;
    },
    monitor(_, callback) {
      notify = callback;
      return () => {
        removed++;
      };
    },
    onDisconnect(_, callback) {
      lose = callback;
      return () => {
        removed++;
      };
    },
    async write(_, frame) {
      writes.push(frame);
      if (!ack) return;
      if (frame[4] === 3) live[7] = frame[5];
      if (frame[4] === 4) live[8] = frame[5];
      if (frame[4] === 6) live[10] = (live[10] & ~3) | (frame[5] ? 2 : 1);
      if (frame[4] === 7)
        live[14] = content
          ? (live[14] & ~1) | (frame[5] ? 1 : 0)
          : frame[5]
            ? 2
            : 1;
      if (frame[4] === 8) live[15] = frame[5];
      if (frame[4] === 9) {
        if (content) live[14] = (live[14] & ~2) | (frame[5] ? 2 : 0);
        else live[16] = frame[5] ? 2 : 1;
      }
      if (content && frame[4] === 4) {
        live[16] = 0;
        live.fill(0, 17);
      }
      if (content && frame[4] === 10) {
        live[16] = frame[5];
        live.fill(0, 17);
      }
      if (content && frame[4] === 11) {
        live[16] = 1;
        live.set(frame.slice(5, 8), 17);
      }
      if (frame[4] === 12) live[14] = (live[14] & ~12) | (frame[5] << 2);
      if (frame[4] === 13) live[14] = (live[14] & ~16) | (frame[5] ? 0 : 16);
      if (frame[4] === 16) {
        live[16] = 5;
        live.set(frame.slice(5, 8), 17);
      }
      if (frame[4] === 17) live[14] = (live[14] & ~96) | (frame[5] << 5);
      if (frame[4] === 18) live[10] = (live[10] & 3) | (frame[5] << 2);
      if (frame[4] === 22) live[14] = (live[14] & ~128) | (frame[5] ? 128 : 0);
      if (frame[4] === 19) {
        stagedRotation = new Uint8Array(2 + frame[5] * 6);
        stagedRotation.set([1, frame[5]]);
      }
      if (frame[4] === 20)
        stagedRotation.set(frame.slice(7, 7 + frame[6] * 6), 2 + frame[5] * 6);
      if (frame[4] === 21) {
        currentRotation = stagedRotation;
        live[16] = 6;
        live.set(frame.slice(5, 8), 17);
      }
      const response = live.slice();
      response[1] = 2;
      response[2] = frame[2];
      response[3] = frame[3];
      response[4] = frame[4];
      response[5] = result;
      notify(response);
    },
    async disconnect(id) {
      disconnected.push(id);
    },
    async destroy() {},
  };
  const controller = createTickerController(
    transport,
    { verify: async () => authorized },
    { command: 50, connection: 150, scan: 100 },
    { authorizeOnConnect: true },
  );
  return {
    controller,
    transport,
    writes,
    nameWrites,
    customHeaderWrites,
    disconnected,
    live,
    emit: (frame: Uint8Array) => notify(frame),
    confirmLastWrite: () => {
      const request = writes.at(-1)!;
      if (request[4] === 3) live[7] = request[5];
      if (request[4] === 4) live[8] = request[5];
      if (request[4] === 19) {
        stagedRotation = new Uint8Array(2 + request[5] * 6);
        stagedRotation.set([1, request[5]]);
      }
      const response = live.slice();
      response[1] = 2;
      response[2] = request[2];
      response[3] = request[3];
      response[4] = request[4];
      response[5] = result;
      notify(response);
    },
    loss: () => lose(),
    oldLoss: () => lose,
    change: (next: TickerBluetoothState) => stateChange(next),
    found: (next: TickerDevice) => found(next),
    scanError: () => scanError(new Error("Scan failed")),
    state: (next: TickerBluetoothState) => {
      state = next;
    },
    ack: (next: boolean) => {
      ack = next;
    },
    result: (next: number) => {
      result = next;
    },
    removed: () => removed,
    connects: () => connects,
  };
}

test("connection discovers and verifies before displaying confirmed settings", async () => {
  const h = harness();
  const states: string[] = [];
  h.controller.store.subscribe((state) => states.push(state.connection));
  assert.equal(await h.controller.connect(device), true);
  assert.ok(states.includes("connecting") && states.includes("verifying"));
  assert.equal(h.controller.store.getState().settings?.brightness, 50);
  assert.equal(h.controller.store.getState().authorized, true);
  assert.deepEqual(h.controller.store.getState().lastDevice, device);
  await h.controller.dispose();
});
test("production authorization defaults to denied despite valid UUID and protocol", async () => {
  const h = harness();
  const production = createTickerController(h.transport, undefined, {
    command: 5,
    connection: 50,
    scan: 10,
  });
  // No monitor ACK is needed for the initial status to remain available.
  assert.equal(await production.connect(device), true);
  assert.equal(production.store.getState().authorized, false);
  const before = h.writes.length;
  assert.equal(
    await production.command({ type: "set_league", value: "nfl" }),
    false,
  );
  assert.equal(h.writes.length, before);
  assert.match(production.store.getState().error!, /Unlock controls/);
  await production.dispose();
});
test("brightness waits for matching acknowledgment and updates only on confirmation", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.ack(false);
  const update = h.controller.command({ type: "set_brightness", value: 80 });
  assert.equal(h.controller.store.getState().settings?.brightness, 50);
  const request = h.writes.at(-1)!;
  const response = statusFrame();
  response[1] = 2;
  response[2] = request[2] + 1;
  response[4] = 3;
  response[7] = 80;
  h.emit(response);
  await tick();
  assert.equal(h.controller.store.getState().settings?.brightness, 50);
  response[2] = request[2];
  h.emit(response);
  assert.equal(await update, true);
  assert.equal(h.controller.store.getState().settings?.brightness, 80);
  await h.controller.dispose();
});
test("negative acknowledgment preserves confirmed league and revokes authorization", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.result(2);
  assert.equal(
    await h.controller.command({ type: "set_league", value: "cfb" }),
    false,
  );
  assert.equal(h.controller.store.getState().settings?.selectedLeague, "nba");
  assert.equal(h.controller.store.getState().authorized, false);
  assert.match(h.controller.store.getState().error!, /unauthorized/);
  await h.controller.dispose();
});
test("league success commits one active league", async () => {
  const h = harness();
  await h.controller.connect(device);
  assert.equal(
    await h.controller.command({ type: "set_league", value: "cfb" }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.selectedLeague, "cfb");
  await h.controller.dispose();
});

test("live brightness sends immediately, coalesces drag events and confirms the final value", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.ack(false);
  const before = h.writes.length;
  const first = h.controller.updateSetting({
    type: "set_brightness",
    value: 60,
  });
  assert.equal(h.writes.length, before + 1);
  const skipped = h.controller.updateSetting({
    type: "set_brightness",
    value: 70,
  });
  const last = h.controller.updateSetting({
    type: "set_brightness",
    value: 90,
  });
  assert.equal(await skipped, false);
  assert.equal(h.writes.length, before + 1);
  h.confirmLastWrite();
  assert.equal(await first, true);
  await tick();
  assert.equal(h.writes.length, before + 2);
  assert.equal(h.writes.at(-1)![5], 90);
  h.confirmLastWrite();
  assert.equal(await last, true);
  const count = h.writes.length;
  assert.equal(
    await h.controller.updateSetting({ type: "set_brightness", value: 90 }),
    true,
  );
  assert.equal(h.writes.length, count); // Releasing at the last ACKed value is a no-op.
  assert.equal(h.controller.store.getState().settings?.brightness, 90);
  assert.equal(h.controller.store.getState().error, null);
  await h.controller.dispose();
});

test("sport changes serialize behind brightness and retain the latest sport including a return to the current sport", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.ack(false);
  const brightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 30,
  });
  const skipped = h.controller.updateSetting({
    type: "set_league",
    value: "nfl",
  });
  const college = h.controller.updateSetting({
    type: "set_league",
    value: "cfb",
  });
  assert.equal(await skipped, false);
  h.confirmLastWrite();
  await brightness;
  await tick();
  assert.equal(h.writes.at(-1)![4], 4);
  assert.equal(h.writes.at(-1)![5], 3);
  const nba = h.controller.updateSetting({ type: "set_league", value: "nba" });
  h.confirmLastWrite();
  assert.equal(await college, true);
  await tick();
  assert.equal(h.writes.at(-1)![5], 1);
  h.confirmLastWrite();
  assert.equal(await nba, true);
  assert.equal(h.controller.store.getState().settings?.selectedLeague, "nba");
  assert.equal(h.controller.store.getState().error, null);
  await h.controller.dispose();
});

test("live brightness leaves controls available while exclusive commands block them", () => {
  assert.equal(hasBlockingTickerCommand({}), false);
  assert.equal(hasBlockingTickerCommand({ 1: "set_brightness" }), false);
  assert.equal(hasBlockingTickerCommand({ 2: "set_display" }), true);
  assert.equal(
    hasBlockingTickerCommand({ 1: "set_brightness", 2: "set_league" }),
    true,
  );
});

test("other controls wait behind live brightness and still apply successfully", async () => {
  const commands: TickerCommand[] = [
    { type: "set_display", value: false },
    { type: "set_duration", value: 12 },
    { type: "set_show_rankings", value: false },
    { type: "set_top25_only", value: true },
    { type: "set_view", value: "ap" },
    { type: "set_team_schedule", value: 57 },
    { type: "refresh_scores" },
    { type: "get_status" },
    { type: "set_date_format", value: "dd/mm" },
    { type: "set_show_broadcast", value: false },
    { type: "set_header", value: "device_name" },
    { type: "set_header_color", value: "blue" },
  ];
  for (const next of commands) {
    const h = harness(true, true, true, true, true, true, true, true);
    h.live[8] = 3; // College football supports every poll/filter in this table.
    await h.controller.connect(device);
    h.ack(false);
    const brightness = h.controller.updateSetting({
      type: "set_brightness",
      value: 30,
    });
    const count = h.writes.length;
    const change = h.controller.command(next);
    assert.equal(h.writes.length, count, next.type);
    assert.equal(h.controller.store.getState().error, null, next.type);
    h.ack(true);
    h.confirmLastWrite();
    assert.equal(await brightness, true, next.type);
    assert.equal(await change, true, next.type);
    assert.equal(h.writes.length, count + 1, next.type);
    assert.equal(h.controller.store.getState().error, null, next.type);
    await h.controller.dispose();
  }
});

test("rename waits for brightness and preserves the last queued slider value", async () => {
  const h = harness(true, true, true, true);
  await h.controller.connect(device);
  h.ack(false);
  const brightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 30,
  });
  const rename = h.controller.rename("Bedroom Ticker");
  const finalBrightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 80,
  });
  assert.deepEqual(h.nameWrites, []);
  h.ack(true);
  h.confirmLastWrite();
  assert.equal(await brightness, true);
  assert.equal(await rename, true);
  assert.equal(await finalBrightness, true);
  assert.deepEqual(h.nameWrites, ["Bedroom Ticker"]);
  assert.equal(h.controller.store.getState().settings?.brightness, 80);
  assert.equal(h.controller.store.getState().error, null);
  await h.controller.dispose();
});

test("date and broadcast settings require matching confirmations and preserve values on failure", async () => {
  const h = harness(true, true, true, true, true);
  await h.controller.connect(device);
  assert.equal(
    await h.controller.command({ type: "set_date_format", value: "mmm d" }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.dateFormat, "mmm d");
  assert.equal(
    await h.controller.command({ type: "set_show_broadcast", value: false }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.showBroadcast, false);
  h.ack(false);
  for (const next of [
    { type: "set_date_format", value: "yyyy-mm-dd" },
    { type: "set_show_broadcast", value: true },
  ] as const) {
    const change = h.controller.command(next);
    h.confirmLastWrite(); // Same opcode/ID, but the snapshot retains the previous value.
    assert.equal(await change, false);
    assert.match(h.controller.store.getState().error!, /did not confirm/);
  }
  assert.equal(h.controller.store.getState().settings?.dateFormat, "mmm d");
  assert.equal(h.controller.store.getState().settings?.showBroadcast, false);
  await h.controller.dispose();
  for (const authorized of [false, true]) {
    const old = harness(authorized, true, true, true, !authorized);
    await old.controller.connect(device);
    const writes = old.writes.length;
    for (const next of [
      { type: "set_date_format", value: "dd/mm" },
      { type: "set_show_broadcast", value: false },
    ] as const)
      assert.equal(await old.controller.command(next), false);
    assert.equal(old.writes.length, writes);
    await old.controller.dispose();
  }
});

test("brightness failure or disconnect cancels waiting actions", async () => {
  for (const disconnect of [false, true]) {
    const h = harness(true, true, true, true);
    await h.controller.connect(device);
    h.ack(false);
    const brightness = h.controller.command({
      type: "set_brightness",
      value: 30,
    });
    const display = h.controller.command({ type: "set_display", value: false });
    const rename = h.controller.rename("Bedroom Ticker");
    const count = h.writes.length;
    if (disconnect) await h.controller.disconnect();
    else {
      h.result(4);
      h.confirmLastWrite();
    }
    assert.equal(await brightness, false);
    assert.equal(await display, false);
    assert.equal(await rename, false);
    assert.equal(h.writes.length, count);
    assert.deepEqual(h.nameWrites, []);
    await h.controller.dispose();
  }
});

test("live settings wait for other commands and never cross a disconnect", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.ack(false);
  const status = h.controller.command({ type: "get_status" });
  const league = h.controller.updateSetting({
    type: "set_league",
    value: "nfl",
  });
  h.confirmLastWrite();
  await status;
  await tick();
  assert.equal(h.writes.at(-1)![4], 4);
  const queued = h.controller.updateSetting({
    type: "set_brightness",
    value: 10,
  });
  const count = h.writes.length;
  await h.controller.disconnect();
  assert.equal(await league, false);
  assert.equal(await queued, false);
  assert.equal(h.writes.length, count);
  h.ack(true);
  await h.controller.reconnect();
  assert.equal(h.controller.store.getState().settings?.brightness, 50);
  await h.controller.dispose();
});

test("failed live settings stop queued writes and preserve confirmed values", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.ack(false);
  const brightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 40,
  });
  const league = h.controller.updateSetting({
    type: "set_league",
    value: "cfb",
  });
  const count = h.writes.length;
  assert.equal(await brightness, false);
  assert.equal(await league, false);
  assert.equal(h.writes.length, count);
  assert.equal(h.controller.store.getState().settings?.brightness, 50);
  assert.equal(h.controller.store.getState().settings?.selectedLeague, "nba");
  assert.match(h.controller.store.getState().error!, /timed out/);
  await h.controller.dispose();
});
test("unsupported capability and invalid brightness never write to BLE", async () => {
  const h = harness();
  h.live[6] = 0;
  await h.controller.connect(device);
  const before = h.writes.length;
  assert.equal(await h.controller.command({ type: "refresh_scores" }), false);
  assert.equal(h.writes.length, before);
  await h.controller.disconnect();
  h.live[6] = 15;
  await h.controller.connect(device);
  assert.equal(
    await h.controller.command({ type: "set_brightness", value: 101 }),
    false,
  );
  assert.equal(h.controller.store.getState().settings?.brightness, 50);
  await h.controller.dispose();
});
test("command timeout retains confirmed settings and clears pending state", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.ack(false);
  assert.equal(
    await h.controller.command({ type: "set_brightness", value: 20 }),
    false,
  );
  assert.equal(h.controller.store.getState().settings?.brightness, 50);
  assert.deepEqual(h.controller.store.getState().pendingCommands, {});
  assert.match(h.controller.store.getState().error!, /timed out/);
  await h.controller.dispose();
});
test("concurrent command cannot clear the pending operation or duplicate connections", async () => {
  const h = harness();
  const first = h.controller.connect(device);
  assert.equal(await h.controller.connect(device), false);
  await first;
  assert.equal(h.connects(), 1);
  h.ack(false);
  const pending = h.controller.command({ type: "get_status" });
  assert.equal(await h.controller.command({ type: "get_settings" }), false);
  assert.equal(
    Object.keys(h.controller.store.getState().pendingCommands).length,
    1,
  );
  await h.controller.disconnect();
  assert.equal(await pending, false);
  await h.controller.dispose();
});
test("disconnect cleanup invalidates callbacks and rejects pending commands", async () => {
  const h = harness();
  await h.controller.connect(device);
  const oldLoss = h.oldLoss();
  h.ack(false);
  const pending = h.controller.command({ type: "refresh_scores" });
  await h.controller.disconnect();
  assert.equal(await pending, false);
  assert.equal(h.removed(), 2);
  assert.equal(h.controller.store.getState().status, null);
  h.ack(true);
  await h.controller.connect({ ...device, id: "second" });
  oldLoss();
  assert.equal(h.controller.store.getState().selectedDevice?.id, "second");
  assert.equal(h.controller.store.getState().connection, "connected");
  await h.controller.dispose();
});
test("Bluetooth off clears live data and authorization; reconnect rereads settings", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.change("PoweredOff");
  assert.equal(h.controller.store.getState().connection, "disconnected");
  assert.equal(h.controller.store.getState().settings, null);
  assert.equal(h.controller.store.getState().authorized, false);
  assert.match(h.controller.store.getState().error!, /Bluetooth is off/);
  h.live[7] = 73;
  await h.controller.reconnect();
  assert.equal(h.controller.store.getState().settings?.brightness, 73);
  await h.controller.dispose();
});
test("unsupported protocol fails verification and removes connection subscriptions", async () => {
  const h = harness();
  h.live[0] = 11;
  assert.equal(await h.controller.connect(device), false);
  assert.equal(h.controller.store.getState().connection, "error");
  assert.match(h.controller.store.getState().error!, /Unsupported firmware/);
  assert.ok(h.disconnected.includes(device.id));
  assert.equal(h.controller.store.getState().status, null);
  await h.controller.dispose();
});
test("permission denied and Bluetooth off have actionable messages", async () => {
  for (const state of ["Unauthorized", "PoweredOff", "Unsupported"] as const) {
    const h = harness();
    h.state(state);
    await h.controller.startScan();
    assert.equal(h.controller.store.getState().scanning, false);
    assert.equal(h.controller.store.getState().bluetooth, state);
    assert.match(
      h.controller.store.getState().error!,
      /Settings|physical device/,
    );
    await h.controller.dispose();
  }
});
test("scan deduplicates discoveries, stops and ignores stale callbacks", async () => {
  const h = harness();
  await h.controller.startScan();
  h.found(device);
  h.found({ ...device, rssi: -30 });
  assert.equal(h.controller.store.getState().devices.length, 1);
  await h.controller.stopScan();
  h.found({ ...device, id: "late" });
  assert.equal(h.controller.store.getState().devices.length, 1);
  await h.controller.startScan();
  h.scanError();
  assert.match(h.controller.store.getState().error!, /Scan failed/);
  await h.controller.dispose();
});
test("leaving discovery during permission request prevents late scanning", async () => {
  const h = harness();
  let ready: (state: TickerBluetoothState) => void = () => {};
  let scans = 0;
  h.transport.prepare = () =>
    new Promise((resolve) => {
      ready = resolve;
    });
  h.transport.scan = async () => {
    scans++;
  };
  const scan = h.controller.startScan();
  await tick();
  await h.controller.stopScan();
  ready("PoweredOn");
  await scan;
  assert.equal(scans, 0);
  await h.controller.dispose();
});
test("connection timeout cancels a hanging discovery and ignores late completion", async () => {
  const h = harness();
  let release: () => void = () => {};
  h.transport.discover = () =>
    new Promise<void>((resolve) => {
      release = resolve;
    });
  assert.equal(await h.controller.connect(device), false);
  assert.match(h.controller.store.getState().error!, /Connection timed out/);
  release();
  await tick();
  assert.equal(h.controller.store.getState().connection, "error");
  await h.controller.dispose();
});
test("spontaneous disconnect clears status and provides reconnect guidance", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.loss();
  assert.equal(h.controller.store.getState().status, null);
  assert.match(
    h.controller.store.getState().error!,
    /Move closer and reconnect/,
  );
  await h.controller.dispose();
});

test("a late native connection cannot cancel a newer connection to the same ticker", async () => {
  const h = harness();
  let release: () => void = () => {};
  let first = true;
  h.transport.connect = async () => {
    if (first) {
      first = false;
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    }
  };
  assert.equal(await h.controller.connect(device), false);
  assert.equal(await h.controller.connect(device), true);
  const cancellations = h.disconnected.length;
  release();
  await tick();
  assert.equal(h.disconnected.length, cancellations);
  assert.equal(h.controller.store.getState().connection, "connected");
  await h.controller.dispose();
});

test("read failures and missing GATT support disconnect with an actionable error", async () => {
  const h = harness();
  h.transport.discover = async () => {
    throw new Error("Unsupported device: Tempo GATT service is missing.");
  };
  assert.equal(await h.controller.connect(device), false);
  assert.match(h.controller.store.getState().error!, /Unsupported device/);
  assert.equal(h.controller.store.getState().authorized, false);
  await h.controller.dispose();
});

test("a wrong opcode ACK and a mismatched confirmed brightness cannot commit", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.ack(false);
  const operation = h.controller.command({ type: "set_brightness", value: 80 });
  const command = h.writes.at(-1)!;
  const response = statusFrame();
  response[1] = 2;
  response[2] = command[2];
  response[4] = 4;
  h.emit(response);
  await tick();
  assert.equal(
    Object.keys(h.controller.store.getState().pendingCommands).length,
    1,
  );
  response[4] = 3;
  h.emit(response);
  assert.equal(await operation, false);
  assert.equal(h.controller.store.getState().settings?.brightness, 50);
  assert.match(h.controller.store.getState().error!, /did not confirm/);
  await h.controller.dispose();
});

test("malformed notifications fail closed and clear authorization", async () => {
  const h = harness();
  await h.controller.connect(device);
  h.emit(new Uint8Array(200));
  assert.equal(h.controller.store.getState().connection, "error");
  assert.equal(h.controller.store.getState().authorized, false);
  assert.equal(h.controller.store.getState().settings, null);
  await h.controller.dispose();
});

test("production connection waits for explicit Unlock controls before authorization", async () => {
  const h = harness();
  let verifications = 0;
  const c = createTickerController(h.transport, {
    verify: async () => {
      verifications++;
      return true;
    },
  });
  assert.equal(await c.connect(device), true);
  assert.equal(c.store.getState().authorized, false);
  assert.equal(verifications, 0);
  assert.equal(await c.command({ type: "set_brightness", value: 75 }), false);
  assert.equal(await c.authorize(), true);
  assert.equal(c.store.getState().authorized, true);
  assert.equal(verifications, 1);
  assert.equal(await c.command({ type: "set_brightness", value: 75 }), true);
  await c.dispose();
});

test("failed or cancelled pairing stays locked and supports retry", async () => {
  const h = harness();
  let allow = false;
  const c = createTickerController(h.transport, {
    verify: async () => {
      if (!allow) throw new Error("Pairing cancelled");
      return true;
    },
  });
  await c.connect(device);
  assert.equal(await c.authorize(), false);
  assert.equal(c.store.getState().authorized, false);
  assert.equal(c.store.getState().authorizing, false);
  assert.match(c.store.getState().error!, /Pairing cancelled/);
  allow = true;
  assert.equal(await c.authorize(), true);
  await c.dispose();
});

test("pairing timeout and a late native result never unlock controls", async () => {
  const h = harness();
  let release: (verified: boolean) => void = () => {};
  const c = createTickerController(
    h.transport,
    {
      verify: () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    },
    undefined,
    { authorizationTimeoutMs: 10 },
  );
  await c.connect(device);
  assert.equal(await c.authorize(), false);
  assert.match(c.store.getState().error!, /Pairing timed out/);
  release(true);
  await tick();
  assert.equal(c.store.getState().authorized, false);
  await c.dispose();
});

test("disconnect during pairing invalidates verification for a new connection", async () => {
  const h = harness();
  let release: (verified: boolean) => void = () => {};
  const c = createTickerController(h.transport, {
    verify: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  await c.connect(device);
  const pairing = c.authorize();
  assert.equal(c.store.getState().authorizing, true);
  assert.equal(await c.command({ type: "get_status" }), false);
  await c.disconnect();
  await c.connect({ ...device, id: "other" });
  release(true);
  assert.equal(await pairing, false);
  assert.equal(c.store.getState().authorized, false);
  assert.equal(c.store.getState().authorizing, false);
  await c.dispose();
});

test("pairing deadline also covers the post-pairing status read", async () => {
  const h = harness();
  const c = createTickerController(
    h.transport,
    { verify: async () => true },
    undefined,
    { authorizationTimeoutMs: 10 },
  );
  await c.connect(device);
  h.transport.readStatus = () => new Promise(() => {});
  assert.equal(await c.authorize(), false);
  assert.equal(c.store.getState().authorized, false);
  assert.equal(c.store.getState().authorizing, false);
  await c.dispose();
});

test("rank labels, duration and Top 25 filter commit only after firmware ACK", async () => {
  const h = harness(true, true);
  await h.controller.connect(device);
  assert.equal(
    await h.controller.command({ type: "set_show_rankings", value: false }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.showRankings, false);
  assert.equal(
    await h.controller.command({ type: "set_duration", value: 30 }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.durationSeconds, 30);
  assert.equal(h.writes.at(-1)![0], 2);
  assert.equal(
    await h.controller.command({ type: "set_top25_only", value: true }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.top25Only, true);
  h.result(4);
  assert.equal(
    await h.controller.command({ type: "set_duration", value: 60 }),
    false,
  );
  assert.equal(h.controller.store.getState().settings?.durationSeconds, 30);
  await h.controller.dispose();
});
test("legacy firmware and unauthorized sessions cannot receive new setting writes", async () => {
  for (const [authorized, extended] of [
    [true, false],
    [false, true],
  ]) {
    const h = harness(authorized, extended);
    await h.controller.connect(device);
    const count = h.writes.length;
    assert.equal(
      await h.controller.command({ type: "set_top25_only", value: true }),
      false,
    );
    assert.equal(
      await h.controller.command({ type: "set_duration", value: 10 }),
      false,
    );
    assert.equal(h.writes.length, count);
    await h.controller.dispose();
  }
});
test("wrong confirmed duration does not commit a locally requested value", async () => {
  const h = harness(true, true);
  await h.controller.connect(device);
  h.ack(false);
  const command = h.controller.command({ type: "set_duration", value: 20 });
  assert.equal(h.controller.store.getState().settings?.durationSeconds, 6);
  const request = h.writes.at(-1)!;
  const ack = h.live.slice();
  ack[1] = 2;
  ack[2] = request[2];
  ack[3] = request[3];
  ack[4] = 8; // Still 6 seconds.
  h.emit(ack);
  assert.equal(await command, false);
  assert.equal(h.controller.store.getState().settings?.durationSeconds, 6);
  await h.controller.dispose();
});

test("new leagues require firmware 0.4 and confirm all four selections through ACKs", async () => {
  const old = harness(true, true);
  await old.controller.connect(device);
  const previousWrites = old.writes.length;
  assert.equal(
    await old.controller.command({ type: "set_league", value: "mlb" }),
    false,
  );
  assert.equal(old.writes.length, previousWrites);
  assert.match(old.controller.store.getState().error!, /0.4.0/);
  await old.controller.dispose();
  const current = harness(true, true);
  current.live[12] = 4;
  await current.controller.connect(device);
  for (const value of ["mlb", "mcbb", "wnba", "wcbb"] as const) {
    assert.equal(
      await current.controller.updateSetting({ type: "set_league", value }),
      true,
    );
    assert.equal(
      current.controller.store.getState().settings?.selectedLeague,
      value,
    );
  }
  await current.controller.dispose();
});

test("team schedule and CFP views require authorization and commit only confirmed settings", async () => {
  const locked = harness(false, true, true);
  await locked.controller.connect(device);
  const writes = locked.writes.length;
  assert.equal(
    await locked.controller.command({
      type: "set_team_schedule",
      value: 129689,
    }),
    false,
  );
  assert.equal(locked.writes.length, writes);
  await locked.controller.dispose();
  const h = harness(true, true, true);
  await h.controller.connect(device);
  assert.equal(
    await h.controller.command({ type: "set_team_schedule", value: 129689 }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.teamId, 129689);
  assert.equal(h.controller.store.getState().settings?.viewMode, "schedule");
  assert.equal(
    await h.controller.command({ type: "set_league", value: "cfb" }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.viewMode, "scores");
  assert.equal(h.controller.store.getState().settings?.teamId, null);
  assert.equal(
    await h.controller.command({ type: "set_view", value: "cfp" }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.viewMode, "cfp");
  await h.controller.dispose();
});

test("rename uses the canonical device name on connect and commits only confirmed durable names", async () => {
  const h = harness(true, true, true, true);
  await h.controller.connect(device);
  assert.equal(
    h.controller.store.getState().selectedDevice?.name,
    "Living Room Ticker",
  );
  assert.equal(await h.controller.rename("  Bedroom Ticker  "), true);
  assert.deepEqual(h.nameWrites, ["Bedroom Ticker"]);
  assert.equal(
    h.controller.store.getState().selectedDevice?.name,
    "Bedroom Ticker",
  );
  assert.equal(
    h.controller.store.getState().lastDevice?.name,
    "Bedroom Ticker",
  );
  await h.controller.disconnect();
  await h.controller.connect(device); // Advertisement can be cached with its old name.
  assert.equal(
    h.controller.store.getState().selectedDevice?.name,
    "Bedroom Ticker",
  );
  await h.controller.dispose();
});

test("rename rejects locked, unsupported, and invalid requests before native writes", async () => {
  for (const authorized of [false, true]) {
    const h = harness(authorized, true, true, !authorized);
    await h.controller.connect(device);
    assert.equal(await h.controller.rename("Bedroom"), false);
    assert.deepEqual(h.nameWrites, []);
    await h.controller.dispose();
  }
  const h = harness(true, true, true, true);
  await h.controller.connect(device);
  assert.equal(await h.controller.rename(""), false);
  assert.deepEqual(h.nameWrites, []);
  await h.controller.dispose();
});

test("rename mismatch or native failure cannot replace the confirmed name", async () => {
  const h = harness(true, true, true, true);
  await h.controller.connect(device);
  h.transport.writeName = async () => {};
  assert.equal(await h.controller.rename("Bedroom"), false);
  assert.equal(
    h.controller.store.getState().lastDevice?.name,
    "Living Room Ticker",
  );
  h.transport.writeName = async () => {
    throw new Error("Write denied");
  };
  assert.equal(await h.controller.rename("Bedroom"), false);
  assert.equal(
    h.controller.store.getState().selectedDevice?.name,
    "Living Room Ticker",
  );
  assert.equal(h.controller.store.getState().renaming, false);
  await h.controller.dispose();
});

test("rename serializes mutations and ignores completion after disconnect", async () => {
  const h = harness(true, true, true, true);
  await h.controller.connect(device);
  let finish!: () => void;
  h.transport.writeName = () =>
    new Promise<void>((resolve) => {
      finish = resolve;
    });
  const save = h.controller.rename("Bedroom");
  assert.equal(h.controller.store.getState().renaming, true);
  assert.equal(await h.controller.command({ type: "refresh_scores" }), false);
  assert.equal(
    await h.controller.updateSetting({ type: "set_brightness", value: 70 }),
    false,
  );
  assert.equal(await h.controller.rename("Other"), false);
  h.loss();
  finish();
  assert.equal(await save, false);
  assert.equal(
    h.controller.store.getState().lastDevice?.name,
    "Living Room Ticker",
  );
  assert.equal(h.controller.store.getState().renaming, false);
  await h.controller.dispose();
});

test("unconfirmed rename timeout disconnects and cannot publish a late result", async () => {
  const h = harness(true, true, true, true);
  await h.controller.connect(device);
  let finish!: () => void;
  h.transport.writeName = () =>
    new Promise<void>((resolve) => {
      finish = resolve;
    });
  assert.equal(await h.controller.rename("Bedroom"), false);
  assert.equal(h.controller.store.getState().connection, "error");
  assert.equal(h.controller.store.getState().renaming, false);
  finish();
  await tick();
  assert.equal(
    h.controller.store.getState().lastDevice?.name,
    "Living Room Ticker",
  );
  await h.controller.dispose();
});

test("a cached service table missing the optional name keeps ordinary controls connected", async () => {
  const h = harness(true, true, true, true);
  h.transport.readName = async () => {
    throw new TickerNameUnavailableError();
  };
  assert.equal(await h.controller.connect(device), true);
  assert.equal(h.controller.store.getState().connection, "connected");
  assert.equal(h.controller.store.getState().nameAvailable, false);
  assert.match(h.controller.store.getState().nameIssue!, /Forget this ticker/);
  assert.equal(
    await h.controller.command({ type: "set_brightness", value: 70 }),
    true,
  );
  assert.equal(h.controller.store.getState().nameAvailable, false); // ACK must not re-enable rename.
  assert.equal(await h.controller.rename("Bedroom"), false);
  assert.deepEqual(h.nameWrites, []);
  await h.controller.disconnect();
  h.transport.readName = async () => "Living Room Ticker";
  assert.equal(await h.controller.connect(device), true);
  assert.equal(h.controller.store.getState().nameAvailable, true);
  assert.equal(h.controller.store.getState().nameIssue, null);
  assert.equal(await h.controller.rename("Bedroom"), false); // Fake readback intentionally unchanged.
  await h.controller.dispose();
});

test("unrelated name read errors are not mistaken for a cached optional characteristic", async () => {
  const h = harness(true, true, true, true);
  h.transport.readName = async () => {
    throw new Error("Read failed");
  };
  assert.equal(await h.controller.connect(device), false);
  assert.equal(h.controller.store.getState().connection, "error");
  assert.equal(h.controller.store.getState().nameAvailable, false);
  assert.match(h.controller.store.getState().error!, /Read failed/);
  await h.controller.dispose();
});

test("favorites sync reserves the connection and atomically activates all 50 saved teams", async () => {
  const h = harness(true, true, true, true, true, true);
  await h.controller.connect(device);
  const teams: TickerFavoriteTeam[] = Array.from({ length: 50 }, (_, i) => ({
    league: i % 2 ? "nfl" : "nba",
    teamId: i + 1,
  }));
  const before = h.writes.length;
  const sync = h.controller.showFavorites(teams);
  assert.equal(h.controller.store.getState().syncingFavorites, true);
  assert.equal(h.controller.store.getState().settings?.viewMode, "scores");
  assert.equal(await h.controller.rename("Other"), false);
  assert.equal(await sync, true);
  assert.equal(h.writes.length - before, 19);
  assert.equal(h.writes[before][4], 14);
  assert.equal(h.writes.at(-1)![4], 16);
  assert.equal(
    h.controller.store.getState().settings?.favoritesSignature,
    favoriteTeamsSignature(teams),
  );
  assert.equal(h.controller.store.getState().settings?.viewMode, "favorites");
  assert.equal(h.controller.store.getState().syncingFavorites, false);
  assert.equal(
    await h.controller.command({ type: "set_view", value: "scores" }),
    true,
  );
  assert.equal(
    h.controller.store.getState().settings?.favoritesSignature,
    null,
  );
  await h.controller.dispose();
});

test("failed or interrupted favorites sync never commits or leaks into a reconnect", async () => {
  const teams: TickerFavoriteTeam[] = [
    { league: "nba", teamId: 1 },
    { league: "nfl", teamId: 1 },
  ];
  for (const disconnect of [true, false]) {
    const h = harness(true, true, true, true, true, true);
    await h.controller.connect(device);
    h.ack(false);
    const before = h.writes.length;
    const sync = h.controller.showFavorites(teams);
    h.confirmLastWrite();
    await tick();
    assert.equal(h.writes.at(-1)![4], 15);
    if (disconnect) await h.controller.disconnect();
    else {
      h.result(4);
      h.confirmLastWrite();
    }
    assert.equal(await sync, false);
    assert.equal(h.writes.length - before, 2);
    assert.equal(h.controller.store.getState().syncingFavorites, false);
    h.ack(true);
    h.result(0);
    if (disconnect) await h.controller.reconnect();
    assert.equal(h.controller.store.getState().settings?.viewMode, "scores");
    await h.controller.dispose();
  }
  const old = harness(true, true, true, true, true);
  await old.controller.connect(device);
  const writes = old.writes.length;
  assert.equal(await old.controller.showFavorites(teams), false);
  assert.equal(old.writes.length, writes);
  await old.controller.dispose();
});

test("favorites selection queues behind live brightness", async () => {
  const h = harness(true, true, true, true, true, true);
  await h.controller.connect(device);
  h.ack(false);
  const brightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 30,
  });
  const teams: TickerFavoriteTeam[] = [{ league: "nba", teamId: 1 }];
  const sync = h.controller.showFavorites(teams);
  h.ack(true);
  h.confirmLastWrite();
  assert.equal(await brightness, true);
  assert.equal(await sync, true);
  assert.equal(h.controller.store.getState().settings?.viewMode, "favorites");
  await h.controller.dispose();
});

test("a favorites commit ACK must confirm the actual list signature", async () => {
  const h = harness(true, true, true, true, true, true);
  await h.controller.connect(device);
  h.ack(false);
  const sync = h.controller.showFavorites([{ league: "nba", teamId: 1 }]);
  h.confirmLastWrite();
  await tick();
  h.confirmLastWrite();
  await tick();
  assert.equal(h.writes.at(-1)![4], 16);
  h.confirmLastWrite(); // ACK claims success, but still reports the original view.
  assert.equal(await sync, false);
  assert.equal(h.controller.store.getState().settings?.viewMode, "scores");
  assert.equal(
    h.controller.store.getState().settings?.favoritesSignature,
    null,
  );
  assert.equal(h.controller.store.getState().syncingFavorites, false);
  await h.controller.dispose();
});

test("header changes require confirmed snapshots and preserve the last header on mismatch", async () => {
  const h = harness(true, true, true, true, true, true, true);
  await h.controller.connect(device);
  for (const value of ["device_name", "hidden", "tempo"] as const) {
    assert.equal(
      await h.controller.command({ type: "set_header", value }),
      true,
    );
    assert.equal(h.controller.store.getState().settings?.headerMode, value);
  }
  h.ack(false);
  const save = h.controller.command({ type: "set_header", value: "hidden" });
  h.confirmLastWrite();
  assert.equal(await save, false);
  assert.equal(h.controller.store.getState().settings?.headerMode, "tempo");
  await h.controller.dispose();
});

test("header color requires confirmation and preserves power, mode and prior color on failure", async () => {
  const h = harness(true, true, true, true, true, true, true, true);
  await h.controller.connect(device);
  assert.equal(
    await h.controller.command({ type: "set_header", value: "device_name" }),
    true,
  );
  assert.equal(
    await h.controller.command({ type: "set_header_color", value: "purple" }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.headerColor, "purple");
  assert.equal(h.controller.store.getState().settings?.displayOn, true);
  assert.equal(
    await h.controller.command({ type: "set_display", value: false }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.headerColor, "purple");
  assert.equal(
    h.controller.store.getState().settings?.headerMode,
    "device_name",
  );
  h.ack(false);
  const save = h.controller.command({ type: "set_header_color", value: "red" });
  h.confirmLastWrite();
  assert.equal(await save, false);
  assert.equal(h.controller.store.getState().settings?.headerColor, "purple");
  await h.controller.dispose();
});

test("custom header saves and activates independently of the Bluetooth name", async () => {
  const h = harness(true, true, true, true, true, true, true, true, true);
  await h.controller.connect(device);
  assert.equal(h.controller.store.getState().customHeader, "");
  assert.equal(h.controller.store.getState().customHeaderAvailable, true);
  assert.equal(await h.controller.setCustomHeader("  Game Room  "), true);
  assert.deepEqual(h.customHeaderWrites, ["Game Room"]);
  assert.equal(h.controller.store.getState().customHeader, "Game Room");
  assert.equal(h.controller.store.getState().settings?.headerMode, "custom");
  assert.equal(
    h.controller.store.getState().selectedDevice?.name,
    "Living Room Ticker",
  );
  assert.equal(h.controller.store.getState().savingCustomHeader, false);
  h.controller.store.setState({ error: "An earlier error" });
  assert.equal(await h.controller.setCustomHeader("Game Room"), true);
  assert.equal(h.controller.store.getState().error, null);
  assert.equal(h.customHeaderWrites.length, 1);
  await h.controller.disconnect();
  await h.controller.reconnect();
  assert.equal(h.controller.store.getState().customHeader, "Game Room");
  assert.equal(h.controller.store.getState().settings?.headerMode, "custom");
  await h.controller.dispose();
});

test("custom header rejects invalid, locked and older-firmware writes", async () => {
  for (const [authorized, modern] of [
    [false, true],
    [true, false],
  ]) {
    const h = harness(
      authorized,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      modern,
    );
    await h.controller.connect(device);
    assert.equal(await h.controller.setCustomHeader("Game Room"), false);
    assert.deepEqual(h.customHeaderWrites, []);
    await h.controller.dispose();
  }
  const h = harness(true, true, true, true, true, true, true, true, true);
  await h.controller.connect(device);
  for (const text of ["", " ", "🏆", "123456789012345678901"])
    assert.equal(await h.controller.setCustomHeader(text), false);
  assert.deepEqual(h.customHeaderWrites, []);
  await h.controller.dispose();
});

test("emoji headers require supported firmware and preserve the device name", async () => {
  const h = harness(true, true, true, true, true, true, true, true, true, true);
  await h.controller.connect(device);
  assert.equal(await h.controller.setCustomHeader("GO 🏆"), false);
  assert.match(h.controller.store.getState().error!, /0.13.0/);
  assert.deepEqual(h.customHeaderWrites, []);
  assert.equal(await h.controller.setCustomHeader("Game Room"), true);
  await h.controller.disconnect();
  h.live[12] = 13;
  await h.controller.connect(device);
  assert.equal(await h.controller.setCustomHeader("🏆 GAME ROOM 🔥"), true);
  assert.equal(h.controller.store.getState().customHeader, "🏆 GAME ROOM 🔥");
  assert.equal(h.controller.store.getState().settings?.headerMode, "custom");
  assert.deepEqual(h.nameWrites, []);
  assert.equal(await h.controller.setCustomHeader("GO ❤"), true);
  assert.equal(h.controller.store.getState().customHeader, "GO ❤️");
  await h.controller.disconnect();
  await h.controller.connect(device);
  assert.equal(h.controller.store.getState().customHeader, "GO ❤️");
  await h.controller.dispose();
});

test("custom header readback mismatch or failed persistence preserves confirmed text and mode", async () => {
  const h = harness(true, true, true, true, true, true, true, true, true);
  await h.controller.connect(device);
  assert.equal(await h.controller.setCustomHeader("First"), true);
  h.transport.writeCustomHeader = async () => {};
  assert.equal(await h.controller.setCustomHeader("Unconfirmed"), false);
  assert.equal(h.controller.store.getState().customHeader, "First");
  assert.equal(h.controller.store.getState().settings?.headerMode, "custom");
  h.transport.writeCustomHeader = async () => {
    throw new Error("Save failed");
  };
  assert.equal(await h.controller.setCustomHeader("Failure"), false);
  assert.equal(h.controller.store.getState().customHeader, "First");
  await h.controller.dispose();
});

test("custom header operation reserves the connection and ignores late work after disconnect", async () => {
  const h = harness(true, true, true, true, true, true, true, true, true);
  await h.controller.connect(device);
  let finish!: () => void;
  h.transport.writeCustomHeader = () =>
    new Promise<void>((resolve) => {
      finish = resolve;
    });
  const save = h.controller.setCustomHeader("Game Room");
  assert.equal(h.controller.store.getState().savingCustomHeader, true);
  assert.equal(await h.controller.rename("Other device"), false);
  assert.equal(await h.controller.command({ type: "refresh_scores" }), false);
  const writes = h.writes.length;
  await h.controller.disconnect();
  finish();
  assert.equal(await save, false);
  assert.equal(h.writes.length, writes);
  assert.equal(h.controller.store.getState().customHeader, null);
  assert.equal(h.controller.store.getState().savingCustomHeader, false);
  await h.controller.dispose();
});

test("custom header timeout clears the connection and cannot publish a late save", async () => {
  const h = harness(true, true, true, true, true, true, true, true, true);
  await h.controller.connect(device);
  let finish!: () => void;
  h.transport.writeCustomHeader = () =>
    new Promise<void>((resolve) => {
      finish = resolve;
    });
  assert.equal(await h.controller.setCustomHeader("Game Room"), false);
  assert.equal(h.controller.store.getState().connection, "error");
  finish();
  await tick();
  assert.equal(h.controller.store.getState().customHeader, null);
  assert.equal(h.controller.store.getState().savingCustomHeader, false);
  await h.controller.dispose();
});

test("missing cached custom-header characteristic keeps ordinary controls working", async () => {
  const h = harness(true, true, true, true, true, true, true, true, true);
  h.transport.readCustomHeader = async () => {
    throw new TickerCustomHeaderUnavailableError();
  };
  assert.equal(await h.controller.connect(device), true);
  assert.equal(h.controller.store.getState().customHeaderAvailable, false);
  assert.match(h.controller.store.getState().customHeaderIssue!, /Forget/);
  assert.equal(
    await h.controller.command({ type: "set_header_color", value: "blue" }),
    true,
  );
  assert.equal(h.controller.store.getState().customHeaderAvailable, false);
  assert.equal(await h.controller.setCustomHeader("Game Room"), false);
  await h.controller.dispose();
});

test("custom header queues behind live brightness", async () => {
  const h = harness(true, true, true, true, true, true, true, true, true);
  await h.controller.connect(device);
  h.ack(false);
  const brightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 30,
  });
  const save = h.controller.setCustomHeader("Game Room");
  assert.deepEqual(h.customHeaderWrites, []);
  h.ack(true);
  h.confirmLastWrite();
  assert.equal(await brightness, true);
  assert.equal(await save, true);
  assert.equal(h.controller.store.getState().settings?.headerMode, "custom");
  await h.controller.dispose();
});

const rotationEntries: TickerRotationEntry[] = [
  { league: "nba", view: "scores", teamId: null, seconds: 6 },
  { league: "cfb", view: "schedule", teamId: 129689, seconds: 8 },
  { league: "wcbb", view: "ap", teamId: null, seconds: 3 },
];
const rotationHarness = () =>
  harness(true, true, true, true, true, true, true, true, true, true);

test("custom rotation commits bounded chunks, confirms signature, and restores metadata on reconnect", async () => {
  const h = rotationHarness();
  assert.equal(await h.controller.connect(device), true);
  assert.deepEqual(h.controller.store.getState().rotationEntries, []);
  h.writes.length = 0;
  assert.equal(await h.controller.saveRotation(rotationEntries), true);
  assert.deepEqual(
    h.writes.map((frame) => frame[4]),
    [19, 20, 20, 21],
  );
  assert.equal(h.controller.store.getState().settings?.viewMode, "rotation");
  assert.equal(
    h.controller.store.getState().settings?.rotationSignature,
    4834019,
  );
  assert.deepEqual(
    h.controller.store.getState().rotationEntries,
    rotationEntries,
  );
  await h.controller.disconnect();
  assert.equal(h.controller.store.getState().rotationEntries, null);
  await h.controller.connect(device);
  assert.deepEqual(
    h.controller.store.getState().rotationEntries,
    rotationEntries,
  );
  assert.equal(h.controller.store.getState().settings?.viewMode, "rotation");
  await h.controller.command({ type: "set_view", value: "scores" });
  assert.equal(h.controller.store.getState().settings?.rotationSignature, null);
  assert.deepEqual(
    h.controller.store.getState().rotationEntries,
    rotationEntries,
  );
  await h.controller.dispose();
});
test("rotation transfer snapshots input and reserves the whole command sequence", async () => {
  const h = rotationHarness();
  await h.controller.connect(device);
  h.ack(false);
  const entries = rotationEntries.map((entry) => ({ ...entry }));
  const saving = h.controller.saveRotation(entries);
  entries[0].seconds = 60;
  assert.equal(h.controller.store.getState().savingRotation, true);
  assert.equal(await h.controller.rename("Office"), false);
  assert.equal(
    await h.controller.command({ type: "set_display", value: false }),
    false,
  );
  h.ack(true);
  h.confirmLastWrite();
  assert.equal(await saving, true);
  assert.equal(h.controller.store.getState().rotationEntries?.[0].seconds, 6);
  assert.equal(h.controller.store.getState().savingRotation, false);
  await h.controller.dispose();
});
test("failed or interrupted rotation transfers preserve the saved list and stop before commit", async () => {
  const h = rotationHarness();
  await h.controller.connect(device);
  await h.controller.saveRotation(rotationEntries);
  const original = h.controller.store.getState().rotationEntries;
  h.writes.length = 0;
  const write = h.transport.write;
  h.transport.write = async (id, frame) => {
    if (frame[4] === 20) h.result(4);
    await write(id, frame);
  };
  assert.equal(
    await h.controller.saveRotation(rotationEntries.slice(1)),
    false,
  );
  assert.deepEqual(
    h.writes.map((frame) => frame[4]),
    [19, 20],
  );
  assert.equal(h.controller.store.getState().rotationEntries, original);
  assert.equal(h.controller.store.getState().savingRotation, false);
  h.result(0);
  h.transport.write = write;
  h.ack(false);
  const pending = h.controller.saveRotation(rotationEntries);
  h.loss();
  assert.equal(await pending, false);
  assert.equal(h.controller.store.getState().rotationEntries, null);
  await h.controller.dispose();
});
test("rotation waits behind brightness and disconnect cancels waiting intent", async () => {
  const h = rotationHarness();
  await h.controller.connect(device);
  h.writes.length = 0;
  h.ack(false);
  const brightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 65,
  });
  const saving = h.controller.saveRotation(rotationEntries);
  assert.deepEqual(
    h.writes.map((frame) => frame[4]),
    [3],
  );
  h.ack(true);
  h.confirmLastWrite();
  assert.equal(await brightness, true);
  assert.equal(await saving, true);
  assert.deepEqual(
    h.writes.map((frame) => frame[4]),
    [3, 19, 20, 20, 21],
  );
  h.ack(false);
  const secondBrightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 70,
  });
  const cancelled = h.controller.saveRotation(rotationEntries);
  h.loss();
  assert.equal(await secondBrightness, false);
  assert.equal(await cancelled, false);
  await h.controller.dispose();
});
test("rotation handles cached GATT and old firmware without disabling other controls", async () => {
  const h = rotationHarness();
  h.transport.readRotation = async () => {
    throw new TickerRotationUnavailableError();
  };
  assert.equal(await h.controller.connect(device), true);
  assert.equal(h.controller.store.getState().rotationAvailable, false);
  assert.match(
    h.controller.store.getState().rotationIssue!,
    /forget this ticker/,
  );
  assert.equal(await h.controller.saveRotation(rotationEntries), false);
  assert.equal(
    await h.controller.command({ type: "set_brightness", value: 55 }),
    true,
  );
  await h.controller.dispose();
  const old = harness(true, true, true, true, true, true, true, true, true);
  await old.controller.connect(device);
  assert.equal(await old.controller.saveRotation(rotationEntries), false);
  assert.match(old.controller.store.getState().error!, /0.12.0/);
  await old.controller.dispose();
});
test("rotation rejects mismatched commit acknowledgments and times out incomplete transfers", async () => {
  const h = rotationHarness();
  await h.controller.connect(device);
  const write = h.transport.write;
  h.transport.write = async (id, frame) => {
    if (frame[4] !== 21) return write(id, frame);
    const response = h.live.slice();
    response[1] = 2;
    response.set(frame.slice(2, 5), 2);
    response[5] = 0;
    h.emit(response);
  };
  assert.equal(await h.controller.saveRotation(rotationEntries), false);
  assert.deepEqual(h.controller.store.getState().rotationEntries, []);
  assert.match(h.controller.store.getState().error!, /did not confirm/);
  h.transport.write = async () => new Promise(() => {});
  assert.equal(await h.controller.saveRotation(rotationEntries), false);
  assert.equal(h.controller.store.getState().savingRotation, false);
  await h.controller.dispose();
});

const smartPriorityHarness = (authorized = true) =>
  harness(
    authorized,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  );
test("smart priority requires matching device confirmation and preserves other settings", async () => {
  const h = smartPriorityHarness();
  assert.equal(await h.controller.connect(device), true);
  assert.equal(
    h.controller.store.getState().settings?.smartGamePriority,
    false,
  );
  assert.equal(
    await h.controller.command({ type: "set_smart_priority", value: true }),
    true,
  );
  assert.equal(h.controller.store.getState().settings?.smartGamePriority, true);
  await h.controller.command({ type: "set_header", value: "hidden" });
  await h.controller.command({ type: "set_date_format", value: "dd/mm" });
  await h.controller.command({ type: "set_header_color", value: "purple" });
  assert.equal(h.controller.store.getState().settings?.smartGamePriority, true);
  h.ack(false);
  const mismatch = h.controller.command({
    type: "set_smart_priority",
    value: false,
  });
  h.confirmLastWrite();
  assert.equal(await mismatch, false);
  assert.equal(h.controller.store.getState().settings?.smartGamePriority, true);
  assert.match(h.controller.store.getState().error!, /did not confirm/);
  h.ack(true);
  h.result(4);
  assert.equal(
    await h.controller.command({ type: "set_smart_priority", value: false }),
    false,
  );
  assert.equal(h.controller.store.getState().settings?.smartGamePriority, true);
  await h.controller.dispose();
});
test("smart priority stays locked without authorization and is gated on old firmware", async () => {
  const h = smartPriorityHarness(false);
  await h.controller.connect(device);
  h.writes.length = 0;
  assert.equal(
    await h.controller.command({ type: "set_smart_priority", value: true }),
    false,
  );
  assert.equal(h.writes.length, 0);
  assert.equal(
    h.controller.store.getState().settings?.smartGamePriority,
    false,
  );
  await h.controller.dispose();
  const old = rotationHarness();
  await old.controller.connect(device);
  old.writes.length = 0;
  assert.equal(
    await old.controller.command({ type: "set_smart_priority", value: true }),
    false,
  );
  assert.equal(old.writes.length, 0);
  assert.equal(
    old.controller.store.getState().settings?.smartGamePriority,
    null,
  );
  await old.controller.dispose();
});
test("smart priority queues behind live brightness and cancels on brightness failure", async () => {
  const h = smartPriorityHarness();
  await h.controller.connect(device);
  h.writes.length = 0;
  h.ack(false);
  const brightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 65,
  });
  const priority = h.controller.command({
    type: "set_smart_priority",
    value: true,
  });
  assert.deepEqual(
    h.writes.map((frame) => frame[4]),
    [3],
  );
  h.ack(true);
  h.confirmLastWrite();
  assert.equal(await brightness, true);
  assert.equal(await priority, true);
  assert.deepEqual(
    h.writes.map((frame) => frame[4]),
    [3, 22],
  );
  assert.equal(h.controller.store.getState().settings?.smartGamePriority, true);
  h.writes.length = 0;
  h.ack(false);
  const failedBrightness = h.controller.updateSetting({
    type: "set_brightness",
    value: 70,
  });
  const cancelled = h.controller.command({
    type: "set_smart_priority",
    value: false,
  });
  h.result(4);
  h.confirmLastWrite();
  assert.equal(await failedBrightness, false);
  assert.equal(await cancelled, false);
  assert.deepEqual(
    h.writes.map((frame) => frame[4]),
    [3],
  );
  assert.equal(h.controller.store.getState().settings?.smartGamePriority, true);
  await h.controller.dispose();
});
