import { Colors } from "constants/styles";

type ContrastingTextColorOptions = {
  lightText?: string;
  darkText?: string;
  threshold?: number;
};

export function getContrastingTextColor(
  hexColor: string,
  options: ContrastingTextColorOptions = {},
): string {
  const {
    lightText = Colors.white,
    darkText = Colors.black,
    threshold = 4.5, // WCAG AA
  } = options;

  if (!hexColor || hexColor.trim().toLowerCase() === "transparent") {
    return darkText;
  }

  let hex = hexColor.trim().replace(/^#/, "").toLowerCase();

  // #RGB → #RRGGBB
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((character) => character.repeat(2))
      .join("");
  }

  // Ignore alpha: #RRGGBBAA → #RRGGBB
  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }

  if (!/^[0-9a-f]{6}$/.test(hex)) {
    return darkText;
  }

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  // Convert sRGB to linear RGB.
  const toLinear = (value: number): number => {
    const channel = value / 255;

    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const luminance =
    0.2126 * toLinear(red) +
    0.7152 * toLinear(green) +
    0.0722 * toLinear(blue);

  const contrastWithWhite = 1.05 / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / 0.05;

  if (
    contrastWithWhite >= threshold &&
    contrastWithWhite >= contrastWithBlack
  ) {
    return lightText;
  }

  if (contrastWithBlack >= threshold) {
    return darkText;
  }

  // If neither reaches the requested threshold, use the better option.
  return contrastWithWhite >= contrastWithBlack
    ? lightText
    : darkText;
}