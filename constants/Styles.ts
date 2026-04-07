import { StyleSheet } from "react-native";
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";
export const PLACEHOLDER_COLOR = "#888";

export const Colors = {
  light: {
    text: "#1d1d1d",
    itemBackground: "#eee",
    red: "#cc0000",
    green: "#177901ff",
    yellow: "#dcb000ff",
    blue: "#007AFF",
    black: "#1d1d1d",
    gold: "#dbb145",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    errorBackground: "#ffdada",
  },
  dark: {
    text: "#fff",
    lightRed: "#ff4444",
    limeGreen: "#2fff00ff",
    leafGreen: "#4CAF50",
    yellow: "#facc15",
    blue: "#007AFF",
    gold: "#7a6839",
    itemBackground: "#2e2e2e",
    white: "#fff",
    background: "#1d1d1d",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    errorBackground: "#5a1f1f",
  },

  white: "#fff",
  black: "#1d1d1d",
  midTone: "#888",
  lightGray: "#aaa",
  transparentLightGray: "#aaaaaa88",
  transparentDarkGray: "#55555588",
  darkGray: "#555",
};

export const Fonts = {
  OSEXTRALIGHT: "Oswald_200ExtraLight",
  OSLIGHT: "Oswald_300Light",
  OSREGULAR: "Oswald_400Regular",
  OSMEDIUM: "Oswald_500Medium",
  OSSEMIBOLD: "Oswald_600SemiBold",
  OSBOLD: "Oswald_700Bold",
};

export const globalStyles = (isDark: boolean) =>
  StyleSheet.create({
    errorText: {
      marginTop: 20,
      textAlign: "center",
      fontSize: 20,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    emptyText: {
      marginTop: 20,
      textAlign: "center",
      fontSize: 20,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.midTone,
    },
    emptySubText: {
      marginTop: 6,
      fontSize: 14,
      textAlign: "center",
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
