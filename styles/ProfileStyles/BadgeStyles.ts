import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const badgeCardStyles = (
  isDark: boolean,
  isEarned: boolean,
  tierColor: string,
) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 16,
      borderWidth: 1,
      borderRadius: 16,
    },

    content: {
      flex: 1,
      gap: 8,
    },

    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },

    titleContainer: {
      flex: 1,
      gap: 2,
    },

    name: {
      fontFamily: Fonts.BOLD,
      fontSize: 17,
    },

    tier: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },

    categoryPill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },

    categoryText: {
      fontFamily: Fonts.BOLD,
      fontSize: 11,
    },

    description: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      lineHeight: 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    progressSection: {
      gap: 6,
    },

    progressLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },

    progressText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statusText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 12,
      color: isEarned ? tierColor : isDark ? Colors.lightGray : Colors.darkGray,
    },

    progressTrack: {
      height: 7,
      borderRadius: 999,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      borderRadius: 999,
    },
  });
