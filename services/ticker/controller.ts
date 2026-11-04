import {
  decodeQuietHours,
  quietHoursBytes,
  quietHoursEqual,
  TickerQuietHoursUnavailableError,
} from "./quietHours";
import {
  decodeRotation,
  rotationSignature,
  TickerRotationUnavailableError,
} from "./rotation";
import { normalizeTickerName, TickerNameUnavailableError } from "./name";
import { createStore } from "zustand/vanilla";
import type {
  TickerBluetoothState,
  TickerCommand,
  TickerConnectionState,
  TickerDevice,
  TickerSettings,
  TickerFavoriteTeam,
  TickerRotationEntry,
  TickerStatus,
  TickerQuietHoursConfig,
} from "../../types/ticker";
import {
  decodeFrame,
  encodeCommand,
  LEAGUES,
  tickerSupportsExpandedLeagues,
} from "./protocol";
import {
  pendingFirmwareAuthorization,
  type TickerAuthorizer,
  type TickerTransport,
  type Unsubscribe,
} from "./transport";
import { favoriteTeamsSignature } from "./favorites";
import {
  normalizeCustomHeader,
  encodeCustomHeader,
  supportsHeaderEmoji,
  TickerCustomHeaderUnavailableError,
} from "./customHeader";

export interface TickerState {
  devices: TickerDevice[];
  selectedDevice: TickerDevice | null;
  lastDevice: TickerDevice | null;
  connection: TickerConnectionState;
  bluetooth: TickerBluetoothState;
  scanning: boolean;
  settings: TickerSettings | null;
  status: TickerStatus | null;
  authorized: boolean;
  authorizing: boolean;
  renaming: boolean;
  syncingFavorites: boolean;
  savingQuietHours: boolean;
  quietHoursConfig: TickerQuietHoursConfig | null;
  quietHoursConfigured: boolean;
  quietHoursAvailable: boolean;
  quietHoursIssue: string | null;
  savingRotation: boolean;
  rotationEntries: TickerRotationEntry[] | null;
  rotationAvailable: boolean;
  rotationIssue: string | null;
  savingCustomHeader: boolean;
  customHeader: string | null;
  customHeaderAvailable: boolean;
  customHeaderIssue: string | null;
  nameAvailable: boolean;
  nameIssue: string | null;
  pendingCommands: Record<number, TickerCommand["type"]>;
  error: string | null;
}
export const connectionBusy = (state: TickerConnectionState) =>
  state === "connecting" || state === "verifying";
export const hasBlockingTickerCommand = (
  pendingCommands: TickerState["pendingCommands"],
) => Object.values(pendingCommands).some((type) => type !== "set_brightness");
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Bluetooth operation failed. Please retry.";
const bluetoothMessage = (state: TickerBluetoothState) =>
  ({
    PoweredOff: "Bluetooth is off. Turn it on in Settings, then retry.",
    Unauthorized:
      "Bluetooth permission denied. Allow Tempo to use Bluetooth in device Settings.",
    Unsupported:
      "Bluetooth is unavailable. Use a physical device with a development build.",
    Unknown: "Bluetooth is starting. Please retry.",
    Resetting: "Bluetooth is resetting. Please retry.",
    PoweredOn: "",
  })[state];

type LiveSetting = Extract<
  TickerCommand,
  { type: "set_brightness" | "set_league" }
>;

export function createTickerController(
  transport: TickerTransport,
  authorizer: TickerAuthorizer = pendingFirmwareAuthorization,
  timeouts = { command: 8000, connection: 20000, scan: 12000 },
  options: {
    authorizeOnConnect?: boolean;
    authorizationTimeoutMs?: number;
  } = {},
) {
  const store = createStore<TickerState>(() => ({
    devices: [],
    selectedDevice: null,
    lastDevice: null,
    connection: "disconnected",
    bluetooth: "Unknown",
    scanning: false,
    settings: null,
    status: null,
    authorized: false,
    authorizing: false,
    renaming: false,
    syncingFavorites: false,
    savingQuietHours: false,
    quietHoursConfig: null,
    quietHoursConfigured: false,
    quietHoursAvailable: false,
    quietHoursIssue: null,
    savingRotation: false,
    rotationEntries: null,
    rotationAvailable: false,
    rotationIssue: null,
    savingCustomHeader: false,
    customHeader: null,
    customHeaderAvailable: false,
    customHeaderIssue: null,
    nameAvailable: false,
    nameIssue: null,
    pendingCommands: {},
    error: null,
  }));
  let generation = 0;
  let scanGeneration = 0;
  let scanTimer: ReturnType<typeof setTimeout> | undefined;
  let requestId = 0; // Never reused in a manager lifetime, including reconnects.
  let subscriptions: Unsubscribe[] = [];
  let disposed = false;
  let drainingSettings = false;
  type QueuedChange =
    | TickerCommand
    | { type: "rename"; value: string }
    | { type: "custom_header"; value: string }
    | { type: "save_rotation"; entries: TickerRotationEntry[] }
    | { type: "show_favorites"; teams: TickerFavoriteTeam[] };
  const queuedSettings = new Map<
    QueuedChange["type"],
    { command: QueuedChange; resolve: (applied: boolean) => void }
  >();
  const enqueueChange = (next: QueuedChange): Promise<boolean> =>
    new Promise((resolve) => {
      queuedSettings.get(next.type)?.resolve(false);
      queuedSettings.set(next.type, { command: next, resolve });
      void drainSettings();
    });
  const cancelQueuedSettings = () => {
    queuedSettings.forEach(({ resolve }) => resolve(false));
    queuedSettings.clear();
  };
  let cleanup: Promise<void> = Promise.resolve();
  const cancelDevice = (id: string) => {
    const next = cleanup.then(() => transport.disconnect(id));
    cleanup = next.catch(() => {});
    return next;
  };
  const pending = new Map<
    number,
    {
      type: TickerCommand["type"];
      resolve: (status: TickerStatus) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  const applyStatus = (status: TickerStatus) =>
    store.setState({ status, settings: status.settings });
  const rejectPending = (reason: string) => {
    pending.forEach((entry) => {
      clearTimeout(entry.timer);
      entry.reject(new Error(reason));
    });
    pending.clear();
    store.setState({ pendingCommands: {} });
  };
  const clearConnection = () => {
    cancelQueuedSettings();
    subscriptions.forEach((unsubscribe) => unsubscribe());
    subscriptions = [];
    rejectPending("Device disconnected. Reconnect before sending commands.");
    store.setState({
      connection: "disconnected",
      authorized: false,
      authorizing: false,
      renaming: false,
      syncingFavorites: false,
      savingQuietHours: false,
      quietHoursConfig: null,
      quietHoursConfigured: false,
      quietHoursAvailable: false,
      quietHoursIssue: null,
      savingRotation: false,
      rotationEntries: null,
      rotationAvailable: false,
      rotationIssue: null,
      savingCustomHeader: false,
      customHeader: null,
      customHeaderAvailable: false,
      customHeaderIssue: null,
      nameAvailable: false,
      nameIssue: null,
      status: null,
      settings: null,
    });
  };
  const stopScan = async () => {
    scanGeneration++;
    clearTimeout(scanTimer);
    store.setState({ scanning: false });
    await transport.stopScan().catch(() => {});
  };
  const disconnect = async () => {
    const token = ++generation;
    const id = store.getState().selectedDevice?.id;
    void stopScan();
    clearConnection();
    store.setState({ error: null });
    if (id)
      await cancelDevice(id).catch((error) => {
        if (token === generation) store.setState({ error: message(error) });
      });
  };
  const stateChanged = (bluetooth: TickerBluetoothState) => {
    if (disposed) return;
    store.setState({ bluetooth });
    if (bluetooth !== "PoweredOn") {
      const active =
        store.getState().scanning ||
        store.getState().connection !== "disconnected";
      generation++;
      const id = store.getState().selectedDevice?.id;
      void stopScan();
      clearConnection();
      if (active) store.setState({ error: bluetoothMessage(bluetooth) });
      if (id) void cancelDevice(id).catch(() => {});
    }
  };
  const prepare = async () => {
    const bluetooth = await transport.prepare(stateChanged);
    store.setState({ bluetooth });
    if (bluetooth !== "PoweredOn") throw new Error(bluetoothMessage(bluetooth));
  };
  const startScan = async () => {
    if (
      disposed ||
      connectionBusy(store.getState().connection) ||
      store.getState().connection === "connected"
    )
      return;
    const stopped = stopScan();
    const token = ++scanGeneration;
    store.setState({ devices: [], error: null, scanning: true });
    try {
      await stopped;
      if (token !== scanGeneration || disposed) return;
      await prepare();
      if (token !== scanGeneration || disposed) return;
      await transport.scan(
        (device) => {
          if (token !== scanGeneration) return;
          store.setState((state) => ({
            devices: [
              ...state.devices.filter((item) => item.id !== device.id),
              device,
            ],
          }));
        },
        (error) => {
          if (token !== scanGeneration) return;
          void stopScan();
          store.setState({ error: message(error) });
        },
      );
      if (token === scanGeneration)
        scanTimer = setTimeout(() => void stopScan(), timeouts.scan);
    } catch (error) {
      if (token === scanGeneration) {
        await stopScan();
        store.setState({ error: message(error) });
      }
    }
  };
  const executeCommand = async (
    command: TickerCommand,
    exclusiveChange = false,
  ): Promise<boolean> => {
    const state = store.getState();
    const token = generation;
    let id = 0;
    let applied = false;
    try {
      if (
        state.connection !== "connected" ||
        !state.selectedDevice ||
        state.bluetooth !== "PoweredOn"
      )
        throw new Error(
          "Device disconnected. Reconnect before sending commands.",
        );
      if (state.authorizing)
        throw new Error("Finish Bluetooth pairing before sending commands.");
      if (
        pending.size ||
        state.renaming ||
        ((state.syncingFavorites ||
          state.savingCustomHeader ||
          state.savingRotation ||
          state.savingQuietHours) &&
          !exclusiveChange)
      )
        throw new Error("Wait for the current ticker command to finish.");
      if (
        command.type === "set_league" &&
        LEAGUES.indexOf(command.value) > 2 &&
        !tickerSupportsExpandedLeagues(state.status?.firmwareVersion)
      )
        throw new Error("This league requires firmware 0.4.0 or newer.");
      if (!state.status?.capabilities.includes(command.type))
        throw new Error("This control is not supported by the firmware.");
      if (
        !["get_status", "get_settings"].includes(command.type) &&
        !state.authorized
      )
        throw new Error(
          "Pair your ticker using Unlock controls before changing its settings.",
        );
      id = ++requestId;
      const frame = encodeCommand(
        id,
        command,
        state.status?.protocolVersion ?? 1,
      );
      store.setState({ error: null, pendingCommands: { [id]: command.type } });
      const response = new Promise<TickerStatus>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(
            new Error(
              "Command timed out. Device changes were not confirmed; refresh status before retrying.",
            ),
          );
        }, timeouts.command);
        pending.set(id, { type: command.type, resolve, reject, timer });
      });
      // Race the native write against the response deadline; native writes may never settle.
      void transport.write(state.selectedDevice.id, frame).catch((error) => {
        const entry = pending.get(id);
        if (entry) {
          pending.delete(id);
          clearTimeout(entry.timer);
          entry.reject(new Error(message(error)));
        }
      });
      const confirmed = await response;
      if (token !== generation) return false;
      if (
        (command.type === "set_brightness" &&
          confirmed.settings.brightness !== command.value) ||
        (command.type === "set_league" &&
          confirmed.settings.selectedLeague !== command.value) ||
        (command.type === "set_display" &&
          confirmed.settings.displayOn !== command.value) ||
        (command.type === "set_show_rankings" &&
          confirmed.settings.showRankings !== command.value) ||
        (command.type === "set_duration" &&
          confirmed.settings.durationSeconds !== command.value) ||
        (command.type === "set_quiet_hours" &&
          confirmed.settings.quietHoursEnabled !== command.value.enabled) ||
        (command.type === "set_quiet_override" &&
          confirmed.settings.quietHoursOverride !== command.value) ||
        (command.type === "set_smart_priority" &&
          confirmed.settings.smartGamePriority !== command.value) ||
        (command.type === "set_top25_only" &&
          confirmed.settings.top25Only !== command.value) ||
        (command.type === "set_date_format" &&
          confirmed.settings.dateFormat !== command.value) ||
        (command.type === "set_show_broadcast" &&
          confirmed.settings.showBroadcast !== command.value) ||
        (command.type === "set_header" &&
          confirmed.settings.headerMode !== command.value) ||
        (command.type === "set_header_color" &&
          confirmed.settings.headerColor !== command.value) ||
        (command.type === "rotation_commit" &&
          (confirmed.settings.viewMode !== "rotation" ||
            confirmed.settings.rotationSignature !== command.value)) ||
        (command.type === "favorites_commit" &&
          (confirmed.settings.viewMode !== "favorites" ||
            confirmed.settings.favoritesSignature !== command.value))
      )
        throw new Error(
          "Device acknowledgment did not confirm the requested setting. Refresh status and retry.",
        );
      applyStatus(confirmed);
      applied = true;
      return true;
    } catch (error) {
      if (token === generation) store.setState({ error: message(error) });
      return false;
    } finally {
      const entry = pending.get(id);
      if (entry) clearTimeout(entry.timer);
      pending.delete(id);
      if (id !== 0 && token === generation)
        store.setState({
          pendingCommands: Object.fromEntries(
            [...pending].map(([key, entry]) => [key, entry.type]),
          ),
        });
      if (id !== 0 && !applied && token === generation) cancelQueuedSettings();
      void drainSettings();
    }
  };
  const brightnessPending = () =>
    Object.values(store.getState().pendingCommands).includes("set_brightness");
  const command = (next: TickerCommand): Promise<boolean> => {
    if (next.type === "set_quiet_hours") {
      const snapshot = { ...next.value };
      return brightnessPending()
        ? enqueueChange({ type: "set_quiet_hours", value: snapshot })
        : executeQuietHours(snapshot);
    }
    return brightnessPending() ? enqueueChange(next) : executeCommand(next);
  };
  // Keep BLE writes serialized, retaining only the newest unsent value for
  // each control. Other actions can wait behind a live brightness update.
  const drainSettings = async () => {
    if (
      drainingSettings ||
      store.getState().renaming ||
      store.getState().syncingFavorites ||
      store.getState().savingCustomHeader ||
      store.getState().savingRotation ||
      store.getState().savingQuietHours ||
      Object.keys(store.getState().pendingCommands).length
    )
      return;
    drainingSettings = true;
    const token = generation;
    try {
      while (queuedSettings.size && token === generation) {
        const [type, entry] = queuedSettings.entries().next().value!;
        queuedSettings.delete(type);
        const state = store.getState();
        const alreadyApplied =
          state.connection === "connected" &&
          state.authorized &&
          (entry.command.type === "set_brightness"
            ? state.settings?.brightness === entry.command.value
            : entry.command.type === "set_league" &&
              state.settings?.selectedLeague === entry.command.value &&
              (state.settings.viewMode == null ||
                state.settings.viewMode === "scores"));
        const applied =
          alreadyApplied ||
          (await (entry.command.type === "set_quiet_hours"
            ? executeQuietHours(entry.command.value, true)
            : entry.command.type === "save_rotation"
              ? executeSaveRotation(entry.command.entries, true)
              : entry.command.type === "custom_header"
                ? executeCustomHeader(entry.command.value, true)
                : entry.command.type === "show_favorites"
                  ? executeShowFavorites(entry.command.teams, true)
                  : entry.command.type === "rename"
                    ? executeRename(entry.command.value, true)
                    : executeCommand(entry.command)));
        entry.resolve(applied);
        if (!applied && token === generation) cancelQueuedSettings();
      }
    } finally {
      drainingSettings = false;
      // A reconnect may have queued new intent while an old command settled.
      if (queuedSettings.size) void drainSettings();
    }
  };
  const updateSetting = (next: LiveSetting): Promise<boolean> => {
    const state = store.getState();
    if (
      state.connection !== "connected" ||
      !state.authorized ||
      state.authorizing ||
      state.renaming ||
      state.syncingFavorites ||
      state.savingCustomHeader ||
      state.savingRotation ||
      state.savingQuietHours
    )
      return Promise.resolve(false);
    // Validate before replacing valid queued intent or skipping a no-op.
    try {
      encodeCommand(1, next, state.status?.protocolVersion ?? 1);
      if (!state.status?.capabilities.includes(next.type))
        throw new Error("This control is not supported by the firmware.");
    } catch (error) {
      store.setState({ error: message(error) });
      return Promise.resolve(false);
    }
    return enqueueChange(next);
  };
  const executeShowFavorites = async (
    teams: TickerFavoriteTeam[],
    fromQueue = false,
  ): Promise<boolean> => {
    const token = generation;
    let started = false;
    try {
      const signature = favoriteTeamsSignature(teams);
      const state = store.getState();
      if (
        state.connection !== "connected" ||
        !state.authorized ||
        state.authorizing
      )
        throw new Error(
          "Connect and unlock your ticker before syncing favorite teams.",
        );
      if (!state.status?.capabilities.includes("favorites_commit"))
        throw new Error("Favorites mode requires firmware 0.8.0 or newer.");
      if (
        state.renaming ||
        state.syncingFavorites ||
        state.savingCustomHeader ||
        state.savingRotation ||
        state.savingQuietHours ||
        pending.size ||
        (!fromQueue && drainingSettings)
      )
        throw new Error("Wait for the current ticker change to finish.");
      started = true;
      store.setState({ syncingFavorites: true, error: null });
      const commands: TickerCommand[] = [
        { type: "favorites_begin", value: teams.length },
      ];
      for (let offset = 0; offset < teams.length; offset += 3)
        commands.push({
          type: "favorites_chunk",
          offset,
          teams: teams.slice(offset, offset + 3),
        });
      commands.push({ type: "favorites_commit", value: signature });
      for (const command of commands) {
        if (token !== generation || !(await executeCommand(command, true)))
          return false;
      }
      return token === generation;
    } catch (error) {
      if (token === generation) store.setState({ error: message(error) });
      return false;
    } finally {
      if (started && token === generation)
        store.setState({ syncingFavorites: false });
      if (started) void drainSettings();
    }
  };
  const showFavorites = (teams: TickerFavoriteTeam[]): Promise<boolean> => {
    const snapshot = teams.map((team) => ({ ...team }));
    return brightnessPending()
      ? enqueueChange({ type: "show_favorites", teams: snapshot })
      : executeShowFavorites(snapshot);
  };
  const connect = async (device: TickerDevice): Promise<boolean> => {
    if (
      disposed ||
      connectionBusy(store.getState().connection) ||
      store.getState().connection === "connected"
    )
      return false;
    store.setState({ connection: "connecting" });
    const stopped = stopScan();
    const token = ++generation;
    clearConnection();
    store.setState({
      selectedDevice: device,
      connection: "connecting",
      error: null,
    });
    const current = () => token === generation && !disposed;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const work = async () => {
      await stopped;
      if (!current()) throw new Error("Connection cancelled.");
      await prepare();
      if (!current()) throw new Error("Connection cancelled.");
      await cleanup;
      if (!current()) throw new Error("Connection cancelled.");
      await transport.connect(device.id);
      if (!current()) {
        // A cancelled native attempt may settle after a new attempt for the same
        // peripheral. Do not cancel the new connection while cleaning up the old one.
        const active = store.getState();
        if (
          active.selectedDevice?.id !== device.id ||
          (!connectionBusy(active.connection) &&
            active.connection !== "connected")
        ) {
          await cancelDevice(device.id).catch(() => {});
        }
        throw new Error("Connection cancelled.");
      }
      subscriptions.push(
        transport.onDisconnect(device.id, () => {
          if (!current()) return;
          generation++;
          clearConnection();
          store.setState({
            error: "Device disconnected. Move closer and reconnect.",
          });
        }),
      );
      store.setState({ connection: "verifying" });
      await transport.discover(device.id);
      if (!current()) throw new Error("Connection cancelled.");
      const frame = decodeFrame(await transport.readStatus(device.id));
      if (!current()) throw new Error("Connection cancelled.");
      if (frame.kind !== "status")
        throw new Error(
          "Unsupported firmware/protocol: missing device status.",
        );
      let confirmedDevice = device;
      let nameAvailable = false;
      let nameIssue: string | null = null;
      if (frame.status.canRename) {
        if (!transport.readName)
          throw new Error("Ticker name reading is unavailable in this build.");
        try {
          const name = normalizeTickerName(await transport.readName(device.id));
          if (!current()) throw new Error("Connection cancelled.");
          confirmedDevice = { ...device, name };
          nameAvailable = true;
        } catch (error) {
          if (!current() || !(error instanceof TickerNameUnavailableError))
            throw error;
          // Name support is optional: a cached pre-rename GATT table must not
          // disconnect a ticker whose status and ordinary controls are valid.
          nameIssue = error.message;
        }
      }
      let customHeader: string | null = null;
      let customHeaderAvailable = false;
      let customHeaderIssue: string | null = null;
      if (frame.status.canCustomHeader) {
        try {
          if (!transport.readCustomHeader)
            throw new TickerCustomHeaderUnavailableError();
          const reported = await transport.readCustomHeader(device.id);
          if (!current()) throw new Error("Connection cancelled.");
          if (reported && normalizeCustomHeader(reported) !== reported)
            throw new Error("The ticker reported an invalid custom header.");
          customHeader = reported;
          customHeaderAvailable = true;
        } catch (error) {
          if (
            !current() ||
            !(error instanceof TickerCustomHeaderUnavailableError)
          )
            throw error;
          customHeaderIssue = error.message;
        }
      }
      let rotationEntries: TickerRotationEntry[] | null = null;
      let rotationAvailable = false;
      let rotationIssue: string | null = null;
      if (frame.status.protocolVersion >= 9) {
        try {
          if (!transport.readRotation)
            throw new TickerRotationUnavailableError();
          const reported = decodeRotation(
            await transport.readRotation(device.id),
          );
          if (!current()) throw new Error("Connection cancelled.");
          if (
            frame.status.settings.viewMode === "rotation" &&
            (!reported.enabled ||
              rotationSignature(reported.entries) !==
                frame.status.settings.rotationSignature)
          )
            throw new Error(
              "The ticker’s active rotation did not match its saved list.",
            );
          rotationEntries = reported.entries;
          rotationAvailable = true;
        } catch (error) {
          if (!current() || !(error instanceof TickerRotationUnavailableError))
            throw error;
          rotationIssue = error.message;
        }
      }
      let quietHoursConfig: TickerQuietHoursConfig | null = null;
      let quietHoursConfigured = false;
      let quietHoursAvailable = false;
      let quietHoursIssue: string | null = null;
      if (frame.status.protocolVersion >= 11) {
        try {
          if (!transport.readQuietHours)
            throw new TickerQuietHoursUnavailableError();
          const reported = decodeQuietHours(
            await transport.readQuietHours(device.id),
          );
          if (!current()) throw new Error("Connection cancelled.");
          if (
            reported.config.enabled !== frame.status.settings.quietHoursEnabled
          )
            throw new Error(
              "The ticker's quiet-hours schedule did not match its status.",
            );
          quietHoursConfig = reported.config;
          quietHoursConfigured = reported.configured;
          quietHoursAvailable = true;
        } catch (error) {
          if (
            !current() ||
            !(error instanceof TickerQuietHoursUnavailableError)
          )
            throw error;
          quietHoursIssue = error.message;
        }
      }
      applyStatus(frame.status);
      subscriptions.push(
        transport.monitor(
          device.id,
          (bytes) => {
            if (!current()) return;
            try {
              const incoming = decodeFrame(bytes);
              if (incoming.kind === "status") {
                applyStatus(incoming.status);
                return;
              }
              const response = incoming.response;
              const entry = pending.get(response.id);
              if (!entry || entry.type !== response.command) return;
              clearTimeout(entry.timer);
              pending.delete(response.id);
              if (response.result === "unauthorized")
                store.setState({ authorized: false });
              if (response.result !== "ok")
                entry.reject(
                  new Error(
                    `Command ${response.result}. ${response.result === "unauthorized" ? "Authorization required." : "Please retry or check firmware support."}`,
                  ),
                );
              else entry.resolve(response.status);
            } catch (error) {
              generation++;
              clearConnection();
              store.setState({ connection: "error", error: message(error) });
              void cancelDevice(device.id).catch(() => {});
            }
          },
          (error) => {
            if (!current()) return;
            generation++;
            clearConnection();
            store.setState({
              connection: "error",
              error: `Device notifications unavailable: ${message(error)}`,
            });
            void cancelDevice(device.id).catch(() => {});
          },
        ),
      );
      const authorized = options.authorizeOnConnect
        ? await authorizer.verify(device)
        : false;
      if (!current()) throw new Error("Connection cancelled.");
      store.setState({
        connection: "connected",
        authorized,
        nameAvailable,
        nameIssue,
        customHeader,
        customHeaderAvailable,
        customHeaderIssue,
        rotationEntries,
        rotationAvailable,
        rotationIssue,
        quietHoursConfig,
        quietHoursConfigured,
        quietHoursAvailable,
        quietHoursIssue,
        selectedDevice: confirmedDevice,
        lastDevice: { id: confirmedDevice.id, name: confirmedDevice.name },
      });
      // Read-only synchronization is permitted before device authorization.
      await command({ type: "get_settings" });
      return current() && store.getState().connection === "connected";
    };
    try {
      return await Promise.race([
        work(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(
                new Error(
                  "Connection timed out. Move closer to the ticker and retry.",
                ),
              ),
            timeouts.connection,
          );
        }),
      ]);
    } catch (error) {
      if (current()) {
        generation++;
        clearConnection();
        store.setState({ connection: "error", error: message(error) });
        await cancelDevice(device.id).catch(() => {});
      }
      return false;
    } finally {
      clearTimeout(timer);
    }
  };
  const authorize = async (): Promise<boolean> => {
    const state = store.getState();
    const token = generation;
    if (
      state.connection !== "connected" ||
      !state.selectedDevice ||
      state.authorizing ||
      state.renaming ||
      state.syncingFavorites ||
      state.savingCustomHeader ||
      state.savingRotation ||
      state.savingQuietHours ||
      pending.size
    )
      return false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    store.setState({ authorizing: true, authorized: false, error: null });
    try {
      const verifyAndRefresh = async () => {
        if (!(await authorizer.verify(state.selectedDevice!))) {
          throw new Error(
            "Pairing was not completed. Upload firmware 0.2.0 or newer, then try Unlock controls again.",
          );
        }
        if (token !== generation)
          throw new Error("Connection changed during pairing.");
        const frame = decodeFrame(
          await transport.readStatus(state.selectedDevice!.id),
        );
        if (frame.kind !== "status")
          throw new Error("Invalid device status after pairing.");
        return frame;
      };
      const frame = await Promise.race([
        verifyAndRefresh(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(
                new Error(
                  "Pairing timed out. Try Unlock controls again and enter the code shown on the ticker in the device Bluetooth prompt.",
                ),
              ),
            options.authorizationTimeoutMs ?? 90000,
          );
        }),
      ]);
      if (token !== generation) return false;
      applyStatus(frame.status);
      store.setState({ authorized: true });
      return true;
    } catch (error) {
      if (token === generation)
        store.setState({
          authorized: false,
          error: `Unable to unlock ticker: ${message(error)}`,
        });
      return false;
    } finally {
      clearTimeout(timer);
      if (token === generation) store.setState({ authorizing: false });
    }
  };
  const executeRename = async (
    value: string,
    fromQueue = false,
  ): Promise<boolean> => {
    const state = store.getState();
    const token = generation;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    let started = false;
    try {
      const name = normalizeTickerName(value);
      if (
        state.connection !== "connected" ||
        !state.selectedDevice ||
        state.bluetooth !== "PoweredOn"
      )
        throw new Error("Connect your ticker before renaming it.");
      if (!state.authorized || state.authorizing)
        throw new Error("Unlock controls before renaming your ticker.");
      if (
        state.renaming ||
        state.syncingFavorites ||
        state.savingCustomHeader ||
        state.savingRotation ||
        state.savingQuietHours ||
        pending.size ||
        (!fromQueue && (queuedSettings.size || drainingSettings))
      )
        throw new Error("Wait for the current ticker change to finish.");
      if (
        !state.status?.canRename ||
        !state.nameAvailable ||
        !transport.readName ||
        !transport.writeName
      )
        throw new Error(
          state.nameIssue ??
            "Renaming requires ticker firmware 0.6.0 or newer.",
        );
      if (state.selectedDevice.name === name) {
        store.setState({ error: null });
        return true;
      }
      started = true;
      store.setState({ renaming: true, error: null });
      const device = state.selectedDevice;
      const saveAndRead = async () => {
        await transport.writeName!(device.id, name);
        if (token !== generation)
          throw new Error("Connection changed while renaming.");
        const confirmed = await transport.readName!(device.id);
        if (token !== generation)
          throw new Error("Connection changed while renaming.");
        if (confirmed !== name)
          throw new Error(
            "The ticker did not confirm the new name. Please try again.",
          );
        return confirmed;
      };
      const confirmed = await Promise.race([
        saveAndRead(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            timedOut = true;
            reject(
              new Error(
                "Name change was not confirmed. Reconnect to check your ticker’s name.",
              ),
            );
          }, timeouts.command);
        }),
      ]);
      if (token !== generation) return false;
      store.setState((latest) => ({
        selectedDevice: { ...device, name: confirmed },
        lastDevice: { id: device.id, name: confirmed },
        devices: latest.devices.map((item) =>
          item.id === device.id ? { ...item, name: confirmed } : item,
        ),
      }));
      return true;
    } catch (error) {
      if (token === generation) {
        if (timedOut) {
          generation++;
          clearConnection();
          store.setState({ connection: "error", error: message(error) });
          if (state.selectedDevice)
            void cancelDevice(state.selectedDevice.id).catch(() => {});
        } else store.setState({ error: message(error) });
      }
      return false;
    } finally {
      clearTimeout(timer);
      if (started && token === generation) store.setState({ renaming: false });
      if (started) void drainSettings();
    }
  };
  const rename = (value: string): Promise<boolean> =>
    brightnessPending()
      ? enqueueChange({ type: "rename", value })
      : executeRename(value);
  const executeCustomHeader = async (
    value: string,
    fromQueue = false,
  ): Promise<boolean> => {
    const state = store.getState();
    const token = generation;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;
    let started = false;
    const current = () => token === generation && !timedOut;
    try {
      const text = normalizeCustomHeader(value);
      if (
        state.connection !== "connected" ||
        !state.selectedDevice ||
        state.bluetooth !== "PoweredOn"
      )
        throw new Error(
          "Connect your ticker before changing its custom header.",
        );
      if (!state.authorized || state.authorizing)
        throw new Error("Unlock controls before changing the header.");
      if (
        state.renaming ||
        state.syncingFavorites ||
        state.savingCustomHeader ||
        state.savingRotation ||
        state.savingQuietHours ||
        pending.size ||
        (!fromQueue && (queuedSettings.size || drainingSettings))
      )
        throw new Error("Wait for the current ticker change to finish.");
      if (
        !state.status?.canCustomHeader ||
        !state.customHeaderAvailable ||
        !transport.readCustomHeader ||
        !transport.writeCustomHeader
      )
        throw new Error(
          state.customHeaderIssue ??
            "Custom headers require firmware 0.11.0 or newer.",
        );
      if (
        encodeCustomHeader(text).some((byte) => byte >= 0x80) &&
        !supportsHeaderEmoji(state.status?.firmwareVersion)
      )
        throw new Error("Header emojis require firmware 0.13.0 or newer.");
      if (
        state.customHeader === text &&
        state.settings?.headerMode === "custom"
      ) {
        store.setState({ error: null });
        return true;
      }
      started = true;
      store.setState({ savingCustomHeader: true, error: null });
      const device = state.selectedDevice;
      const saveAndRead = async () => {
        await transport.writeCustomHeader!(device.id, text);
        if (!current())
          throw new Error("Connection changed while saving the header.");
        const confirmed = await transport.readCustomHeader!(device.id);
        if (!current())
          throw new Error("Connection changed while saving the header.");
        if (confirmed !== text)
          throw new Error(
            "The ticker did not confirm the custom header. Please try again.",
          );
        return confirmed;
      };
      const confirmed = await Promise.race([
        saveAndRead(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            timedOut = true;
            reject(
              new Error(
                "Custom header was not confirmed. Reconnect to check your ticker’s header.",
              ),
            );
          }, timeouts.command);
        }),
      ]);
      clearTimeout(timer);
      if (!current()) return false;
      store.setState({ customHeader: confirmed });
      return await executeCommand(
        { type: "set_header", value: "custom" },
        true,
      );
    } catch (error) {
      if (token === generation) {
        if (timedOut) {
          generation++;
          clearConnection();
          store.setState({ connection: "error", error: message(error) });
          if (state.selectedDevice)
            void cancelDevice(state.selectedDevice.id).catch(() => {});
        } else store.setState({ error: message(error) });
      }
      return false;
    } finally {
      clearTimeout(timer);
      if (started && token === generation)
        store.setState({ savingCustomHeader: false });
      if (started) void drainSettings();
    }
  };
  const setCustomHeader = (value: string): Promise<boolean> =>
    brightnessPending()
      ? enqueueChange({ type: "custom_header", value })
      : executeCustomHeader(value);
  const executeSaveRotation = async (
    entries: TickerRotationEntry[],
    fromQueue = false,
  ): Promise<boolean> => {
    const token = generation;
    let started = false;
    try {
      const signature = rotationSignature(entries);
      const state = store.getState();
      if (
        state.connection !== "connected" ||
        !state.authorized ||
        state.authorizing
      )
        throw new Error(
          "Connect and unlock your ticker before saving a rotation.",
        );
      if (
        !state.status?.capabilities.includes("rotation_commit") ||
        !state.rotationAvailable
      )
        throw new Error(
          state.rotationIssue ??
            "Custom rotation requires firmware 0.12.0 or newer.",
        );
      if (
        state.renaming ||
        state.syncingFavorites ||
        state.savingCustomHeader ||
        state.savingRotation ||
        state.savingQuietHours ||
        pending.size ||
        (!fromQueue && drainingSettings)
      )
        throw new Error("Wait for the current ticker change to finish.");
      started = true;
      store.setState({ savingRotation: true, error: null });
      const commands: TickerCommand[] = [
        { type: "rotation_begin", value: entries.length },
      ];
      for (let offset = 0; offset < entries.length; offset += 2)
        commands.push({
          type: "rotation_chunk",
          offset,
          entries: entries.slice(offset, offset + 2),
        });
      commands.push({ type: "rotation_commit", value: signature });
      for (const command of commands)
        if (token !== generation || !(await executeCommand(command, true)))
          return false;
      if (token !== generation) return false;
      store.setState({ rotationEntries: entries });
      return true;
    } catch (error) {
      if (token === generation) store.setState({ error: message(error) });
      return false;
    } finally {
      if (started && token === generation)
        store.setState({ savingRotation: false });
      if (started) void drainSettings();
    }
  };
  const saveRotation = (entries: TickerRotationEntry[]): Promise<boolean> => {
    const snapshot = entries.map((entry) => ({ ...entry }));
    return brightnessPending()
      ? enqueueChange({ type: "save_rotation", entries: snapshot })
      : executeSaveRotation(snapshot);
  };
  const executeQuietHours = async (
    config: TickerQuietHoursConfig,
    fromQueue = false,
  ): Promise<boolean> => {
    const token = generation,
      state = store.getState();
    let started = false,
      timedOut = false;
    let readingBack = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      quietHoursBytes(config);
      if (
        state.connection !== "connected" ||
        !state.selectedDevice ||
        !state.authorized ||
        state.authorizing
      )
        throw new Error(
          "Connect and unlock your ticker before changing quiet hours.",
        );
      if (
        !state.status?.capabilities.includes("set_quiet_hours") ||
        !state.quietHoursAvailable ||
        !transport.readQuietHours
      )
        throw new Error(
          state.quietHoursIssue ??
            "Quiet hours requires firmware 0.15.0 or newer.",
        );
      if (
        state.renaming ||
        state.syncingFavorites ||
        state.savingRotation ||
        state.savingCustomHeader ||
        state.savingQuietHours ||
        pending.size ||
        (!fromQueue && drainingSettings)
      )
        throw new Error("Wait for the current ticker change to finish.");
      if (
        state.quietHoursConfigured &&
        state.quietHoursConfig &&
        quietHoursEqual(config, state.quietHoursConfig)
      ) {
        store.setState({ error: null });
        return true;
      }
      started = true;
      store.setState({ savingQuietHours: true, error: null });
      if (
        !(await executeCommand(
          { type: "set_quiet_hours", value: config },
          true,
        )) ||
        token !== generation
      )
        return false;
      readingBack = true;
      const bytes = await Promise.race([
        transport.readQuietHours(state.selectedDevice.id),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            timedOut = true;
            reject(
              new Error(
                "Quiet hours was not confirmed. Reconnect to check the schedule.",
              ),
            );
          }, timeouts.command);
        }),
      ]);
      clearTimeout(timer);
      if (token !== generation) return false;
      const reported = decodeQuietHours(bytes);
      if (!reported.configured || !quietHoursEqual(reported.config, config)) {
        store.setState({
          quietHoursAvailable: false,
          quietHoursIssue:
            "The quiet-hours schedule did not match. Reconnect to load the ticker's saved schedule.",
        });
        throw new Error(
          "The ticker did not confirm the requested quiet-hours schedule. Reconnect and try again.",
        );
      }
      store.setState({
        quietHoursConfig: reported.config,
        quietHoursConfigured: true,
      });
      return true;
    } catch (error) {
      if (token === generation) {
        if (timedOut) {
          generation++;
          clearConnection();
          store.setState({ connection: "error", error: message(error) });
          if (state.selectedDevice)
            void cancelDevice(state.selectedDevice.id).catch(() => {});
        } else
          store.setState({
            error: message(error),
            ...(readingBack
              ? {
                  quietHoursAvailable: false,
                  quietHoursIssue:
                    "Reconnect to confirm the ticker's saved quiet-hours schedule.",
                }
              : {}),
          });
      }
      return false;
    } finally {
      clearTimeout(timer);
      if (started && token === generation)
        store.setState({ savingQuietHours: false });
      if (started) void drainSettings();
    }
  };
  const setQuietHours = (config: TickerQuietHoursConfig): Promise<boolean> =>
    command({ type: "set_quiet_hours", value: config });
  return {
    store,
    startScan,
    stopScan,
    connect,
    authorize,
    rename,
    command,
    updateSetting,
    showFavorites,
    setCustomHeader,
    saveRotation,
    setQuietHours,
    disconnect,
    reconnect: async () => {
      const device =
        store.getState().selectedDevice ?? store.getState().lastDevice;
      return device ? connect(device) : false;
    },
    dispose: async () => {
      disposed = true;
      await disconnect();
      await transport.destroy();
    },
  };
}
export type TickerController = ReturnType<typeof createTickerController>;
