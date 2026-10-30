import type {
  SupportedTickerLeague,
  TickerCommand,
  TickerCommandResponse,
  TickerCommandType,
  TickerStatus,
} from "../../types/ticker";

// Provisional v1: fixed 20-byte binary frames fit the minimum ATT payload (MTU 23).
export const TICKER_GATT = {
  service: "d69a0001-7a9b-4b28-95d3-09a1f487e001",
  status: "d69a0002-7a9b-4b28-95d3-09a1f487e001",
  command: "d69a0003-7a9b-4b28-95d3-09a1f487e001",
  response: "d69a0004-7a9b-4b28-95d3-09a1f487e001",
  authorization: "d69a0005-7a9b-4b28-95d3-09a1f487e001",
  name: "d69a0006-7a9b-4b28-95d3-09a1f487e001",
} as const;
export const FRAME_BYTES = 20;
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
  version: 1 | 2 | 3 = 1,
): Uint8Array {
  if (!Number.isInteger(id) || id < 1 || id > 65535)
    throw new Error("Invalid request identifier.");
  if (version !== 1 && version !== 2 && version !== 3)
    throw new Error("Unsupported ticker protocol version.");
  if (version === 1 && OPCODES[command.type] > 6)
    throw new Error("This setting requires firmware 0.3.0 or newer.");
  if (version < 3 && OPCODES[command.type] > 9)
    throw new Error("This view requires firmware 0.5.0 or newer.");
  const bytes = new Uint8Array(FRAME_BYTES);
  bytes.set([version, 1, id & 255, id >> 8, OPCODES[command.type]]);
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
    ["set_display", "set_show_rankings", "set_top25_only"].includes(
      command.type,
    ) &&
    "value" in command
  )
    bytes[5] = command.value ? 1 : 0;
  if (command.type === "set_duration") {
    validateDuration(command.value);
    bytes[5] = command.value;
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
  return bytes;
}
export function decodeFrame(
  bytes: Uint8Array,
):
  | { kind: "status"; status: TickerStatus }
  | { kind: "response"; response: TickerCommandResponse } {
  if (
    bytes.length !== FRAME_BYTES ||
    ![1, 2, 3].includes(bytes[0]) ||
    ![2, 3].includes(bytes[1])
  )
    throw new Error(
      "Unsupported firmware/protocol. Expected a Tempo v1/v2/v3 20-byte frame.",
    );
  const extended = bytes[0] >= 2;
  const content = bytes[0] === 3;
  if (
    bytes.slice(content ? 20 : extended ? 17 : 14).some((b) => b !== 0) ||
    bytes[6] > (content ? 255 : extended ? 127 : 15) ||
    (extended &&
      (bytes[14] > (content ? 3 : 2) ||
        bytes[16] > (content ? 4 : 2) ||
        (bytes[15] !== 0 && (bytes[15] < 3 || bytes[15] > 60)))) ||
    (bytes[7] > 100 && bytes[7] !== 255) ||
    bytes[8] > (extended ? 7 : 3) ||
    bytes[9] > 2 ||
    bytes[10] > 2
  )
    throw new Error("Invalid ticker status payload.");
  if (
    content &&
    ((bytes[16] === 1 && (bytes[17] | bytes[18] | bytes[19]) === 0) ||
      (bytes[16] !== 1 && (bytes[17] | bytes[18] | bytes[19]) !== 0) ||
      (bytes[16] >= 2 && ![3, 5, 7].includes(bytes[8])) ||
      (bytes[16] === 4 && bytes[8] !== 3))
  )
    throw new Error("Invalid ticker content settings.");
  const firmware = bytes.slice(11, 14);
  if (firmware.some((b) => b === 255) && !firmware.every((b) => b === 255))
    throw new Error("Invalid firmware version.");
  const status: TickerStatus = {
    protocolVersion: bytes[0] as 1 | 2 | 3,
    canRename: content && (bytes[6] & 128) !== 0,
    capabilities: [
      "get_status",
      "get_settings",
      ...capabilityCommands.filter((_, bit) => (bytes[6] & (1 << bit)) !== 0),
      ...(content ? (["set_view", "set_team_schedule"] as const) : []),
    ],
    settings: {
      brightness: bytes[7] === 255 ? null : bytes[7],
      selectedLeague: LEAGUES[bytes[8] - 1] ?? null,
      displayOn: bytes[10] === 0 ? null : bytes[10] === 2,
      showRankings: content
        ? !!(bytes[14] & 1)
        : !extended || bytes[14] === 0
          ? null
          : bytes[14] === 2,
      durationSeconds: !extended || bytes[15] === 0 ? null : bytes[15],
      top25Only: content
        ? !!(bytes[14] & 2)
        : !extended || bytes[16] === 0
          ? null
          : bytes[16] === 2,
      viewMode: content
        ? (["scores", "schedule", "ap", "coaches", "cfp"] as const)[bytes[16]]
        : null,
      teamId:
        content && bytes[16] === 1
          ? bytes[17] | (bytes[18] << 8) | (bytes[19] << 16)
          : null,
    },
    wifi: (["unknown", "connected", "disconnected"] as const)[bytes[9]],
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
