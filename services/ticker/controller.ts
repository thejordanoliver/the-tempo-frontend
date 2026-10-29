import { createStore } from "zustand/vanilla";
import type {
  TickerBluetoothState,
  TickerCommand,
  TickerConnectionState,
  TickerDevice,
  TickerSettings,
  TickerStatus,
} from "../../types/ticker";
import { decodeFrame, encodeCommand } from "./protocol";
import {
  pendingFirmwareAuthorization,
  type TickerAuthorizer,
  type TickerTransport,
  type Unsubscribe,
} from "./transport";

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
  pendingCommands: Record<number, TickerCommand["type"]>;
  error: string | null;
}
export const connectionBusy = (state: TickerConnectionState) =>
  state === "connecting" || state === "verifying";
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
    pendingCommands: {},
    error: null,
  }));
  let generation = 0;
  let scanGeneration = 0;
  let scanTimer: ReturnType<typeof setTimeout> | undefined;
  let requestId = 0; // Never reused in a manager lifetime, including reconnects.
  let subscriptions: Unsubscribe[] = [];
  let disposed = false;
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
    subscriptions.forEach((unsubscribe) => unsubscribe());
    subscriptions = [];
    rejectPending("Device disconnected. Reconnect before sending commands.");
    store.setState({
      connection: "disconnected",
      authorized: false,
      authorizing: false,
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
  const command = async (command: TickerCommand): Promise<boolean> => {
    const state = store.getState();
    const token = generation;
    let id = 0;
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
      if (pending.size)
        throw new Error("Wait for the current ticker command to finish.");
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
        (command.type === "set_top25_only" &&
          confirmed.settings.top25Only !== command.value)
      )
        throw new Error(
          "Device acknowledgment did not confirm the requested setting. Refresh status and retry.",
        );
      applyStatus(confirmed);
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
    }
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
        lastDevice: { id: device.id, name: device.name },
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
  return {
    store,
    startScan,
    stopScan,
    connect,
    authorize,
    command,
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
