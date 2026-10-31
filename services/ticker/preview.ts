import { rotationSignature } from "./rotation";
import { createStore } from "zustand/vanilla";
import type { TickerController, TickerState } from "./controller";
import type { TickerCommand, TickerSettings } from "../../types/ticker";
import { favoriteTeamsSignature } from "./favorites";
import { normalizeCustomHeader } from "./customHeader";

export type TickerPreviewScenario =
  | "ready"
  | "locked"
  | "offline"
  | "disconnected";

const device = { id: "preview-ticker", name: "Living Room Ticker" };

function initialState(): TickerState {
  const settings: TickerSettings = {
    brightness: 75,
    selectedLeague: "cfb",
    displayOn: true,
    showRankings: true,
    durationSeconds: 8,
    top25Only: false,
    smartGamePriority: false,
    viewMode: "scores",
    teamId: 57,
    dateFormat: "mm/dd",
    showBroadcast: true,
    favoritesSignature: null,
    rotationSignature: null,
    headerMode: "tempo",
    headerColor: "green",
  };
  return {
    devices: [device],
    selectedDevice: device,
    lastDevice: device,
    connection: "connected",
    bluetooth: "PoweredOn",
    scanning: false,
    settings,
    status: {
      protocolVersion: 10,
      firmwareVersion: "0.14.0",
      canCustomHeader: true,
      canRename: true,
      wifi: "connected",
      settings,
      capabilities: [
        "get_status",
        "get_settings",
        "refresh_scores",
        "set_brightness",
        "set_league",
        "set_display",
        "set_show_rankings",
        "set_top25_only",
        "set_duration",
        "set_view",
        "set_team_schedule",
        "set_date_format",
        "set_show_broadcast",
        "favorites_begin",
        "favorites_chunk",
        "favorites_commit",
        "set_header",
        "set_header_color",
        "rotation_begin",
        "rotation_chunk",
        "rotation_commit",
        "set_smart_priority",
      ],
    },
    authorized: true,
    authorizing: false,
    renaming: false,
    syncingFavorites: false,
    savingRotation: false,
    rotationEntries: [],
    rotationAvailable: true,
    rotationIssue: null,
    savingCustomHeader: false,
    customHeader: "",
    customHeaderAvailable: true,
    customHeaderIssue: null,
    nameAvailable: true,
    nameIssue: null,
    pendingCommands: {},
    error: null,
  };
}

// Entirely local: no BLE transport, persistence, or backend requests.
export function createTickerPreviewController() {
  const store = createStore<TickerState>(initialState);
  const reset = (scenario: TickerPreviewScenario = "ready") => {
    const state = initialState();
    if (scenario === "locked") state.authorized = false;
    if (scenario === "offline" && state.status)
      state.status.wifi = "disconnected";
    if (scenario === "disconnected") {
      state.connection = "disconnected";
      state.authorized = false;
      state.selectedDevice = null;
      state.settings = null;
      state.status = null;
    }
    store.setState(state, true);
  };
  const command = async (input: TickerCommand) => {
    const state = store.getState();
    if (state.connection !== "connected" || !state.settings || !state.status)
      return false;
    if (
      !state.authorized &&
      input.type !== "get_status" &&
      input.type !== "get_settings"
    )
      return false;
    const settings = { ...state.settings };
    if (
      input.type === "set_header" &&
      input.value === "custom" &&
      !state.customHeader
    )
      return false;
    switch (input.type) {
      case "set_header_color":
        settings.headerColor = input.value;
        break;
      case "set_header":
        settings.headerMode = input.value;
        break;
      case "set_date_format":
        settings.dateFormat = input.value;
        break;
      case "set_show_broadcast":
        settings.showBroadcast = input.value;
        break;
      case "set_brightness":
        settings.brightness = input.value;
        break;
      case "set_duration":
        settings.durationSeconds = input.value;
        break;
      case "set_display":
        settings.displayOn = input.value;
        break;
      case "set_show_rankings":
        settings.showRankings = input.value;
        break;
      case "set_smart_priority":
        settings.smartGamePriority = input.value;
        break;
      case "set_top25_only":
        settings.top25Only = input.value;
        break;
      case "set_view":
        settings.viewMode = input.value;
        settings.favoritesSignature = null;
        settings.rotationSignature = null;
        break;
      case "set_team_schedule":
        settings.favoritesSignature = null;
        settings.rotationSignature = null;
        settings.teamId = input.value;
        settings.viewMode = "schedule";
        break;
      case "set_league":
        settings.favoritesSignature = null;
        settings.rotationSignature = null;
        settings.selectedLeague = input.value;
        settings.viewMode = "scores";
        settings.teamId = null;
        settings.top25Only = false;
        break;
    }
    store.setState({
      settings,
      status: { ...state.status, settings },
      error: null,
    });
    return true;
  };
  const reconnect = async () => {
    reset();
    return true;
  };
  const controller: TickerController = {
    store,
    command,
    updateSetting: command,
    saveRotation: async (entries) => {
      const state = store.getState();
      if (
        !state.authorized ||
        state.connection !== "connected" ||
        !state.settings ||
        !state.status
      )
        return false;
      try {
        const signature = rotationSignature(entries);
        const settings = {
          ...state.settings,
          viewMode: "rotation" as const,
          teamId: null,
          favoritesSignature: null,
          rotationSignature: signature,
        };
        store.setState({
          rotationEntries: entries.map((entry) => ({ ...entry })),
          settings,
          status: { ...state.status, settings },
          error: null,
        });
        return true;
      } catch (error) {
        store.setState({
          error:
            error instanceof Error ? error.message : "Unable to save rotation.",
        });
        return false;
      }
    },
    setCustomHeader: async (value) => {
      const state = store.getState();
      if (
        !state.authorized ||
        state.connection !== "connected" ||
        !state.settings ||
        !state.status
      )
        return false;
      try {
        const text = normalizeCustomHeader(value);
        const settings = { ...state.settings, headerMode: "custom" as const };
        store.setState({
          customHeader: text,
          settings,
          status: { ...state.status, settings },
          error: null,
        });
        return true;
      } catch (error) {
        store.setState({
          error:
            error instanceof Error ? error.message : "Enter a valid header.",
        });
        return false;
      }
    },
    showFavorites: async (teams) => {
      const state = store.getState();
      if (!state.authorized || !state.settings || !state.status) return false;
      try {
        const settings = {
          ...state.settings,
          viewMode: "favorites" as const,
          teamId: null,
          favoritesSignature: favoriteTeamsSignature(teams),
          rotationSignature: null,
        };
        store.setState({
          settings,
          status: { ...state.status, settings },
          error: null,
        });
        return true;
      } catch (error) {
        store.setState({
          error:
            error instanceof Error
              ? error.message
              : "Unable to sync favorites.",
        });
        return false;
      }
    },
    reconnect,
    connect: reconnect,
    authorize: async () => {
      if (store.getState().connection !== "connected") return false;
      store.setState({ authorized: true });
      return true;
    },
    rename: async (name) => {
      const state = store.getState();
      if (!state.selectedDevice || !state.authorized) return false;
      const renamed = { ...state.selectedDevice, name };
      store.setState({
        selectedDevice: renamed,
        lastDevice: renamed,
        devices: [renamed],
      });
      return true;
    },
    disconnect: async () => reset("disconnected"),
    startScan: async () => {},
    stopScan: async () => {},
    dispose: async () => {},
  };
  return { controller, reset };
}
