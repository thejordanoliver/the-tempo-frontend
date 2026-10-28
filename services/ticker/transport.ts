import type { TickerBluetoothState, TickerDevice } from "../../types/ticker";
export type Unsubscribe = () => void;
export interface TickerTransport {
  prepare(
    onState: (state: TickerBluetoothState) => void,
  ): Promise<TickerBluetoothState>;
  scan(
    onDevice: (device: TickerDevice) => void,
    onError: (error: Error) => void,
  ): Promise<void>;
  stopScan(): Promise<void>;
  connect(id: string): Promise<void>;
  discover(id: string): Promise<void>;
  readStatus(id: string): Promise<Uint8Array>;
  monitor(
    id: string,
    onFrame: (bytes: Uint8Array) => void,
    onError: (error: Error) => void,
  ): Unsubscribe;
  onDisconnect(id: string, callback: () => void): Unsubscribe;
  write(id: string, frame: Uint8Array): Promise<void>;
  disconnect(id: string): Promise<void>;
  destroy(): Promise<void>;
}
// Implement only after firmware's security design and a trusted native verification path exist.
// Never authorize using a name, advertised UUID, or a self-reported authorization flag.
export interface TickerAuthorizer {
  verify(device: TickerDevice): Promise<boolean>;
}
export const pendingFirmwareAuthorization: TickerAuthorizer = {
  verify: async () => false,
};
