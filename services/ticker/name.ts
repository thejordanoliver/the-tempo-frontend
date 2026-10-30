export const MAX_TICKER_NAME_LENGTH = 20;

export function normalizeTickerName(value: string): string {
  const name = value.trim();
  if (!name || name.length > MAX_TICKER_NAME_LENGTH)
    throw new Error("Enter a name between 1 and 20 characters.");
  if (!/^[\x20-\x7e]+$/.test(name))
    throw new Error("Use standard letters, numbers, spaces, and punctuation.");
  return name;
}

export function encodeTickerName(value: string): Uint8Array {
  return Uint8Array.from(normalizeTickerName(value), (character) =>
    character.charCodeAt(0),
  );
}

export function decodeTickerName(bytes: Uint8Array): string {
  if (
    bytes.length < 1 ||
    bytes.length > MAX_TICKER_NAME_LENGTH ||
    bytes.some((value) => value < 0x20 || value > 0x7e)
  )
    throw new Error("The ticker reported an invalid name.");
  const name = String.fromCharCode(...bytes);
  if (normalizeTickerName(name) !== name)
    throw new Error("The ticker reported an invalid name.");
  return name;
}

export class TickerNameUnavailableError extends Error {
  constructor() {
    super(
      "Your phone has not discovered the rename characteristic. Forget this ticker in your phone’s Bluetooth settings, then reconnect and pair again.",
    );
    this.name = "TickerNameUnavailableError";
  }
}
