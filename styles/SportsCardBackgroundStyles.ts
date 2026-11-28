import { Colors } from "constants/styles";
import type { LinearGradientProps } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

export const sportsCardBackgroundStyles = StyleSheet.create({
  logoContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: "flex-end",
    justifyContent: "center",
    width: "45%",
    overflow: "hidden",
  },
  backgroundLogo: {
    position: "relative",
    right: -105,
    top: 0,
    height: "170%",
    aspectRatio: 1,
    opacity: 0.5,
    transform: [{ rotate: "-15deg" }],
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "120%",
  },
});

export const getSportsCardGradient = (
  isDark: boolean,
): Pick<LinearGradientProps, "colors" | "locations" | "start" | "end"> => ({
  colors: isDark
    ? [Colors.dark.itemBackground, `${Colors.dark.itemBackground}00`]
    : [Colors.light.itemBackground, "#eeeeee00"],
  locations: [0.55, 1],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
});
