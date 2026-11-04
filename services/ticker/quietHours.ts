import type { TickerQuietHoursConfig } from "../../types/ticker";
import { TICKER_TIME_ZONES } from "../../constants/tickerTimeZones";

export const DEFAULT_QUIET_HOURS: TickerQuietHoursConfig = {
  enabled: false,
  startMinute: 22 * 60,
  endMinute: 7 * 60,
  days: 127,
  behavior: "off",
  dimPercent: 10,
  timeZone: 1,
};
export class TickerQuietHoursUnavailableError extends Error {
  constructor() {
    super(
      "Quiet hours is unavailable. After updating firmware, forget this ticker in Bluetooth settings, then reconnect and pair again.",
    );
  }
}
export function quietHoursBytes(config: TickerQuietHoursConfig): Uint8Array {
  if (
    typeof config.enabled !== "boolean" ||
    !["off", "dim"].includes(config.behavior) ||
    !Number.isInteger(config.startMinute) ||
    config.startMinute < 0 ||
    config.startMinute >= 1440 ||
    !Number.isInteger(config.endMinute) ||
    config.endMinute < 0 ||
    config.endMinute >= 1440 ||
    config.startMinute === config.endMinute ||
    !Number.isInteger(config.days) ||
    config.days < 1 ||
    config.days > 127 ||
    !Number.isInteger(config.dimPercent) ||
    config.dimPercent < 1 ||
    config.dimPercent > 50 ||
    !Number.isInteger(config.timeZone) ||
    config.timeZone < 0 ||
    config.timeZone >= TICKER_TIME_ZONES.length
  )
    throw new Error(
      "Choose different start/end times, at least one day, a time zone, and 1–50% dim brightness.",
    );
  return Uint8Array.of(
    config.enabled ? 1 : 0,
    config.startMinute & 255,
    config.startMinute >> 8,
    config.endMinute & 255,
    config.endMinute >> 8,
    config.days,
    config.behavior === "dim" ? 1 : 0,
    config.dimPercent,
    config.timeZone,
  );
}
export function quietHoursEqual(
  left: TickerQuietHoursConfig,
  right: TickerQuietHoursConfig,
): boolean {
  const a = quietHoursBytes(left),
    b = quietHoursBytes(right);
  return a.every((value, index) => value === b[index]);
}
export function decodeQuietHours(bytes: Uint8Array): {
  config: TickerQuietHoursConfig;
  configured: boolean;
} {
  if (
    bytes.length !== 11 ||
    bytes[0] > 1 ||
    bytes[1] !== 1 ||
    bytes[2] > 1 ||
    bytes[8] > 1
  )
    throw new Error("The ticker reported an invalid quiet-hours schedule.");
  const config: TickerQuietHoursConfig = {
    enabled: bytes[2] === 1,
    startMinute: bytes[3] | (bytes[4] << 8),
    endMinute: bytes[5] | (bytes[6] << 8),
    days: bytes[7],
    behavior: bytes[8] === 1 ? "dim" : "off",
    dimPercent: bytes[9],
    timeZone: bytes[10],
  };
  quietHoursBytes(config);
  return { config, configured: bytes[0] === 1 };
}
export function quietTimeLabel(minute: number): string {
  const hour = Math.floor(minute / 60);
  return `${hour % 12 || 12}:${String(minute % 60).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}
