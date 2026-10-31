export type SupportedTickerLeague =
  | "nba"
  | "nfl"
  | "cfb"
  | "mlb"
  | "mcbb"
  | "wnba"
  | "wcbb";
export type TickerViewMode =
  | "scores"
  | "schedule"
  | "ap"
  | "coaches"
  | "cfp"
  | "favorites"
  | "rotation";
export interface TickerRotationEntry {
  league: SupportedTickerLeague | null;
  view: Exclude<TickerViewMode, "rotation">;
  teamId: number | null;
  seconds: number;
}
export type TickerDateFormat = "mm/dd" | "dd/mm" | "mmm d" | "yyyy-mm-dd";
export type TickerHeaderMode = "tempo" | "device_name" | "hidden" | "custom";
export type TickerHeaderColor =
  | "green"
  | "white"
  | "red"
  | "blue"
  | "yellow"
  | "orange"
  | "purple"
  | "cyan";
export interface TickerFavoriteTeam {
  league: SupportedTickerLeague;
  teamId: number;
}
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
  smartGamePriority: boolean | null;
  viewMode: TickerViewMode | null;
  teamId: number | null;
  dateFormat: TickerDateFormat | null;
  showBroadcast: boolean | null;
  favoritesSignature: number | null;
  rotationSignature: number | null;
  headerMode: TickerHeaderMode | null;
  headerColor: TickerHeaderColor | null;
}
export type TickerCommand =
  | { type: "get_status" | "get_settings" | "refresh_scores" }
  | { type: "set_brightness"; value: number }
  | { type: "set_league"; value: SupportedTickerLeague }
  | { type: "set_display"; value: boolean }
  | {
      type: "set_show_rankings" | "set_top25_only" | "set_smart_priority";
      value: boolean;
    }
  | { type: "set_duration"; value: number }
  | {
      type: "set_view";
      value: Exclude<TickerViewMode, "schedule" | "favorites" | "rotation">;
    }
  | { type: "set_team_schedule"; value: number }
  | { type: "set_date_format"; value: TickerDateFormat }
  | { type: "set_show_broadcast"; value: boolean }
  | { type: "favorites_begin"; value: number }
  | { type: "favorites_chunk"; offset: number; teams: TickerFavoriteTeam[] }
  | { type: "favorites_commit"; value: number }
  | { type: "set_header"; value: TickerHeaderMode }
  | { type: "set_header_color"; value: TickerHeaderColor }
  | { type: "rotation_begin"; value: number }
  | { type: "rotation_chunk"; offset: number; entries: TickerRotationEntry[] }
  | { type: "rotation_commit"; value: number };
export type TickerCommandType = TickerCommand["type"];
export interface TickerStatus {
  canRename?: boolean;
  canCustomHeader?: boolean;
  protocolVersion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
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
