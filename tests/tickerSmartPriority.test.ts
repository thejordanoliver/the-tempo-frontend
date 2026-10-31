import assert from "node:assert/strict";
import test from "node:test";
import { decodeFrame, encodeCommand } from "../services/ticker/protocol";
import type { TickerCommand } from "../types/ticker";

const statusFrame = (flags = 1) =>
  Uint8Array.of(
    10,
    3,
    0,
    0,
    0,
    0,
    255,
    50,
    3,
    1,
    14,
    0,
    14,
    0,
    flags,
    6,
    0,
    0,
    0,
    0,
  );

test("v10 smart priority round-trips its bit independently of all other display flags", () => {
  for (let flags = 0; flags < 128; flags++) {
    const disabled = decodeFrame(statusFrame(flags));
    const enabled = decodeFrame(statusFrame(flags | 128));
    if (disabled.kind !== "status" || enabled.kind !== "status")
      return assert.fail();
    assert.equal(disabled.status.protocolVersion, 10);
    assert.equal(disabled.status.firmwareVersion, "0.14.0");
    assert.ok(disabled.status.capabilities.includes("set_smart_priority"));
    assert.equal(disabled.status.settings.smartGamePriority, false);
    assert.equal(enabled.status.settings.smartGamePriority, true);
    assert.deepEqual(
      { ...enabled.status.settings, smartGamePriority: false },
      disabled.status.settings,
    );
  }
  for (const value of [false, true]) {
    const command = encodeCommand(
      0x1234,
      { type: "set_smart_priority", value },
      10,
    );
    assert.deepEqual(Array.from(command), [
      10,
      1,
      0x34,
      0x12,
      22,
      value ? 1 : 0,
      ...Array(14).fill(0),
    ]);
    const response = statusFrame(value ? 129 : 1);
    response[1] = 2;
    response[2] = command[2];
    response[3] = command[3];
    response[4] = 22;
    const result = decodeFrame(response);
    if (result.kind !== "response") return assert.fail();
    assert.equal(result.response.command, "set_smart_priority");
    assert.equal(result.response.status.settings.smartGamePriority, value);
  }
});
test("smart priority rejects non-boolean values and remains unavailable in older protocol versions", () => {
  for (const value of [0, 1, "true", null, undefined])
    assert.throws(
      () =>
        encodeCommand(
          1,
          { type: "set_smart_priority", value } as unknown as TickerCommand,
          10,
        ),
      /on or off/,
    );
  for (const version of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const)
    assert.throws(
      () =>
        encodeCommand(1, { type: "set_smart_priority", value: true }, version),
      /0.14.0/,
    );
  for (const version of [8, 9]) {
    const legacy = statusFrame();
    legacy[0] = version;
    const result = decodeFrame(legacy);
    if (result.kind !== "status") return assert.fail();
    assert.equal(result.status.settings.smartGamePriority, null);
    assert.equal(
      result.status.capabilities.includes("set_smart_priority"),
      false,
    );
    legacy[14] |= 128;
    assert.throws(() => decodeFrame(legacy), /Invalid ticker status/);
    legacy[14] = 1;
    legacy[1] = 2;
    legacy[2] = 1;
    legacy[4] = 22;
    assert.throws(() => decodeFrame(legacy), /acknowledgment/);
  }
});
