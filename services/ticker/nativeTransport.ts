import { Platform } from "react-native";
import Constants from "expo-constants";
import { fromByteArray, toByteArray } from "base64-js";
import type {
  BleManager,
  Subscription,
} from "@sfourdrinier/react-native-ble-plx";
import type { TickerBluetoothState } from "../../types/ticker";
import {
  FRAME_BYTES,
  isCompatibleAdvertisement,
  TICKER_GATT,
} from "./protocol";
import {
  decodeTickerName,
  encodeTickerName,
  TickerNameUnavailableError,
} from "./name";
import type { TickerTransport } from "./transport";

export function createNativeTickerTransport(): TickerTransport {
  let manager: BleManager | undefined;
  let scanRevision = 0;
  let observedStableState = false;
  const deviceRevisions = new Map<string, number>();
  const invalidateDevice = (id: string) => {
    const next = (deviceRevisions.get(id) ?? 0) + 1;
    deviceRevisions.set(id, next);
    return next;
  };
  let loading: Promise<BleManager> | undefined;
  let stateSubscription: Subscription | undefined;
  const getManager = async () => {
    if (Platform.OS !== "ios")
      throw new Error(
        "Ticker Bluetooth is currently supported on physical devices in a development build.",
      );
    if (Constants.executionEnvironment === "storeClient")
      throw new Error(
        "Bluetooth requires a development build. Expo Go cannot connect to tickers.",
      );
    if (!loading)
      loading = import("@sfourdrinier/react-native-ble-plx")
        .then(({ BleManager }) => {
          manager = new BleManager();
          return manager;
        })
        .catch(() => {
          loading = undefined;
          throw new Error(
            "Bluetooth native module unavailable. Rebuild and install Tempo on a physical device.",
          );
        });
    return loading;
  };
  const decode = (value: string | null) => {
    // Bound input before decoding untrusted peripheral data.
    if (!value || value.length !== 28)
      throw new Error(
        "Unsupported firmware/protocol: expected a 20-byte Tempo frame.",
      );
    const bytes = toByteArray(value);
    if (bytes.length !== FRAME_BYTES)
      throw new Error("Invalid ticker frame length.");
    return bytes;
  };
  return {
    async prepare(onState) {
      const ble = await getManager();
      stateSubscription?.remove();
      stateSubscription = ble.onStateChange((state) => {
        if (state === "Unknown" || state === "Resetting") {
          if (observedStableState) onState(state as TickerBluetoothState);
        } else {
          observedStableState = true;
          onState(state as TickerBluetoothState);
        }
      }, false);
      // Initializing CoreBluetooth triggers the iOS permission prompt when required.
      const initial = await ble.state();
      if (initial !== "Unknown" && initial !== "Resetting") {
        observedStableState = true;
        return initial as TickerBluetoothState;
      }
      return new Promise<TickerBluetoothState>((resolve) => {
        let subscription: Subscription | undefined;
        const timer = setTimeout(() => {
          subscription?.remove();
          resolve("Unknown");
        }, 8000);
        subscription = ble.onStateChange((state) => {
          if (state === "Unknown" || state === "Resetting") return;
          clearTimeout(timer);
          subscription?.remove();
          resolve(state as TickerBluetoothState);
        }, true);
      });
    },
    async scan(onDevice, onError) {
      const revision = ++scanRevision;
      const ble = await getManager();
      if (revision !== scanRevision) return;
      await ble.startDeviceScan(
        [TICKER_GATT.service],
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            onError(new Error(error.message));
            return;
          }
          if (!device || !isCompatibleAdvertisement(device.serviceUUIDs))
            return;
          onDevice({
            id: device.id,
            name: device.localName || device.name || "Tempo Ticker",
            rssi: device.rssi,
          });
        },
      );
    },
    async stopScan() {
      scanRevision++;
      if (manager) await manager.stopDeviceScan();
    },
    async connect(id) {
      const revision = invalidateDevice(id);
      const ble = await getManager();
      if (revision !== deviceRevisions.get(id))
        throw new Error("Connection cancelled.");
      await ble.connectToDevice(id, { timeout: 15000 });
    },
    async discover(id) {
      const ble = await getManager();
      await ble.discoverAllServicesAndCharacteristicsForDevice(id);
      const services = await ble.servicesForDevice(id);
      if (
        !services.some(
          (service) => service.uuid.toLowerCase() === TICKER_GATT.service,
        )
      )
        throw new Error("Unsupported device: Tempo GATT service is missing.");
      const characteristics = await ble.characteristicsForDevice(
        id,
        TICKER_GATT.service,
      );
      const status = characteristics.find(
        (c) => c.uuid.toLowerCase() === TICKER_GATT.status,
      );
      const command = characteristics.find(
        (c) => c.uuid.toLowerCase() === TICKER_GATT.command,
      );
      const response = characteristics.find(
        (c) => c.uuid.toLowerCase() === TICKER_GATT.response,
      );
      if (
        !status?.isReadable ||
        !command?.isWritableWithResponse ||
        !(response?.isNotifiable || response?.isIndicatable)
      )
        throw new Error(
          "Unsupported firmware/protocol: required readable status, writable command, or notification characteristic is missing.",
        );
    },
    async readStatus(id) {
      return decode(
        (
          await (
            await getManager()
          ).readCharacteristicForDevice(
            id,
            TICKER_GATT.service,
            TICKER_GATT.status,
          )
        ).value,
      );
    },
    async readName(id) {
      const revision = deviceRevisions.get(id);
      const ble = await getManager();
      if (revision !== deviceRevisions.get(id))
        throw new Error("Connection changed while reading the name.");
      const characteristics = await ble.characteristicsForDevice(
        id,
        TICKER_GATT.service,
      );
      if (revision !== deviceRevisions.get(id))
        throw new Error("Connection changed while reading the name.");
      if (
        !characteristics.some(
          (item) =>
            item.uuid.toLowerCase() === TICKER_GATT.name && item.isReadable,
        )
      )
        throw new TickerNameUnavailableError();
      let result;
      try {
        result = await ble.readCharacteristicForDevice(
          id,
          TICKER_GATT.service,
          TICKER_GATT.name,
        );
      } catch (error) {
        // CoreBluetooth may retain an older service table after a firmware update.
        if (
          error &&
          typeof error === "object" &&
          "errorCode" in error &&
          error.errorCode === 404
        )
          throw new TickerNameUnavailableError();
        throw error;
      }
      if (revision !== deviceRevisions.get(id))
        throw new Error("Connection changed while reading the name.");
      if (!result.value || result.value.length > 28)
        throw new Error("The ticker reported an invalid name.");
      return decodeTickerName(toByteArray(result.value));
    },
    async writeName(id, name) {
      const bytes = encodeTickerName(name);
      const revision = deviceRevisions.get(id);
      const ble = await getManager();
      if (revision !== deviceRevisions.get(id))
        throw new Error("Connection changed before renaming.");
      await ble.writeCharacteristicWithResponseForDevice(
        id,
        TICKER_GATT.service,
        TICKER_GATT.name,
        fromByteArray(bytes),
      );
      if (revision !== deviceRevisions.get(id))
        throw new Error("Connection changed while renaming.");
    },
    async readAuthorization(id) {
      const revision = deviceRevisions.get(id);
      const ble = await getManager();
      if (revision !== deviceRevisions.get(id))
        throw new Error("Connection changed during pairing.");
      const characteristics = await ble.characteristicsForDevice(
        id,
        TICKER_GATT.service,
      );
      if (
        !characteristics.some(
          (c) =>
            c.uuid.toLowerCase() === TICKER_GATT.authorization && c.isReadable,
        )
      ) {
        throw new Error(
          "Upload TempoScoreboard firmware 0.2.0 or newer to unlock controls.",
        );
      }
      // Access protection is enforced by firmware/NimBLE. On iOS this ATT read
      // triggers the system passkey prompt and waits for pairing/encryption.
      const characteristic = await ble.readCharacteristicForDevice(
        id,
        TICKER_GATT.service,
        TICKER_GATT.authorization,
      );
      if (revision !== deviceRevisions.get(id))
        throw new Error("Connection changed during pairing.");
      return decode(characteristic.value);
    },
    monitor(id, onFrame, onError) {
      if (!manager) throw new Error("Bluetooth is unavailable.");
      const subscription = manager.monitorCharacteristicForDevice(
        id,
        TICKER_GATT.service,
        TICKER_GATT.response,
        (error, characteristic) => {
          if (error) {
            onError(new Error(error.message));
            return;
          }
          try {
            onFrame(decode(characteristic?.value ?? null));
          } catch (error) {
            onError(
              error instanceof Error
                ? error
                : new Error("Invalid ticker response."),
            );
          }
        },
      );
      return () => subscription.remove();
    },
    onDisconnect(id, callback) {
      if (!manager) throw new Error("Bluetooth is unavailable.");
      const revision = deviceRevisions.get(id);
      const subscription = manager.onDeviceDisconnected(id, () => {
        if (deviceRevisions.get(id) === revision) invalidateDevice(id);
        callback();
      });
      return () => subscription.remove();
    },
    async write(id, frame) {
      if (frame.length !== FRAME_BYTES)
        throw new Error("Invalid command payload size.");
      const revision = deviceRevisions.get(id);
      const ble = await getManager();
      if (revision !== deviceRevisions.get(id))
        throw new Error(
          "Device disconnected before the command could be sent.",
        );
      await ble.writeCharacteristicWithResponseForDevice(
        id,
        TICKER_GATT.service,
        TICKER_GATT.command,
        fromByteArray(frame),
      );
    },
    async disconnect(id) {
      invalidateDevice(id);
      if (manager) await manager.cancelDeviceConnection(id);
    },
    async destroy() {
      stateSubscription?.remove();
      stateSubscription = undefined;
      if (manager) await manager.destroy();
      manager = undefined;
      loading = undefined;
    },
  };
}
