import type { TickerHeaderColor } from "types/ticker";

// Fixed panel colors: these swatches match the firmware palette in DisplayHeader.h.
export const TICKER_HEADER_COLORS: Record<TickerHeaderColor, string> = {
  green: "#00dc5a",
  white: "#f0f0f0",
  red: "#ff0000",
  blue: "#007aff",
  yellow: "#ffb900",
  orange: "#fa7115",
  purple: "#9b5de5",
  cyan: "#00d7ff",
};
