import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const COLUMN_WIDTH = 52;
const NAME_COLUMN_WIDTH = 148;
const PLAYER_ROW_HEIGHT = 40;

export const BoxScoreStyles = (isDark: boolean) => {
  const textColor = isDark ? Colors.white : Colors.black;
  const surfaceColor = isDark
    ? Colors.dark.transparentItemBackground
    : Colors.light.transparentItemBackground;
  const alternatingRowColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  return StyleSheet.create({
    teamsContainer: {
      gap: 16,
    },
    messageCard: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 96,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
      borderRadius: 14,
      backgroundColor: surfaceColor,
    },
    emptyText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: textColor,
      textAlign: "center",
    },
    errorText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    playerColumn: {
      flexDirection: "row",
      width: "100%",
    },
    teamContainer: {
      width: "100%",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
      borderRadius: 14,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
      overflow: "hidden",
    },
    teamHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 64,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
      backgroundColor: surfaceColor,
    },
    teamIdentity: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    teamLogoContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: alternatingRowColor,
    },
    teamLogo: {
      width: 30,
      height: 30,
      resizeMode: "contain",
    },
    teamTextContainer: {
      flex: 1,
      minWidth: 0,
    },
    teamSide: {
      marginBottom: 1,
      fontFamily: Fonts.MEDIUM,
      fontSize: 11,
      letterSpacing: 0.8,
      color: Colors.midTone,
      textTransform: "uppercase",
    },
    teamLabel: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: textColor,
    },
    section: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 36,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    categoryLabel: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: textColor,
    },
    tableIntro: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 36,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    tableTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: textColor,
    },
    scrollHint: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: Colors.midTone,
    },
    playerNameColumn: {
      zIndex: 1,
      width: NAME_COLUMN_WIDTH,
      flexShrink: 0,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: Colors.midTone,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
    },
    statsScroller: {
      flex: 1,
    },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      height: PLAYER_ROW_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
      backgroundColor: surfaceColor,
    },
    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      height: PLAYER_ROW_HEIGHT,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    rowAlt: {
      backgroundColor: alternatingRowColor,
    },
    totalsRow: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: Colors.midTone,
      backgroundColor: surfaceColor,
    },
    playerLink: {
      flex: 1,
      justifyContent: "center",
    },
    cellName: {
      width: NAME_COLUMN_WIDTH,
      paddingHorizontal: 10,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: textColor,
    },
    cell: {
      width: COLUMN_WIDTH,
      paddingHorizontal: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      fontVariant: ["tabular-nums"],
      color: textColor,
      textAlign: "center",
    },
    didNotPlayerRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    didNotPlayCell: {
      flex: 1,
      paddingHorizontal: 8,
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      color: Colors.midTone,
      textAlign: "center",
    },
    cellHeader: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      color: textColor,
    },
    cellContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: COLUMN_WIDTH,
    },
    totalText: {
      fontFamily: Fonts.BOLD,
    },
    showMoreLessButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      paddingHorizontal: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: Colors.midTone,
    },
    showMoreLess: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: textColor,
    },
  });
};
