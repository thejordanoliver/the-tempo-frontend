import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeFrame,
  encodeCommand,
  HEADER_MODES,
} from "../services/ticker/protocol";

test("v6 header options encode and decode independently of other display and favorite settings", () => {
  for (const [index, value] of HEADER_MODES.filter(
    (mode) => mode !== "custom",
  ).entries()) {
    const command = encodeCommand(513, { type: "set_header", value }, 6);
    assert.deepEqual(Array.from(command.slice(0, 6)), [6, 1, 1, 2, 17, index]);
    assert.ok(command.slice(6).every((byte) => byte === 0));
    for (let options = 0; options < 32; ++options) {
      const frame = Uint8Array.from([
        6,
        3,
        0,
        0,
        0,
        0,
        255,
        50,
        1,
        1,
        2,
        0,
        9,
        0,
        options | (index << 5),
        6,
        5,
        1,
        2,
        3,
      ]);
      const parsed = decodeFrame(frame);
      if (parsed.kind !== "status") return assert.fail();
      assert.equal(parsed.status.settings.headerMode, value);
      assert.ok(parsed.status.capabilities.includes("set_header"));
      assert.equal(parsed.status.settings.showBroadcast, !(options & 16));
      assert.equal(parsed.status.settings.showRankings, !!(options & 1));
      assert.equal(parsed.status.settings.top25Only, !!(options & 2));
      assert.equal(parsed.status.settings.favoritesSignature, 0x030201);
      assert.equal(parsed.status.canRename, true);
      frame[14] = 96;
      assert.throws(() => decodeFrame(frame));
      frame[14] = 128;
      assert.throws(() => decodeFrame(frame));
    }
  }
  assert.throws(() =>
    encodeCommand(1, { type: "set_header", value: "invalid" as never }, 6),
  );
  for (const version of [1, 2, 3, 4, 5] as const) {
    assert.throws(
      () => encodeCommand(1, { type: "set_header", value: "hidden" }, version),
      /0.9.0/,
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
        8,
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
    assert.equal(parsed.status.settings.headerMode, null);
    assert.equal(parsed.status.capabilities.includes("set_header"), false);
  }
});
