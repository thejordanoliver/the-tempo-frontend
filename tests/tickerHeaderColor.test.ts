import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeFrame,
  encodeCommand,
  HEADER_COLORS,
} from "../services/ticker/protocol";
import { TICKER_HEADER_COLORS } from "../constants/tickerHeaderColors";

test("v7 header colors keep display power and all other settings independent", () => {
  assert.deepEqual(Object.keys(TICKER_HEADER_COLORS), HEADER_COLORS);
  for (const [index, value] of HEADER_COLORS.entries()) {
    const command = encodeCommand(513, { type: "set_header_color", value }, 7);
    assert.deepEqual(Array.from(command.slice(0, 6)), [7, 1, 1, 2, 18, index]);
    assert.ok(command.slice(6).every((byte) => byte === 0));
    assert.match(TICKER_HEADER_COLORS[value], /^#[0-9a-f]{6}$/);
    for (const power of [0, 1, 2]) {
      const frame = Uint8Array.from([
        7,
        3,
        0,
        0,
        0,
        0,
        255,
        50,
        1,
        1,
        power | (index << 2),
        0,
        10,
        0,
        95,
        6,
        5,
        1,
        2,
        3,
      ]);
      const parsed = decodeFrame(frame);
      if (parsed.kind !== "status") return assert.fail();
      assert.equal(parsed.status.settings.headerColor, value);
      assert.equal(
        parsed.status.settings.displayOn,
        power === 0 ? null : power === 2,
      );
      assert.equal(parsed.status.settings.headerMode, "hidden");
      assert.equal(parsed.status.settings.dateFormat, "yyyy-mm-dd");
      assert.equal(parsed.status.settings.showBroadcast, false);
      assert.equal(parsed.status.settings.favoritesSignature, 0x030201);
      assert.ok(parsed.status.capabilities.includes("set_header_color"));
      frame[10] = 3 | (index << 2);
      assert.throws(() => decodeFrame(frame));
      frame[10] = 32 | power;
      assert.throws(() => decodeFrame(frame));
    }
  }
  assert.throws(() =>
    encodeCommand(
      1,
      { type: "set_header_color", value: "#000000" as never },
      7,
    ),
  );
  for (const version of [1, 2, 3, 4, 5, 6] as const) {
    assert.throws(
      () =>
        encodeCommand(1, { type: "set_header_color", value: "blue" }, version),
      /0.10.0/,
    );
    const parsed = decodeFrame(
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
        9,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      ]),
    );
    if (parsed.kind !== "status") return assert.fail();
    assert.equal(parsed.status.settings.headerColor, null);
    assert.equal(
      parsed.status.capabilities.includes("set_header_color"),
      false,
    );
  }
});
