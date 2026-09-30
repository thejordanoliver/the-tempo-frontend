import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const GRID_GAP = 8;

/* ---------------- STYLES ---------------- */

export const BadgePreviewSectionStyles = (isDark: boolean) =>
  StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      rowGap: GRID_GAP,
      columnGap: GRID_GAP,
      marginBottom: 12,
    },

    cardText: {
      alignItems: "center",
      gap: 4,
      width: "100%",
    },

    badgeName: {
      minHeight: 36,
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },

    badgeStatus: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 12,
      textAlign: "center",
    },

    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 24,
    },

    retryButton: {
      width: "100%",
      
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryText: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.black : Colors.white,
    },
    buttonContainer: {
      width: "100%",
      marginVertical: 12,
    },
  });
