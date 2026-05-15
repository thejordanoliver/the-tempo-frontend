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
    transparentText: "#1d1d1d80",

    itemBackground: "#eee",
    transparentItemBackground: "#eeeeee80",

    red: "#cc0000",
    transparentRed: "#cc000080",

    green: "#177901ff",
    transparentGreen: "#17790180",

    yellow: "#dcb000ff",
    transparentYellow: "#dcb00080",

    orange: "#fa7115",
    transparentOrange: "#fa711580",

    blue: "#007AFF",
    transparentBlue: "#007AFF80",

    black: "#1d1d1d",
    transparentBlack: "#1d1d1d80",

    gold: "#dbb145",
    transparentGold: "#dbb14580",

    background: "#fff",
    transparentBackground: "#ffffff80",

    tint: tintColorLight,
    transparentTint: "#0a7ea480",

    icon: "#687076",
    transparentIcon: "#68707680",

    tabIconDefault: "#687076",
    transparentTabIconDefault: "#68707680",

    tabIconSelected: tintColorLight,
    transparentTabIconSelected: "#0a7ea480",

    errorBackground: "#ffdada",
    transparentErrorBackground: "#ffdada80",
  },

  dark: {
    text: "#fff",
    transparentText: "#ffffff80",

    lightRed: "#ff4444",
    transparentLightRed: "#ff444480",

    limeGreen: "#2fff00ff",
    transparentLimeGreen: "#2fff0080",

    leafGreen: "#4CAF50",
    transparentLeafGreen: "#4CAF5080",

    green: "#4CAF50",
    transparentGreen: "#4CAF5080",

    yellow: "#facc15",
    transparentYellow: "#facc1580",

    orange: "#fa7115",
    transparentOrange: "#fa711580",

    blue: "#007AFF",
    transparentBlue: "#007AFF80",

    gold: "#7a6839",
    transparentGold: "#7a683980",

    itemBackground: "#2e2e2e",
    transparentItemBackground: "#2e2e2e80",

    white: "#fff",
    transparentWhite: "#ffffff80",

    background: "#1d1d1d",
    transparentBackground: "#1d1d1d80",

    tint: tintColorDark,
    transparentTint: "#ffffff80",

    icon: "#9BA1A6",
    transparentIcon: "#9BA1A680",

    tabIconDefault: "#9BA1A6",
    transparentTabIconDefault: "#9BA1A680",

    tabIconSelected: tintColorDark,
    transparentTabIconSelected: "#ffffff80",

    errorBackground: "#5a1f1f",
    transparentErrorBackground: "#5a1f1f80",
  },

  white: "#fff",
  transparentWhite: "#ffffff80",

  black: "#1d1d1d",
  transparentBlack: "#1d1d1d80",

  midTone: "#888",
  transparentMidTone: "#88888880",

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
