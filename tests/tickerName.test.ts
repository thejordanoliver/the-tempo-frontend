import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeTickerName,
  encodeTickerName,
  normalizeTickerName,
} from "../services/ticker/name";
import { decodeFrame } from "../services/ticker/protocol";

test("names normalize spaces and fit one GATT write", () => {
  assert.equal(
    normalizeTickerName(" Living Room Ticker "),
    "Living Room Ticker",
  );
  assert.equal(
    decodeTickerName(encodeTickerName("Jordan's Ticker")),
    "Jordan's Ticker",
  );
  assert.equal(encodeTickerName("12345678901234567890").length, 20);
  for (const name of [
    "",
    " ",
    "123456789012345678901",
    "Room\nTicker",
    "Room\0Ticker",
    "Café",
    "🏀",
  ])
    assert.throws(() => encodeTickerName(name));
  for (const bytes of [
    new Uint8Array(),
    Uint8Array.of(0),
    Uint8Array.of(255),
    Uint8Array.of(32),
    new Uint8Array(21).fill(65),
  ])
    assert.throws(() => decodeTickerName(bytes));
});

test("firmware explicitly advertises rename support without changing control frames", () => {
  const frame = Uint8Array.from([
    3, 3, 0, 0, 0, 0, 255, 50, 1, 1, 2, 0, 6, 0, 1, 6, 0, 0, 0, 0,
  ]);
  const parsed = decodeFrame(frame);
  assert.equal(parsed.kind === "status" && parsed.status.canRename, true);
  frame[6] = 127;
  const old = decodeFrame(frame);
  assert.equal(old.kind === "status" && old.status.canRename, false);
  frame[0] = 2;
  frame[6] = 255;
  assert.throws(() => decodeFrame(frame));
});
