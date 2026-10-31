export const MAX_CUSTOM_HEADER_LENGTH = 20;
// Stable wire IDs 0x85..0x88 match firmware HeaderEmoji.h. One byte per
// supported emoji leaves room for 20 glyphs in a minimum-MTU GATT write.
export const HEADER_EMOJIS = [
  { emoji: "❤️", label: "Heart", byte: 0x88 },
  { emoji: "⭐", label: "Star", byte: 0x87 },
  { emoji: "🏆", label: "Trophy", byte: 0x85 },
  { emoji: "🔥", label: "Fire", byte: 0x86 },
] as const;

export function supportsHeaderEmoji(version: string | null | undefined) {
  if (!version || !/^\d+\.\d+\.\d+$/.test(version)) return false;
  const [major, minor] = version.split(".").map(Number);
  return major > 0 || minor >= 13;
}

function headerBytes(value: string): number[] {
  const bytes: number[] = [];
  for (const character of Array.from(value)) {
    const code = character.codePointAt(0)!;
    // Native keyboards can include the emoji presentation selector. The wire
    // glyph is the same with or without it; selectors cannot stand alone.
    if (code === 0xfe0f && bytes.length && bytes[bytes.length - 1] >= 0x80)
      continue;
    if (code >= 0x20 && code <= 0x7e) bytes.push(code);
    else {
      const emoji = HEADER_EMOJIS.find(
        (item) => item.emoji.codePointAt(0) === code,
      );
      if (!emoji)
        throw new Error(
          "Use standard letters, numbers, punctuation, or an emoji from the picker.",
        );
      bytes.push(emoji.byte);
    }
  }
  if (!bytes.length || bytes.length > MAX_CUSTOM_HEADER_LENGTH)
    throw new Error(
      "Enter a header between 1 and 20 characters. Each emoji counts as one.",
    );
  return bytes;
}

export function encodeCustomHeader(value: string): Uint8Array {
  return Uint8Array.from(headerBytes(value.trim()));
}

export function decodeCustomHeader(bytes: Uint8Array): string {
  if (bytes.length > MAX_CUSTOM_HEADER_LENGTH)
    throw new Error("The ticker reported an invalid custom header.");
  const text = Array.from(bytes, (value) => {
    if (value >= 0x20 && value <= 0x7e) return String.fromCharCode(value);
    const emoji = HEADER_EMOJIS.find((item) => item.byte === value);
    if (!emoji)
      throw new Error("The ticker reported an invalid custom header.");
    return emoji.emoji;
  }).join("");
  if (text.trim() !== text)
    throw new Error("The ticker reported an invalid custom header.");
  return text;
}

export function normalizeCustomHeader(value: string): string {
  return decodeCustomHeader(encodeCustomHeader(value));
}

export class TickerCustomHeaderUnavailableError extends Error {
  constructor() {
    super(
      "Your phone has not discovered custom header controls. Forget this ticker in Bluetooth settings, then reconnect and pair again.",
    );
    this.name = "TickerCustomHeaderUnavailableError";
  }
}
