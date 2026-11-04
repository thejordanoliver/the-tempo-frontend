import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_QUIET_HOURS,
  quietHoursBytes,
  quietHoursEqual,
  decodeQuietHours,
  quietTimeLabel,
} from "../services/ticker/quietHours";
import {
  encodeCommand,
  decodeFrame,
  HEADER_COLORS,
} from "../services/ticker/protocol";
import {
  TICKER_TIME_ZONES,
  tickerPhoneTimeZone,
} from "../constants/tickerTimeZones";
import type { TickerCommand } from "../types/ticker";

test("quiet-hours schedule fits one minimum-MTU frame and round trips all fields", () => {
  const config = {
    ...DEFAULT_QUIET_HOURS,
    enabled: true,
    days: 62,
    behavior: "dim" as const,
    dimPercent: 8,
    timeZone: 9,
  };
  const bytes = encodeCommand(
    7,
    { type: "set_quiet_hours", value: config },
    11,
  );
  assert.equal(bytes.length, 20);
  assert.deepEqual(
    Array.from(bytes.slice(0, 14)),
    [11, 1, 7, 0, 23, 1, 40, 5, 164, 1, 62, 1, 8, 9],
  );
  assert.ok(bytes.slice(14).every((value) => value === 0));
  assert.deepEqual(
    decodeQuietHours(Uint8Array.of(1, 1, ...quietHoursBytes(config))),
    { config, configured: true },
  );
  assert.ok(quietHoursEqual(config, { ...config }));
  assert.equal(quietTimeLabel(0), "12:00 AM");
  assert.equal(quietTimeLabel(22 * 60), "10:00 PM");
});
test("quiet hours rejects invalid schedules, booleans, lengths and older firmware", () => {
  for (const patch of [
    { enabled: 1 },
    { startMinute: 1440 },
    { startMinute: 1.5 },
    { endMinute: 1320 },
    { days: 0 },
    { days: 128 },
    { behavior: "bright" },
    { dimPercent: 0 },
    { dimPercent: 51 },
    { timeZone: 30 },
  ])
    assert.throws(() =>
      quietHoursBytes({
        ...DEFAULT_QUIET_HOURS,
        ...patch,
      } as typeof DEFAULT_QUIET_HOURS),
    );
  assert.throws(() => decodeQuietHours(new Uint8Array(10)));
  for (const version of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const)
    assert.throws(
      () =>
        encodeCommand(
          1,
          { type: "set_quiet_hours", value: DEFAULT_QUIET_HOURS },
          version,
        ),
      /0.15.0/,
    );
  assert.throws(() =>
    encodeCommand(
      1,
      { type: "set_quiet_override", value: 1 } as unknown as TickerCommand,
      11,
    ),
  );
});
test("quiet state bits preserve power, color, wifi and older reserved-bit validation", () => {
  for (let color = 0; color < 8; color++)
    for (const power of [1, 2]) {
      const bytes = Uint8Array.of(
        11,
        3,
        0,
        0,
        0,
        0,
        255,
        50,
        1,
        5,
        power | (color << 2) | 224,
        0,
        15,
        0,
        1,
        6,
        0,
        0,
        0,
        0,
      );
      const result = decodeFrame(bytes);
      if (result.kind !== "status") return assert.fail();
      assert.equal(result.status.wifi, "connected");
      assert.equal(result.status.settings.displayOn, power === 2);
      assert.equal(result.status.settings.headerColor, HEADER_COLORS[color]);
      assert.equal(result.status.settings.quietHoursEnabled, true);
      assert.equal(result.status.settings.quietHoursActive, true);
      assert.equal(result.status.settings.quietHoursOverride, true);
      assert.equal(result.status.settings.quietHoursClockReady, true);
      assert.ok(result.status.capabilities.includes("set_quiet_hours"));
      bytes[0] = 10;
      assert.throws(() => decodeFrame(bytes));
    }
  for (const [wifi, flags] of [
    [1, 96],
    [5, 64],
    [5, 128],
  ]) {
    const bytes = Uint8Array.of(
      11,
      3,
      0,
      0,
      0,
      0,
      255,
      50,
      1,
      wifi,
      flags | 2,
      0,
      15,
      0,
      1,
      6,
      0,
      0,
      0,
      0,
    );
    assert.throws(() => decodeFrame(bytes));
  }
});
test("phone timezone aliases map to stable persisted IDs", () => {
  assert.equal(TICKER_TIME_ZONES.length, 30);
  assert.equal(tickerPhoneTimeZone("America/Toronto"), 1);
  assert.equal(tickerPhoneTimeZone("Asia/Calcutta"), 14);
  assert.equal(tickerPhoneTimeZone("Australia/Melbourne"), 18);
  assert.equal(tickerPhoneTimeZone("Unknown/Zone"), null);
});
