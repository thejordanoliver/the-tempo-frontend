import { decodeFrame } from "./protocol";
import type { TickerAuthorizer, TickerTransport } from "./transport";

/** User initiates this from Unlock controls. iOS performs native passkey pairing
 * against the code on the physical ticker. Firmware protects the ATT read and
 * independently checks the authenticated SC bond again for every mutation.
 * No keys, PINs, trust flags, or custom authentication protocol enter JS/storage.
 */
export function createProtectedGattAuthorizer(
  transport: TickerTransport,
): TickerAuthorizer {
  return {
    async verify(device) {
      if (!transport.readAuthorization)
        throw new Error("Native Bluetooth pairing is unavailable.");
      const frame = decodeFrame(await transport.readAuthorization(device.id));
      if (frame.kind !== "status")
        throw new Error("Invalid protected device status.");
      // Capabilities check compatibility only. Authorization depends on the
      // protected native read completing, not on any self-reported auth flag.
      return frame.status.capabilities.some(
        (type) => !["get_status", "get_settings"].includes(type),
      );
    },
  };
}
