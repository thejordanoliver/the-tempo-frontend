import type { TickerRotationEntry } from "../../types/ticker";

export const MAX_ROTATION_ENTRIES = 8;
const LEAGUES = ["nba", "nfl", "cfb", "mlb", "mcbb", "wnba", "wcbb"] as const;
const VIEWS = [
  "scores",
  "schedule",
  "ap",
  "coaches",
  "cfp",
  "favorites",
] as const;
export class TickerRotationUnavailableError extends Error {
  constructor() {
    super(
      "Custom rotation is unavailable. After updating firmware, forget this ticker in Bluetooth settings, then reconnect and pair again.",
    );
  }
}
export function rotationEntryBytes(entry: TickerRotationEntry): Uint8Array {
  const view = VIEWS.indexOf(entry.view);
  const league =
    entry.view === "favorites" ? 0 : LEAGUES.indexOf(entry.league!) + 1;
  const team = entry.teamId ?? 0;
  if (
    view < 0 ||
    !Number.isInteger(entry.seconds) ||
    entry.seconds < 3 ||
    entry.seconds > 60 ||
    !Number.isInteger(team) ||
    team < 0 ||
    team > 0xffffff ||
    (view === 5 ? entry.league != null || team !== 0 : league < 1) ||
    (view === 1 ? team === 0 : team !== 0) ||
    (view >= 2 && view <= 4 && ![3, 5, 7].includes(league)) ||
    (view === 4 && league !== 3)
  )
    throw new Error("Choose a valid rotation item and 3–60 seconds per card.");
  return Uint8Array.of(
    league,
    view,
    team & 255,
    (team >> 8) & 255,
    (team >> 16) & 255,
    entry.seconds,
  );
}
export function rotationSignature(
  entries: readonly TickerRotationEntry[],
): number {
  if (!entries.length || entries.length > MAX_ROTATION_ENTRIES)
    throw new Error("Add 1–8 items to your custom rotation.");
  let hash = Math.imul(2166136261 ^ entries.length, 16777619) >>> 0;
  for (const entry of entries)
    for (const byte of rotationEntryBytes(entry))
      hash = Math.imul(hash ^ byte, 16777619) >>> 0;
  return hash & 0xffffff || 1;
}
export function decodeRotation(bytes: Uint8Array): {
  entries: TickerRotationEntry[];
  enabled: boolean;
} {
  if (!bytes.length) return { entries: [], enabled: false };
  if (
    bytes.length < 8 ||
    bytes[0] > 1 ||
    bytes[1] < 1 ||
    bytes[1] > MAX_ROTATION_ENTRIES ||
    bytes.length !== 2 + bytes[1] * 6
  )
    throw new Error("The ticker reported an invalid rotation.");
  const entries: TickerRotationEntry[] = [];
  for (let i = 0; i < bytes[1]; i++) {
    const offset = 2 + i * 6;
    const view = VIEWS[bytes[offset + 1]];
    const team =
      bytes[offset + 2] | (bytes[offset + 3] << 8) | (bytes[offset + 4] << 16);
    if (
      !view ||
      (view === "favorites" && bytes[offset] !== 0) ||
      (view !== "favorites" && !LEAGUES[bytes[offset] - 1])
    )
      throw new Error("The ticker reported an invalid rotation item.");
    const entry: TickerRotationEntry = {
      view,
      league: view === "favorites" ? null : LEAGUES[bytes[offset] - 1],
      teamId: team || null,
      seconds: bytes[offset + 5],
    };
    rotationEntryBytes(entry);
    entries.push(entry);
  }
  rotationSignature(entries);
  return { entries, enabled: bytes[0] === 1 };
}
