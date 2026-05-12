import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 100,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const INPUT_HEIGHT = 54;

export const formStyles = (isDark: boolean) => {
  const surface = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const text = isDark ? Colors.white : Colors.black;
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const focusBorder = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)";
  const subtleText = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
  const divider = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
      marginBottom: 40,
    },
    sectionContainer: {
      flex: 1,
    },
    formWrapper: {
      flex: 1,
      justifyContent: "center",
      gap: 12,
    },

    inputFocused: {
      borderColor: focusBorder,
      borderWidth: 1,
    },

    input: {
      height: INPUT_HEIGHT,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: surface,
      borderRadius: 8,
      paddingHorizontal: SPACING.lg,
    },

    inputText: {
      flex: 1,
      color: text,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },

    forgotPasswordLink: {
      alignSelf: "center",
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
    },

    forgotPasswordText: {
      color: Colors.midTone,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },

    // ── Progress Bar ───────────────────────────────────────────────────────
    progressContainer: {
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
      gap: SPACING.xs,
    },

    progressMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },

    progressLabel: {
      fontSize: 11,
      fontFamily: Fonts.OSREGULAR,
      color: subtleText,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },

    progressBarBackground: {
      height: 3,
      width: "100%",
      backgroundColor: divider,
      borderRadius: RADIUS.full,
      overflow: "hidden",
    },

    progressBarFill: {
      height: "100%",
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderRadius: RADIUS.full,
    },

    row: {
      flexDirection: "column",
      justifyContent: "space-between",
    },
    logo: {
      width: 50,
      height: 50,
      resizeMode: "contain",
    },

    teamName: {
      marginLeft: 16,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.white,
    },

    // ── Image Upload ───────────────────────────────────────────────────────
    imageUploadBox: {
      borderWidth: 1,
      borderColor: border,
      borderStyle: "dashed",
      borderRadius: RADIUS.md,
      height: 100,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: surface,
      overflow: "hidden",
    },

    profileImageUploadBox: {
      borderWidth: 1,
      borderColor: border,
      borderStyle: "dashed",
      borderRadius: RADIUS.full,
      height: 110,
      width: 110,
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: surface,
      overflow: "hidden",
      marginVertical: SPACING.sm,
    },
    bannerImage: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
    },

    // ── Section Headings ───────────────────────────────────────────────────
    heading: {
      fontSize: 11,
      fontFamily: Fonts.OSMEDIUM,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: subtleText,
      marginTop: SPACING.lg,
      marginBottom: SPACING.xs,
    },

    divider: {
      height: 1,
      backgroundColor: divider,
      marginVertical: SPACING.xs,
    },

    reviewInput: {
      backgroundColor: surface,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderWidth: 1,
      borderColor: border,
      marginTop: SPACING.xs,
    },

    reviewContainer: {
      justifyContent: "center",
      alignContent: "center",
    },
    favoritesContainer: {
      flex: 1,
    },
    imagePreview: {
      height: 120,
      width: 120,
      borderRadius: 100,
      alignSelf: "center",
    },
    imagePlaceholder: {
      color: isDark ? Colors.darkGray : Colors.lightGray,
      textAlign: "center",
      fontFamily: Fonts.OSLIGHT,
      fontSize: 12,
    },
    reviewText: {
      marginVertical: 8,
      color: Colors.midTone,
      fontFamily: Fonts.OSREGULAR,
    },

    skipText: {
      color: Colors.midTone,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },
    teamCardList: {
      flexDirection: "row",
      flex: 1,
      alignItems: "center",
      marginTop: 12,
      padding: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
    },

    tabBarWrapper: { paddingHorizontal: 80 },
  });
};
