import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStore } from "zustand";
import { createTickerController } from "services/ticker/controller";
import { createProtectedGattAuthorizer } from "services/ticker/authorization";
import { createNativeTickerTransport } from "services/ticker/nativeTransport";
import type { TickerDevice } from "types/ticker";

// One controller/manager for all routes; native objects never enter persisted state.
const transport = createNativeTickerTransport();
export const ticker = createTickerController(
  transport,
  createProtectedGattAuthorizer(transport),
);
export const useTickerStore = () => useStore(ticker.store);
const storageKey = "tempo:ticker:last-device:v1";
let hydrated = false;
export async function hydrateTickerPreference() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    const value: unknown = raw ? JSON.parse(raw) : null;
    if (
      value &&
      typeof value === "object" &&
      "id" in value &&
      "name" in value &&
      typeof value.id === "string" &&
      typeof value.name === "string" &&
      value.id.length <= 128 &&
      value.name.length <= 128 &&
      !ticker.store.getState().lastDevice
    ) {
      ticker.store.setState({ lastDevice: { id: value.id, name: value.name } });
    }
  } catch {
    /* A saved reconnect hint is optional; live state is never restored. */
  }
}
let lastSaved: TickerDevice | null = null;
ticker.store.subscribe((state) => {
  if (!state.lastDevice || state.lastDevice === lastSaved) return;
  lastSaved = state.lastDevice;
  void AsyncStorage.setItem(
    storageKey,
    JSON.stringify({ id: lastSaved.id, name: lastSaved.name }),
  ).catch(() => {});
});
