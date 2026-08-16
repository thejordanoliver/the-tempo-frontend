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
      borderRadius: 16,
      borderWidth: 1,
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
      fontSize: 17,
      fontFamily: Fonts.BOLD,
    },

    tier: {
      fontSize: 12,
      fontFamily: Fonts.BOLD,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },

    categoryPill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
    },

    categoryText: {
      fontSize: 11,
      fontFamily: Fonts.BOLD,
    },

    description: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.REGULAR,
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
      fontSize: 12,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    statusText: {
      fontSize: 12,
      fontFamily: Fonts.SEMIBOLD,
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
