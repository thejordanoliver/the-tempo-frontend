export type SupportedTickerLeague =
  | "nba"
  | "nfl"
  | "cfb"
  | "mlb"
  | "mcbb"
  | "wnba"
  | "wcbb";
export type TickerViewMode = "scores" | "schedule" | "ap" | "coaches" | "cfp";
export type TickerConnectionState =
  | "disconnected"
  | "connecting"
  | "verifying"
  | "connected"
  | "error";
export type TickerBluetoothState =
  | "Unknown"
  | "Resetting"
  | "Unsupported"
  | "Unauthorized"
  | "PoweredOff"
  | "PoweredOn";
export interface TickerDevice {
  id: string;
  name: string;
  rssi?: number | null;
}
export interface TickerSettings {
  brightness: number | null;
  selectedLeague: SupportedTickerLeague | null;
  displayOn: boolean | null;
  showRankings: boolean | null;
  durationSeconds: number | null;
  top25Only: boolean | null;
  viewMode: TickerViewMode | null;
  teamId: number | null;
}
export type TickerCommand =
  | { type: "get_status" | "get_settings" | "refresh_scores" }
  | { type: "set_brightness"; value: number }
  | { type: "set_league"; value: SupportedTickerLeague }
  | { type: "set_display"; value: boolean }
  | { type: "set_show_rankings" | "set_top25_only"; value: boolean }
  | { type: "set_duration"; value: number }
  | { type: "set_view"; value: Exclude<TickerViewMode, "schedule"> }
  | { type: "set_team_schedule"; value: number };
export type TickerCommandType = TickerCommand["type"];
export interface TickerStatus {
  canRename?: boolean;
  protocolVersion: 1 | 2 | 3;
  settings: TickerSettings;
  capabilities: TickerCommandType[];
  wifi: "unknown" | "connected" | "disconnected";
  firmwareVersion: string | null;
}
export interface TickerCommandResponse {
  id: number;
  command: TickerCommandType;
  result: "ok" | "unsupported" | "unauthorized" | "invalid" | "failed";
  status: TickerStatus;
}
