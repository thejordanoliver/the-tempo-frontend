import { StyleSheet } from "react-native";

export const activeOpacity = 0.7;
export const PLACEHOLDER_COLOR = "#888";
export const PLACEHOLDER_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder.png";
export const PLACEHOLDER_BANNER =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393764/BannerPlaceholder.png";

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

    purple: "#9b5de5",
    transparentPurple: "#9b5de550",

    black: "#1d1d1d",
    transparentBlack: "#1d1d1d50",

    gold: "#9f854f",
    transparentGold: "#dbb14550",

    background: "#fff",
    transparentBackground: "#ffffff50",

    transparentTint: "#0a7ea450",

    icon: "#687076",
    transparentIcon: "#68707650",

    tabIconDefault: "#687076",
    transparentTabIconDefault: "#68707650",

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

    gold: "#9f854f",
    transparentGold: "#7a683950",

    itemBackground: "#2e2e2e",
    transparentItemBackground: "#2e2e2e50",

    white: "#ffffff",
    transparentWhite: "#ffffff50",

    background: "#1d1d1d",
    transparentBackground: "#1d1d1d50",

    transparentTint: "#ffffff50",

    icon: "#9BA1A6",
    transparentIcon: "#9BA1A650",

    tabIconDefault: "#9BA1A6",
    transparentTabIconDefault: "#9BA1A650",

    transparentTabIconSelected: "#ffffff50",

    errorBackground: "#5a1f1f",
    transparentErrorBackground: "#5a1f1f50",
  },

  white: "#ffffff",
  transparentWhite: "#ffffff50",

  black: "#1d1d1d",
  transparentBlack: "#1d1d1d50",

  midTone: "#888888",
  transparentMidTone: "#88888850",

  lightGray: "#aaaaaa",
  transparentLightGray: "#aaaaaa88",

  darkGray: "#555555",
  transparentDarkGray: "#55555588",

  bronze: "#b87333",
  transparentBronze: "#b8733388",

  silver: "#a7b0be",
  transparentSilver: "#a7b0be88",

  gold: "#dbb505",
  transparentGold: "#dbb14550",

  platinum: "#8b6cff",
  transparentPlatinum: "#8b6cff88",
};

export const Fonts = {
  // Normal UI
  EXTRALIGHT: "Oswald_200ExtraLight",
  LIGHT: "Oswald_300Light",
  REGULAR: "Oswald_400Regular",
  MEDIUM: "Oswald_500Medium",
  SEMIBOLD: "Oswald_600SemiBold",
  BOLD: "Oswald_700Bold",

  // Sports / display
  SPORTS_MEDIUM: "BarlowCondensed_500Medium",
  SPORTS_SEMIBOLD: "BarlowCondensed_600SemiBold",
  SPORTS_BOLD: "BarlowCondensed_700Bold",
  SPORTS_EXTRA_BOLD: "BarlowCondensed_800ExtraBold",
};

export const globalStyles = (isDark: boolean) =>
  StyleSheet.create({
    // ----------------------------------------
    // Typography
    // ----------------------------------------

    heading: {
      fontFamily: Fonts.BOLD,
      fontSize: 28,
      lineHeight: 34,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    subheading: {
      fontFamily: Fonts.BOLD,
      fontSize: 22,
      lineHeight: 28,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    title: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      lineHeight: 26,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    subtitle: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      lineHeight: 22,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    text: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      lineHeight: 22,
      color: isDark ? Colors.white : Colors.black,
    },

    textMedium: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      lineHeight: 22,
      color: isDark ? Colors.white : Colors.black,
    },

    secondaryText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    caption: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    label: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // ----------------------------------------
    // Feedback / Error
    // ----------------------------------------

    errorText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 20,
      lineHeight: 26,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    // ----------------------------------------
    // Empty States
    // ----------------------------------------

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
    },

    emptyIconContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 64,
      height: 64,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 32,
    },

    emptyTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      lineHeight: 26,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },

    emptyText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    emptySubText: {
      marginTop: 6,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    // ----------------------------------------
    // Interaction
    // ----------------------------------------

    pressed: {
      opacity: activeOpacity,
    },
  });
