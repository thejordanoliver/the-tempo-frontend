import { Colors } from "constants/styles";

// utils/color.ts
export function getContrastingTextColor(
  hexColor: string,
  options?: {
    lightText?: string;
    darkText?: string;
    threshold?: number;
  },
): string {
  const {
    lightText = Colors.white,
    darkText = Colors.black,
    threshold = 4.5, // WCAG AA
  } = options || {};

  if (!hexColor || hexColor === "transparent") return darkText;

  let hex = hexColor.replace("#", "").toLowerCase();

  // #RGB → #RRGGBB
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // Ignore alpha (#RRGGBBAA)
  if (hex.length === 8) {
    hex = hex.substring(0, 6);
  }

  if (hex.length !== 6) return darkText;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  if ([r, g, b].some(Number.isNaN)) return darkText;

  // sRGB → linear RGB
  const toLinear = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  const contrastWithWhite = 1.05 / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / 0.05;

  // Prefer whichever has higher contrast
  if (contrastWithWhite >= contrastWithBlack) {
    return contrastWithWhite >= threshold ? lightText : darkText;
  }

  return contrastWithBlack >= threshold ? darkText : lightText;
}
