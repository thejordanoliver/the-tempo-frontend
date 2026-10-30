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
  readName?(id: string): Promise<string>;
  writeName?(id: string, name: string): Promise<void>;
  // Native ATT read of firmware's encrypted/authenticated authorization
  // characteristic. iOS owns the pairing UI and bond keys, never JavaScript.
  readAuthorization?(id: string): Promise<Uint8Array>;
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
// Authorization comes from the native protected GATT operation and OS pairing,
// never from an advertised name/UUID or a device-reported authorization bit.
export interface TickerAuthorizer {
  verify(device: TickerDevice): Promise<boolean>;
}
export const pendingFirmwareAuthorization: TickerAuthorizer = {
  verify: async () => false,
};
