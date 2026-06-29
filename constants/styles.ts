import { StyleSheet } from "react-native";
/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";
export const activeOpacity = 0.75;
export const PLACEHOLDER_COLOR = "#888";

export const Colors = {
  light: {
    text: "#1d1d1d",
    transparentText: "#1d1d1d50",

    itemBackground: "#eee",
    transparentItemBackground: "#eeeeee50",

    red: "#cc0000",
    transparentRed: "#cc000050",

    green: "#177901ff",
    transparentGreen: "#17790150",

    yellow: "#dcb000ff",
    transparentYellow: "#dcb00050",

    orange: "#fa7115",
    transparentOrange: "#fa711550",

    blue: "#007AFF",
    transparentBlue: "#007AFF50",

    black: "#1d1d1d",
    transparentBlack: "#1d1d1d50",

    gold: "#dbb505",
    transparentGold: "#dbb14550",

    background: "#fff",
    transparentBackground: "#ffffff50",

    tint: tintColorLight,
    transparentTint: "#0a7ea450",

    icon: "#687076",
    transparentIcon: "#68707650",

    tabIconDefault: "#687076",
    transparentTabIconDefault: "#68707650",

    tabIconSelected: tintColorLight,
    transparentTabIconSelected: "#0a7ea450",

    errorBackground: "#ffdada",
    transparentErrorBackground: "#ffdada50",
  },

  dark: {
    text: "#fff",
    transparentText: "#ffffff50",

    lightRed: "#ff4444",
    transparentLightRed: "#ff444450",

    limeGreen: "#2fff00ff",
    transparentLimeGreen: "#2fff0050",

    leafGreen: "#4CAF50",
    transparentLeafGreen: "#4CAF5050",

    green: "#4CAF50",
    transparentGreen: "#4CAF5050",

    yellow: "#facc15",
    transparentYellow: "#facc1550",

    orange: "#fa7115",
    transparentOrange: "#fa711550",

    blue: "#007AFF",
    transparentBlue: "#007AFF50",

    gold: "#7a6839",
    transparentGold: "#7a683950",

    itemBackground: "#2e2e2e",
    transparentItemBackground: "#2e2e2e50",

    white: "#fff",
    transparentWhite: "#ffffff50",

    background: "#1d1d1d",
    transparentBackground: "#1d1d1d50",

    tint: tintColorDark,
    transparentTint: "#ffffff50",

    icon: "#9BA1A6",
    transparentIcon: "#9BA1A650",

    tabIconDefault: "#9BA1A6",
    transparentTabIconDefault: "#9BA1A650",

    tabIconSelected: tintColorDark,
    transparentTabIconSelected: "#ffffff50",

    errorBackground: "#5a1f1f",
    transparentErrorBackground: "#5a1f1f50",
  },

  white: "#fff",
  transparentWhite: "#ffffff50",

  black: "#1d1d1d",
  transparentBlack: "#1d1d1d50",

  midTone: "#888",
  transparentMidTone: "#88888850",

  lightGray: "#aaa",
  transparentLightGray: "#aaaaaa88",

  darkGray: "#555",
  transparentDarkGray: "#55555588",
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
