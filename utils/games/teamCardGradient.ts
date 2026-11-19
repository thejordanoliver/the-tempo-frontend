import { Colors } from "constants/styles";

type RGB = readonly [number, number, number];

/** Parse the hex team colors returned by the game data without altering them. */
function parseHexColor(color?: string): RGB | null {
  if (!color) return null;

  const hex = color.trim().replace(/^#/, "");
  if (!/^(?:[a-f\d]{3}|[a-f\d]{6}|[a-f\d]{8})$/i.test(hex)) {
    return null;
  }

  const full =
    hex.length === 3
      ? [...hex].map((digit) => digit + digit).join("")
      : hex.slice(0, 6);

  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

/** Mix a team color into the existing card background for a gentle tint. */
function blendWithBackground(
  teamColor: string | undefined,
  background: string,
  amount: number,
): string {
  const team = parseHexColor(teamColor);
  const base = parseHexColor(background);
  if (!team || !base) return background;

  const mixed = base.map((component, index) =>
    Math.round(component + (team[index] - component) * amount),
  );

  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

/**
 * Away color fades in from the left; home color fades in from the right.
 * Both blend through the existing neutral card background at the center.
 */
export function getTeamCardGradientColors(
  isDark: boolean,
  awayColor?: string,
  homeColor?: string,
  backgroundOverride?: string,
): readonly [string, string, string, string, string] {
  const background = backgroundOverride ?? (isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground);

  const edgeStrength = .5;
  const innerStrength = isDark ? 0.09 : 0.06;

  return [
    blendWithBackground(awayColor, background, edgeStrength),
    blendWithBackground(awayColor, background, innerStrength),
    background,
    blendWithBackground(homeColor, background, innerStrength),
    blendWithBackground(homeColor, background, edgeStrength),
  ];
}
