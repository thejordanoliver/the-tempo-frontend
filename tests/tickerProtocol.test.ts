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
    [0, 2],
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
