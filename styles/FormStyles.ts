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
      marginBottom: 40,
      padding: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
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
      borderWidth: 1,
      borderColor: focusBorder,
    },

    input: {
      flexDirection: "row",
      alignItems: "center",
      height: INPUT_HEIGHT,
      paddingHorizontal: SPACING.lg,
      borderRadius: 8,
      backgroundColor: surface,
    },

    inputText: {
      flex: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: text,
    },

    forgotPasswordLink: {
      alignSelf: "center",
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
    },

    forgotPasswordText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: Colors.midTone,
    },

    // ── Progress Bar ───────────────────────────────────────────────────────
    progressContainer: {
      gap: SPACING.xs,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
    },

    progressMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: SPACING.xs,
    },

    progressLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      letterSpacing: 0.5,
      color: subtleText,
      textTransform: "uppercase",
    },

    progressBarBackground: {
      width: "100%",
      height: 3,
      borderRadius: RADIUS.full,
      backgroundColor: divider,
      overflow: "hidden",
    },

    progressBarFill: {
      height: "100%",
      borderRadius: RADIUS.full,
      backgroundColor: isDark ? Colors.white : Colors.black,
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
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: Colors.white,
    },

    // ── Image Upload ───────────────────────────────────────────────────────
    imageUploadBox: {
      alignItems: "center",
      justifyContent: "center",
      height: 100,
      borderWidth: 1,
      borderColor: border,
      borderStyle: "dashed",
      borderRadius: RADIUS.md,
      backgroundColor: surface,
      overflow: "hidden",
    },

    profileImageUploadBox: {
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      width: 110,
      height: 110,
      marginVertical: SPACING.sm,
      borderWidth: 1,
      borderColor: border,
      borderStyle: "dashed",
      borderRadius: RADIUS.full,
      backgroundColor: surface,
      overflow: "hidden",
    },
    bannerImage: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
    },

    // ── Section Headings ───────────────────────────────────────────────────
    heading: {
      marginTop: SPACING.lg,
      marginBottom: SPACING.xs,
      fontFamily: Fonts.MEDIUM,
      fontSize: 11,
      letterSpacing: 0.6,
      color: subtleText,
      textTransform: "uppercase",
    },

    divider: {
      height: 1,
      marginVertical: SPACING.xs,
      backgroundColor: divider,
    },

    reviewInput: {
      marginTop: SPACING.xs,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderWidth: 1,
      borderColor: border,
      borderRadius: RADIUS.md,
      backgroundColor: surface,
    },

    reviewContainer: {
      alignContent: "center",
      justifyContent: "center",
    },
    favoritesContainer: {
      flex: 1,
    },
    imagePreview: {
      alignSelf: "center",
      width: 120,
      height: 120,
      borderRadius: 100,
    },
    imagePlaceholder: {
      fontFamily: Fonts.LIGHT,
      fontSize: 12,
      color: isDark ? Colors.darkGray : Colors.lightGray,
      textAlign: "center",
    },
    reviewText: {
      marginVertical: 8,
      fontFamily: Fonts.REGULAR,
      color: Colors.midTone,
    },

    skipText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: Colors.midTone,
    },
    teamCardList: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      padding: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    tabBarWrapper: { paddingHorizontal: 80 },
  });
};
