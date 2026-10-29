import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeFrame,
  encodeCommand,
  FRAME_BYTES,
  isCompatibleAdvertisement,
  LEAGUES,
  TICKER_GATT,
} from "../services/ticker/protocol";

export function statusFrame() {
  const bytes = new Uint8Array(20);
  bytes.set([1, 3, 0, 0, 0, 0, 15, 50, 1, 1, 2, 1, 2, 3]);
  return bytes;
}
test("discovery requires service UUID; unique names need no special case", () => {
  assert.equal(
    isCompatibleAdvertisement([TICKER_GATT.service.toUpperCase()]),
    true,
  );
  assert.equal(isCompatibleAdvertisement(null), false);
  assert.equal(isCompatibleAdvertisement(["Tempo-Ticker"]), false);
  assert.equal(
    isCompatibleAdvertisement(["0000180a-0000-1000-8000-00805f9b34fb"]),
    false,
  );
});
test("commands fit minimum MTU with stable opcodes and little endian request IDs", () => {
  const frame = encodeCommand(513, { type: "set_brightness", value: 100 });
  assert.equal(frame.length, FRAME_BYTES);
  assert.deepEqual(Array.from(frame.slice(0, 6)), [1, 1, 1, 2, 3, 100]);
  assert.ok(frame.slice(6).every((value) => value === 0));
  for (const value of [0, 100])
    assert.equal(encodeCommand(1, { type: "set_brightness", value })[5], value);
});
test("brightness and request identifiers are strictly validated", () => {
  for (const value of [-1, 101, 1.5, NaN, Infinity])
    assert.throws(() => encodeCommand(1, { type: "set_brightness", value }));
  for (const id of [0, -1, 65536, 1.5])
    assert.throws(() => encodeCommand(id, { type: "get_status" }));
});
test("single-league encoding matches NBA/NFL/CFB identifiers", () => {
  LEAGUES.forEach((value, index) =>
    assert.equal(encodeCommand(1, { type: "set_league", value })[5], index + 1),
  );
  assert.throws(() =>
    encodeCommand(1, { type: "set_league", value: "mlb" as never }),
  );
});
test("status decodes capabilities, settings, firmware and optional unknown values", () => {
  const frame = statusFrame();
  const decoded = decodeFrame(frame);
  assert.equal(decoded.kind, "status");
  if (decoded.kind !== "status") return;
  assert.deepEqual(decoded.status.settings, {
    brightness: 50,
    selectedLeague: "nba",
    displayOn: true,
    showRankings: null,
    durationSeconds: null,
    top25Only: null,
  });
  assert.equal(decoded.status.firmwareVersion, "1.2.3");
  frame[7] = 255;
  frame[8] = frame[9] = frame[10] = 0;
  frame.fill(255, 11, 14);
  const unknown = decodeFrame(frame);
  if (unknown.kind === "status") {
    assert.equal(unknown.status.firmwareVersion, null);
    assert.equal(unknown.status.settings.brightness, null);
    assert.equal(unknown.status.settings.displayOn, null);
    assert.equal(unknown.status.wifi, "unknown");
  }
});
test("unsupported version, lengths, malformed fields and reserved bits are rejected", () => {
  assert.throws(() => decodeFrame(new Uint8Array(21)), /Unsupported/);
  for (const [index, value] of [
    [0, 3],
    [1, 5],
    [6, 16],
    [7, 101],
    [8, 4],
    [9, 3],
    [10, 3],
    [11, 255],
    [14, 1],
    [2, 1],
  ]) {
    const frame = statusFrame();
    frame[index] = value;
    assert.throws(() => decodeFrame(frame));
  }
});
test("acknowledgments retain request and command correlation", () => {
  const frame = statusFrame();
  frame[1] = 2;
  frame[2] = 24;
  frame[4] = 4;
  const decoded = decodeFrame(frame);
  if (decoded.kind !== "response") return assert.fail();
  assert.equal(decoded.response.id, 24);
  assert.equal(decoded.response.command, "set_league");
  frame[5] = 2;
  const rejected = decodeFrame(frame);
  if (rejected.kind === "response")
    assert.equal(rejected.response.result, "unauthorized");
  frame[4] = 99;
  assert.throws(() => decodeFrame(frame));
});

function extendedStatus() {
  return Uint8Array.from([
    2, 3, 0, 0, 0, 0, 127, 50, 3, 1, 2, 0, 3, 0, 2, 6, 1, 0, 0, 0,
  ]);
}
test("v2 reports ranking options/duration; v1 stays compatible without fabricated settings", () => {
  const modern = decodeFrame(extendedStatus());
  assert.equal(modern.kind, "status");
  if (modern.kind !== "status") return;
  assert.equal(modern.status.protocolVersion, 2);
  assert.equal(modern.status.settings.showRankings, true);
  assert.equal(modern.status.settings.durationSeconds, 6);
  assert.equal(modern.status.settings.top25Only, false);
  for (const type of [
    "set_show_rankings",
    "set_duration",
    "set_top25_only",
  ] as const)
    assert.ok(modern.status.capabilities.includes(type));
  const old = decodeFrame(statusFrame());
  if (old.kind === "status") {
    assert.equal(old.status.settings.showRankings, null);
    assert.equal(old.status.settings.durationSeconds, null);
    assert.equal(old.status.settings.top25Only, null);
    assert.equal(old.status.capabilities.includes("set_duration"), false);
  }
});
test("new commands use negotiated version, stable opcodes and bounded duration", () => {
  assert.deepEqual(
    Array.from(
      encodeCommand(7, { type: "set_show_rankings", value: true }, 2).slice(
        0,
        6,
      ),
    ),
    [2, 1, 7, 0, 7, 1],
  );
  assert.equal(
    encodeCommand(8, { type: "set_top25_only", value: false }, 2)[4],
    9,
  );
  for (const value of [3, 6, 60])
    assert.equal(
      encodeCommand(9, { type: "set_duration", value }, 2)[5],
      value,
    );
  for (const value of [0, 2, 61, 3.5, NaN])
    assert.throws(() => encodeCommand(9, { type: "set_duration", value }, 2));
  assert.throws(
    () => encodeCommand(9, { type: "set_duration", value: 6 }, 1),
    /0.3.0/,
  );
});
test("v2 rejects unknown capability bits, invalid option enums and reserved data", () => {
  for (const [byte, value] of [
    [6, 128],
    [14, 3],
    [15, 2],
    [15, 61],
    [16, 3],
    [17, 1],
  ]) {
    const bytes = extendedStatus();
    bytes[byte] = value;
    assert.throws(() => decodeFrame(bytes));
  }
  const response = extendedStatus();
  response[1] = 2;
  response[2] = 9;
  response[4] = 8;
  const parsed = decodeFrame(response);
  if (parsed.kind === "response")
    assert.equal(parsed.response.command, "set_duration");
  response[0] = 1;
  assert.throws(() => decodeFrame(response));
});
