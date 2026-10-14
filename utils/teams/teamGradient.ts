import { Colors } from "constants/styles";
import { processColor } from "react-native";

export function getTeamGradient(color: string): [string, string, string] {
  const resolved = processColor(color) ?? processColor(Colors.midTone);
  const value = typeof resolved === "number" ? resolved : 0x888888;
  const red = (value >>> 16) & 255;
  const green = (value >>> 8) & 255;
  const blue = value & 255;

  return [
    `rgba(${red}, ${green}, ${blue}, 1)`,
    `rgba(${red}, ${green}, ${blue}, 0.35)`,
    `rgba(${red}, ${green}, ${blue}, 0)`,
  ];
}

