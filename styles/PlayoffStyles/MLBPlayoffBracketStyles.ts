import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const MLB_BRACKET_COLUMN_WIDTH = 190;

export const MLBPlayoffBracketStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 12, paddingVertical: 16, gap: 18 },
    leagueTitle: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      textTransform: "uppercase",
    },
    leagueBoard: {
      position: "relative",
      flexDirection: "row",
      gap: 18,
      alignItems: "flex-start",
    },
    column: { width: MLB_BRACKET_COLUMN_WIDTH, gap: 14, zIndex: 1 },
    roundTitle: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.MEDIUM,
      fontSize: 15,
      textAlign: "center",
      textTransform: "uppercase",
    },
    matchups: { gap: 18 },
    connectorLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 0,
    },
    connectorHorizontal: {
      position: "absolute",
      height: 1,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    connectorVertical: {
      position: "absolute",
      width: 1,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    matchup: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      elevation: 5,
      overflow: "hidden",
    },
    seriesLabel: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
    },
    teamRow: {
      minHeight: 48,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    seed: {
      width: 20,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      textAlign: "center",
    },
    logo: {
      width: 34,
      height: 34,
    },
    logoPlaceholder: {
      width: 34,
      height: 34,
    },
    teamName: {
      flex: 1,
      marginLeft: 4,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
    },
    winsBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 100,
      backgroundColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
    },
    winsText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      textAlign: "center",
    },
    empty: {
      padding: 24,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.REGULAR,
      fontSize: 18,
      textAlign: "center",
    },
  });
