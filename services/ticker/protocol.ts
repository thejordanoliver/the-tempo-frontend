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
} as const;
export const FRAME_BYTES = 20;
export const LEAGUES: SupportedTickerLeague[] = ["nba", "nfl", "cfb"];
export const OPCODES: Record<TickerCommandType, number> = {
  get_status: 1,
  get_settings: 2,
  set_brightness: 3,
  set_league: 4,
  refresh_scores: 5,
  set_display: 6,
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
export function encodeCommand(id: number, command: TickerCommand): Uint8Array {
  if (!Number.isInteger(id) || id < 1 || id > 65535)
    throw new Error("Invalid request identifier.");
  const bytes = new Uint8Array(FRAME_BYTES);
  bytes.set([1, 1, id & 255, id >> 8, OPCODES[command.type]]);
  if (command.type === "set_brightness") {
    validateBrightness(command.value);
    bytes[5] = command.value;
  }
  if (command.type === "set_league") {
    const league = LEAGUES.indexOf(command.value);
    if (league < 0) throw new Error("Unsupported league.");
    bytes[5] = league + 1;
  }
  if (command.type === "set_display") bytes[5] = command.value ? 1 : 0;
  return bytes;
}
export function decodeFrame(
  bytes: Uint8Array,
):
  | { kind: "status"; status: TickerStatus }
  | { kind: "response"; response: TickerCommandResponse } {
  if (
    bytes.length !== FRAME_BYTES ||
    bytes[0] !== 1 ||
    ![2, 3].includes(bytes[1])
  )
    throw new Error(
      "Unsupported firmware/protocol. Expected a Tempo v1 20-byte frame.",
    );
  if (
    bytes.slice(14).some((b) => b !== 0) ||
    bytes[6] > 15 ||
    (bytes[7] > 100 && bytes[7] !== 255) ||
    bytes[8] > 3 ||
    bytes[9] > 2 ||
    bytes[10] > 2
  )
    throw new Error("Invalid ticker status payload.");
  const firmware = bytes.slice(11, 14);
  if (firmware.some((b) => b === 255) && !firmware.every((b) => b === 255))
    throw new Error("Invalid firmware version.");
  const status: TickerStatus = {
    protocolVersion: 1,
    capabilities: [
      "get_status",
      "get_settings",
      ...capabilityCommands.filter((_, bit) => (bytes[6] & (1 << bit)) !== 0),
    ],
    settings: {
      brightness: bytes[7] === 255 ? null : bytes[7],
      selectedLeague: LEAGUES[bytes[8] - 1] ?? null,
      displayOn: bytes[10] === 0 ? null : bytes[10] === 2,
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
  if (!id || !command || !results[bytes[5]])
    throw new Error("Invalid command acknowledgment.");
  return {
    kind: "response",
    response: { id, command, result: results[bytes[5]], status },
  };
}
