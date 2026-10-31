import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeCustomHeader,
  encodeCustomHeader,
  normalizeCustomHeader,
  HEADER_EMOJIS,
  supportsHeaderEmoji,
} from "../services/ticker/customHeader";
import {
  decodeFrame,
  encodeCommand,
  TICKER_GATT,
} from "../services/ticker/protocol";

test("custom header text fits one protected GATT write and is separate from the device name", () => {
  assert.equal(normalizeCustomHeader("  Game Room  "), "Game Room");
  assert.equal(
    decodeCustomHeader(encodeCustomHeader("Jordan's Scoreboard")),
    "Jordan's Scoreboard",
  );
  assert.equal(encodeCustomHeader("12345678901234567890").length, 20);
  assert.equal(decodeCustomHeader(new Uint8Array()), "");
  assert.notEqual(TICKER_GATT.customHeader, TICKER_GATT.name);
  for (const invalid of [
    "",
    " ",
    "123456789012345678901",
    "Game\nRoom",
    "Game\0Room",
    "Café",
    "👨‍👩‍👧‍👦",
    "💪🏽",
    "\ufe0f",
  ])
    assert.throws(() => encodeCustomHeader(invalid));
  for (const bytes of [
    Uint8Array.of(0),
    Uint8Array.of(255),
    new Uint8Array(21).fill(65),
    Uint8Array.of(32, 65),
  ])
    assert.throws(() => decodeCustomHeader(bytes));
});

test("supported emoji have stable single-byte IDs and round-trip with ASCII", () => {
  assert.deepEqual(
    HEADER_EMOJIS.map(({ emoji, byte }) => [emoji, byte]),
    [
      ["❤️", 0x88],
      ["⭐", 0x87],
      ["🏆", 0x85],
      ["🔥", 0x86],
    ],
  );
  for (const { emoji, byte } of HEADER_EMOJIS) {
    assert.deepEqual(encodeCustomHeader(emoji), Uint8Array.of(byte));
    assert.equal(decodeCustomHeader(Uint8Array.of(byte)), emoji);
    assert.equal(normalizeCustomHeader(`  GO ${emoji}  `), `GO ${emoji}`);
  }
  assert.equal(normalizeCustomHeader("GO ❤"), "GO ❤️");
  assert.equal(normalizeCustomHeader("⭐️"), "⭐");
  assert.equal(encodeCustomHeader("🏆".repeat(20)).length, 20);
  assert.throws(() => encodeCustomHeader("🏆".repeat(21)), /20 characters/);
  assert.equal(
    decodeCustomHeader(encodeCustomHeader("🏆 GAME ROOM 🔥")),
    "🏆 GAME ROOM 🔥",
  );
  for (const byte of [
    0x7f, 0x80, 0x81, 0x82, 0x83, 0x84, 0x89, 0x8a, 0x8b, 0x8c, 0xfe, 0xff,
  ])
    assert.throws(() => decodeCustomHeader(Uint8Array.of(byte)));
  for (const emoji of ["🏀", "🏈", "⚾", "⚽", "🏒", "💪", "🎉", "😎"])
    assert.throws(() => encodeCustomHeader(emoji), /picker/);
  // Native UTF-8 must never be interpreted as compact header glyph IDs.
  assert.throws(() =>
    decodeCustomHeader(Uint8Array.of(0xf0, 0x9f, 0x8f, 0x80)),
  );
});

test("header emoji are enabled only when the firmware supports their glyph IDs", () => {
  for (const version of [null, undefined, "", "unknown", "0.11.0", "0.12.0"])
    assert.equal(supportsHeaderEmoji(version), false);
  for (const version of ["0.13.0", "0.13.1", "0.14.0", "1.0.0"])
    assert.equal(supportsHeaderEmoji(version), true);
});

test("v8 adds custom header mode without changing color, power or favorites", () => {
  assert.deepEqual(
    Array.from(
      encodeCommand(513, { type: "set_header", value: "custom" }, 8).slice(
        0,
        6,
      ),
    ),
    [8, 1, 1, 2, 17, 3],
  );
  const frame = Uint8Array.from([
    8, 3, 0, 0, 0, 0, 255, 50, 1, 1, 30, 0, 11, 0, 127, 6, 5, 1, 2, 3,
  ]);
  const parsed = decodeFrame(frame);
  if (parsed.kind !== "status") return assert.fail();
  assert.equal(parsed.status.canCustomHeader, true);
  assert.equal(parsed.status.settings.headerMode, "custom");
  assert.equal(parsed.status.settings.headerColor, "cyan");
  assert.equal(parsed.status.settings.displayOn, true);
  assert.equal(parsed.status.settings.favoritesSignature, 0x030201);
  frame[14] = 128;
  assert.throws(() => decodeFrame(frame));
  for (const version of [1, 2, 3, 4, 5, 6, 7] as const) {
    assert.throws(
      () => encodeCommand(1, { type: "set_header", value: "custom" }, version),
      /0.11.0/,
    );
    const legacy = decodeFrame(
      Uint8Array.from([
        version,
        3,
        0,
        0,
        0,
        0,
        15,
        50,
        1,
        1,
        2,
        0,
        10,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]),
    );
    assert.equal(
      legacy.kind === "status" && legacy.status.canCustomHeader,
      false,
    );
  }
});
