import { quietHoursBytes } from "./quietHours";
import { MAX_ROTATION_ENTRIES, rotationEntryBytes } from "./rotation";
import type {
  SupportedTickerLeague,
  TickerCommand,
  TickerCommandResponse,
  TickerCommandType,
  TickerStatus,
} from "../../types/ticker";
import {
  FAVORITE_LEAGUES,
  MAX_TICKER_FAVORITES,
  favoriteTeamsSignature,
} from "./favorites";

// Provisional v1: fixed 20-byte binary frames fit the minimum ATT payload (MTU 23).
export const TICKER_GATT = {
  service: "d69a0001-7a9b-4b28-95d3-09a1f487e001",
  status: "d69a0002-7a9b-4b28-95d3-09a1f487e001",
  command: "d69a0003-7a9b-4b28-95d3-09a1f487e001",
  response: "d69a0004-7a9b-4b28-95d3-09a1f487e001",
  authorization: "d69a0005-7a9b-4b28-95d3-09a1f487e001",
  name: "d69a0006-7a9b-4b28-95d3-09a1f487e001",
  customHeader: "d69a0007-7a9b-4b28-95d3-09a1f487e001",
  rotation: "d69a0008-7a9b-4b28-95d3-09a1f487e001",
  quietHours: "d69a0009-7a9b-4b28-95d3-09a1f487e001",
} as const;
export const FRAME_BYTES = 20;
export const HEADER_MODES = [
  "tempo",
  "device_name",
  "hidden",
  "custom",
] as const;
export const HEADER_COLORS = [
  "green",
  "white",
  "red",
  "blue",
  "yellow",
  "orange",
  "purple",
  "cyan",
] as const;
export const DATE_FORMATS = ["mm/dd", "dd/mm", "mmm d", "yyyy-mm-dd"] as const;
export const LEAGUES: SupportedTickerLeague[] = [
  "nba",
  "nfl",
  "cfb",
  "mlb",
  "mcbb",
  "wnba",
  "wcbb",
];
export const OPCODES: Record<TickerCommandType, number> = {
  get_status: 1,
  get_settings: 2,
  set_brightness: 3,
  set_league: 4,
  refresh_scores: 5,
  set_display: 6,
  set_show_rankings: 7,
  set_duration: 8,
  set_top25_only: 9,
  set_view: 10,
  set_team_schedule: 11,
  set_date_format: 12,
  set_show_broadcast: 13,
  favorites_begin: 14,
  favorites_chunk: 15,
  favorites_commit: 16,
  set_header: 17,
  set_header_color: 18,
  rotation_begin: 19,
  rotation_chunk: 20,
  rotation_commit: 21,
  set_smart_priority: 22,
  set_quiet_hours: 23,
  set_quiet_override: 24,
};
const results = [
  "ok",
  "unsupported",
  "unauthorized",
  "invalid",
  "failed",
] as const;
const capabilityCommands: TickerCommandType[] = [
  "set_brightness",
  "set_league",
  "refresh_scores",
  "set_display",
  "set_show_rankings",
  "set_duration",
  "set_top25_only",
];
export function isCompatibleAdvertisement(
  uuids: readonly string[] | null | undefined,
) {
  return !!uuids?.some((uuid) => uuid.toLowerCase() === TICKER_GATT.service);
}
export function validateBrightness(value: number) {
  if (!Number.isInteger(value) || value < 0 || value > 100)
    throw new Error("Brightness must be a whole percentage from 0 to 100.");
}
export function validateDuration(value: number) {
  if (!Number.isInteger(value) || value < 3 || value > 60)
    throw new Error("Duration must be a whole number of seconds from 3 to 60.");
}
export function encodeCommand(
  id: number,
  command: TickerCommand,
  version: TickerStatus["protocolVersion"] = 1,
): Uint8Array {
  if (!Number.isInteger(id) || id < 1 || id > 65535)
    throw new Error("Invalid request identifier.");
  if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(version))
    throw new Error("Unsupported ticker protocol version.");
  if (
    command.type === "set_header" &&
    command.value === "custom" &&
    version < 8
  )
    throw new Error("Custom headers require firmware 0.11.0 or newer.");
  if (version < 11 && OPCODES[command.type] >= 23)
    throw new Error("Quiet hours requires firmware 0.15.0 or newer.");
  if (version < 10 && command.type === "set_smart_priority")
    throw new Error("Smart game priority requires firmware 0.14.0 or newer.");
  if (version < 9 && OPCODES[command.type] > 18)
    throw new Error("Custom rotation requires firmware 0.12.0 or newer.");
  if (version < 7 && OPCODES[command.type] > 17)
    throw new Error("Header colors require firmware 0.10.0 or newer.");
  if (version < 6 && OPCODES[command.type] > 16)
    throw new Error("Header options require firmware 0.9.0 or newer.");
  if (version < 5 && OPCODES[command.type] > 13)
    throw new Error("Favorites mode requires firmware 0.8.0 or newer.");
  if (version < 4 && OPCODES[command.type] > 11)
    throw new Error("This setting requires firmware 0.7.0 or newer.");
  if (version === 1 && OPCODES[command.type] > 6)
    throw new Error("This setting requires firmware 0.3.0 or newer.");
  if (version < 3 && OPCODES[command.type] > 9)
    throw new Error("This view requires firmware 0.5.0 or newer.");
  const bytes = new Uint8Array(FRAME_BYTES);
  bytes.set([version, 1, id & 255, id >> 8, OPCODES[command.type]]);
  if (
    command.type === "set_show_broadcast" &&
    typeof command.value !== "boolean"
  )
    throw new Error("Broadcast visibility must be on or off.");
  if (
    command.type === "set_smart_priority" &&
    typeof command.value !== "boolean"
  )
    throw new Error("Smart game priority must be on or off.");
  if (command.type === "set_brightness") {
    validateBrightness(command.value);
    bytes[5] = command.value;
  }
  if (command.type === "set_league") {
    const league = LEAGUES.indexOf(command.value);
    if (league < 0) throw new Error("Unsupported league.");
    if (version === 1 && league > 2)
      throw new Error("This league requires firmware 0.4.0 or newer.");
    bytes[5] = league + 1;
  }
  if (
    [
      "set_display",
      "set_show_rankings",
      "set_top25_only",
      "set_show_broadcast",
      "set_smart_priority",
    ].includes(command.type) &&
    "value" in command
  )
    bytes[5] = command.value ? 1 : 0;
  if (command.type === "set_duration") {
    validateDuration(command.value);
    bytes[5] = command.value;
  }
  if (command.type === "set_date_format") {
    const format = DATE_FORMATS.indexOf(command.value);
    if (format < 0) throw new Error("Unsupported date format.");
    bytes[5] = format;
  }
  if (command.type === "set_header") {
    const mode = HEADER_MODES.indexOf(command.value);
    if (mode < 0) throw new Error("Unsupported header option.");
    bytes[5] = mode;
  }
  if (command.type === "set_header_color") {
    const color = HEADER_COLORS.indexOf(command.value);
    if (color < 0) throw new Error("Unsupported header color.");
    bytes[5] = color;
  }
  if (command.type === "set_view") {
    const view = ["scores", "schedule", "ap", "coaches", "cfp"].indexOf(
      command.value,
    );
    if (view < 0 || view === 1) throw new Error("Unsupported ticker view.");
    bytes[5] = view;
  }
  if (command.type === "set_team_schedule") {
    if (
      !Number.isInteger(command.value) ||
      command.value < 1 ||
      command.value > 0xffffff
    )
      throw new Error("Select a valid team.");
    bytes[5] = command.value & 255;
    bytes[6] = (command.value >> 8) & 255;
    bytes[7] = (command.value >> 16) & 255;
  }
  if (command.type === "favorites_begin") {
    if (
      !Number.isInteger(command.value) ||
      command.value < 1 ||
      command.value > MAX_TICKER_FAVORITES
    )
      throw new Error("Choose 1–50 supported favorite teams.");
    bytes[5] = command.value;
  }
  if (command.type === "favorites_chunk") {
    if (
      !Number.isInteger(command.offset) ||
      command.offset < 0 ||
      !command.teams.length ||
      command.teams.length > 3 ||
      command.offset + command.teams.length > MAX_TICKER_FAVORITES
    )
      throw new Error("Invalid favorites transfer.");
    favoriteTeamsSignature(command.teams);
    bytes[5] = command.offset;
    bytes[6] = command.teams.length;
    command.teams.forEach((team, index) => {
      const start = 7 + index * 4;
      bytes[start] = FAVORITE_LEAGUES.indexOf(team.league) + 1;
      bytes[start + 1] = team.teamId & 255;
      bytes[start + 2] = (team.teamId >> 8) & 255;
      bytes[start + 3] = (team.teamId >> 16) & 255;
    });
  }
  if (command.type === "favorites_commit") {
    if (
      !Number.isInteger(command.value) ||
      command.value < 1 ||
      command.value > 0xffffff
    )
      throw new Error("Invalid favorites confirmation.");
    bytes[5] = command.value & 255;
    bytes[6] = (command.value >> 8) & 255;
    bytes[7] = (command.value >> 16) & 255;
  }
  if (command.type === "rotation_begin") {
    if (
      !Number.isInteger(command.value) ||
      command.value < 1 ||
      command.value > MAX_ROTATION_ENTRIES
    )
      throw new Error("Add 1–8 rotation items.");
    bytes[5] = command.value;
  }
  if (command.type === "rotation_chunk") {
    if (
      !Number.isInteger(command.offset) ||
      command.offset < 0 ||
      command.entries.length < 1 ||
      command.entries.length > 2 ||
      command.offset + command.entries.length > MAX_ROTATION_ENTRIES
    )
      throw new Error("Invalid rotation transfer.");
    bytes[5] = command.offset;
    bytes[6] = command.entries.length;
    command.entries.forEach((entry, index) =>
      bytes.set(rotationEntryBytes(entry), 7 + index * 6),
    );
  }
  if (command.type === "rotation_commit") {
    if (
      !Number.isInteger(command.value) ||
      command.value < 1 ||
      command.value > 0xffffff
    )
      throw new Error("Invalid rotation confirmation.");
    bytes[5] = command.value & 255;
    bytes[6] = (command.value >> 8) & 255;
    bytes[7] = (command.value >> 16) & 255;
  }
  if (command.type === "set_quiet_hours")
    bytes.set(quietHoursBytes(command.value), 5);
  if (command.type === "set_quiet_override") {
    if (typeof command.value !== "boolean")
      throw new Error("Quiet-hours override must be on or off.");
    bytes[5] = command.value ? 1 : 0;
  }
  return bytes;
}
export function decodeFrame(
  bytes: Uint8Array,
):
  | { kind: "status"; status: TickerStatus }
  | { kind: "response"; response: TickerCommandResponse } {
  if (
    bytes.length !== FRAME_BYTES ||
    ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(bytes[0]) ||
    ![2, 3].includes(bytes[1])
  )
    throw new Error(
      "Unsupported firmware/protocol. Expected a Tempo v1–v11 20-byte frame.",
    );
  const extended = bytes[0] >= 2;
  const content = bytes[0] >= 3;
  const displayPreferences = bytes[0] >= 4;
  const favorites = bytes[0] >= 5;
  const headerOptions = bytes[0] >= 6;
  const headerColors = bytes[0] >= 7;
  const customHeaders = bytes[0] >= 8;
  const rotation = bytes[0] >= 9;
  const smartPriority = bytes[0] >= 10;
  const quietHours = bytes[0] >= 11;
  const wifiState = quietHours ? bytes[9] & 3 : bytes[9];
  const displayState = headerColors ? bytes[10] & 3 : bytes[10];
  if (
    bytes.slice(content ? 20 : extended ? 17 : 14).some((b) => b !== 0) ||
    bytes[6] > (content ? 255 : extended ? 127 : 15) ||
    (extended &&
      (bytes[14] >
        (smartPriority
          ? 255
          : customHeaders
            ? 127
            : headerOptions
              ? 95
              : displayPreferences
                ? 31
                : content
                  ? 3
                  : 2) ||
        bytes[16] > (rotation ? 6 : favorites ? 5 : content ? 4 : 2) ||
        (bytes[15] !== 0 && (bytes[15] < 3 || bytes[15] > 60)))) ||
    (bytes[7] > 100 && bytes[7] !== 255) ||
    bytes[8] > (extended ? 7 : 3) ||
    bytes[9] > (quietHours ? 6 : 2) ||
    wifiState > 2 ||
    bytes[10] > (quietHours ? 255 : headerColors ? 31 : 2) ||
    displayState > 2
  )
    throw new Error("Invalid ticker status payload.");
  if (
    content &&
    (([1, 5, 6].includes(bytes[16]) &&
      (bytes[17] | bytes[18] | bytes[19]) === 0) ||
      (![1, 5, 6].includes(bytes[16]) &&
        (bytes[17] | bytes[18] | bytes[19]) !== 0) ||
      (bytes[16] >= 2 && bytes[16] <= 4 && ![3, 5, 7].includes(bytes[8])) ||
      (bytes[16] === 4 && bytes[8] !== 3))
  )
    throw new Error("Invalid ticker content settings.");
  if (
    quietHours &&
    (((bytes[10] & 64) !== 0 && (!(bytes[10] & 32) || !(bytes[9] & 4))) ||
      ((bytes[10] & 128) !== 0 && !(bytes[10] & 64)))
  )
    throw new Error("Invalid ticker quiet-hours state.");
  const firmware = bytes.slice(11, 14);
  if (firmware.some((b) => b === 255) && !firmware.every((b) => b === 255))
    throw new Error("Invalid firmware version.");
  const status: TickerStatus = {
    protocolVersion: bytes[0] as TickerStatus["protocolVersion"],
    canRename: content && (bytes[6] & 128) !== 0,
    canCustomHeader: customHeaders,
    capabilities: [
      "get_status",
      "get_settings",
      ...capabilityCommands.filter((_, bit) => (bytes[6] & (1 << bit)) !== 0),
      ...(content ? (["set_view", "set_team_schedule"] as const) : []),
      ...(displayPreferences
        ? (["set_date_format", "set_show_broadcast"] as const)
        : []),
      ...(favorites
        ? (["favorites_begin", "favorites_chunk", "favorites_commit"] as const)
        : []),
      ...(headerOptions ? (["set_header"] as const) : []),
      ...(headerColors ? (["set_header_color"] as const) : []),
      ...(smartPriority ? (["set_smart_priority"] as const) : []),
      ...(quietHours
        ? (["set_quiet_hours", "set_quiet_override"] as const)
        : []),
      ...(rotation
        ? (["rotation_begin", "rotation_chunk", "rotation_commit"] as const)
        : []),
    ],
    settings: {
      quietHoursEnabled: quietHours ? !!(bytes[10] & 32) : null,
      quietHoursActive: quietHours ? !!(bytes[10] & 64) : null,
      quietHoursOverride: quietHours ? !!(bytes[10] & 128) : null,
      quietHoursClockReady: quietHours ? !!(bytes[9] & 4) : null,
      brightness: bytes[7] === 255 ? null : bytes[7],
      selectedLeague: LEAGUES[bytes[8] - 1] ?? null,
      displayOn: displayState === 0 ? null : displayState === 2,
      showRankings: content
        ? !!(bytes[14] & 1)
        : !extended || bytes[14] === 0
          ? null
          : bytes[14] === 2,
      durationSeconds: !extended || bytes[15] === 0 ? null : bytes[15],
      smartGamePriority: smartPriority ? !!(bytes[14] & 128) : null,
      top25Only: content
        ? !!(bytes[14] & 2)
        : !extended || bytes[16] === 0
          ? null
          : bytes[16] === 2,
      viewMode: content
        ? (
            [
              "scores",
              "schedule",
              "ap",
              "coaches",
              "cfp",
              "favorites",
              "rotation",
            ] as const
          )[bytes[16]]
        : null,
      teamId:
        content && bytes[16] === 1
          ? bytes[17] | (bytes[18] << 8) | (bytes[19] << 16)
          : null,
      dateFormat: displayPreferences
        ? DATE_FORMATS[(bytes[14] >> 2) & 3]
        : null,
      showBroadcast: displayPreferences ? !(bytes[14] & 16) : null,
      headerMode: headerOptions ? HEADER_MODES[(bytes[14] >> 5) & 3] : null,
      headerColor: headerColors ? HEADER_COLORS[(bytes[10] >> 2) & 7] : null,
      rotationSignature:
        rotation && bytes[16] === 6
          ? bytes[17] | (bytes[18] << 8) | (bytes[19] << 16)
          : null,
      favoritesSignature:
        favorites && bytes[16] === 5
          ? bytes[17] | (bytes[18] << 8) | (bytes[19] << 16)
          : null,
    },
    wifi: (["unknown", "connected", "disconnected"] as const)[wifiState],
    firmwareVersion:
      firmware[0] === 255 ? null : Array.from(firmware).join("."),
  };
  const id = bytes[2] | (bytes[3] << 8);
  if (bytes[1] === 3) {
    if (id !== 0 || bytes[4] !== 0 || bytes[5] !== 0)
      throw new Error("Invalid status frame.");
    return { kind: "status", status };
  }
  const command = (Object.keys(OPCODES) as TickerCommandType[]).find(
    (key) => OPCODES[key] === bytes[4],
  );
  if (
    !id ||
    !command ||
    (!extended && OPCODES[command] > 6) ||
    (!content && OPCODES[command] > 9) ||
    (!displayPreferences && OPCODES[command] > 11) ||
    (!favorites && OPCODES[command] > 13) ||
    (!headerOptions && OPCODES[command] > 16) ||
    (!headerColors && OPCODES[command] > 17) ||
    (!rotation && OPCODES[command] > 18) ||
    (!smartPriority && OPCODES[command] > 21) ||
    (!quietHours && OPCODES[command] > 22) ||
    !results[bytes[5]]
  )
    throw new Error("Invalid command acknowledgment.");
  return {
    kind: "response",
    response: { id, command, result: results[bytes[5]], status },
  };
}

// Firmware 0.4 extends the v2 league identifiers without changing frame size.
export function tickerSupportsExpandedLeagues(
  version: string | null | undefined,
) {
  if (!version) return false;
  const [major, minor] = version.split(".").map(Number);
  return major > 0 || (major === 0 && minor >= 4);
}
