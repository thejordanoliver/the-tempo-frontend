import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const statsTableStyles = (isDark: boolean) => {
  const borderColor = isDark ? Colors.darkGray : Colors.lightGray;
  const textColor = isDark ? Colors.white : Colors.black;
  const altRowColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const rowHeight = 38;
  const statCellWidth = 80;
  const seasonColumnWidth = 80;
  const teamColumnWidth = 64;

  return StyleSheet.create({
    container: {
      paddingTop: 24,
    },

    dropdown: {
      position: "absolute",
      right: 0,
      top: 12,
    },

    tableWrapper: {
      flexDirection: "row",
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor,
    },

    fixedSection: {
      flexDirection: "row",
      flexShrink: 0,
    },

    scrollSection: {
      flex: 1,
    },

    headerRow: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    tableHeaderRow: {
      height: rowHeight,
    },

    row: {
      flexDirection: "row",
      height: rowHeight,
      alignItems: "center",
      borderBottomColor: borderColor,
      borderBottomWidth: 1,
    },

    lastRow: {
      borderBottomWidth: 0,
    },

    rowAlt: {
      backgroundColor: altRowColor,
    },

    careerCell: {
      width: statCellWidth,
      textAlign: "center",
      alignItems: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: Colors.white,
      includeFontPadding: false,
    },

    cell: {
      width: statCellWidth,
      textAlign: "center",
      textAlignVertical: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    fixedColumn: {
      width: seasonColumnWidth,
    },

    seasonColumn: {
      width: seasonColumnWidth,
    },

    teamColumn: {
      width: teamColumnWidth,
    },

    statScrollContent: {
      flexGrow: 0,
      flexShrink: 0,
      alignSelf: "flex-start",
    },

    fixedCell: {
      width: seasonColumnWidth,
      textAlign: "center",
      alignItems: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: textColor,
      includeFontPadding: false,
    },

    fixedTeamCell: {
      width: teamColumnWidth,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: textColor,
      includeFontPadding: false,
    },

    fixedHeaderCell: {
      fontFamily: Fonts.OSBOLD,
      color: textColor,
      textTransform: "uppercase",
    },

    fixedCareerCell: {
      width: teamColumnWidth,
      textAlign: "center",
      alignItems: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: Colors.white,
      includeFontPadding: false,
    },

    headerCell: {
      fontFamily: Fonts.OSBOLD,
      color: textColor,
      paddingHorizontal: 8,
      textTransform: "uppercase",
    },

    seasonTypeTabs: {
      flexDirection: "row",
      alignSelf: "flex-start",
      marginTop: 4,
      marginBottom: 12,
      borderWidth: 1,
      borderColor,
      borderRadius: 8,
      overflow: "hidden",
    },

    seasonTypeTab: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRightWidth: 1,
      borderRightColor: borderColor,
    },

    seasonTypeTabActive: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    lastSeasonTypeTab: {
      borderRightWidth: 0,
    },

    seasonTypeTabText: {
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    seasonTypeTabTextActive: {
      fontFamily: Fonts.OSBOLD,
      color: textColor,
    },

    legendText: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
    },

    best: {
      backgroundColor: isDark ? "#5c4300" : "#ffd700",
    },

    careerRow: {
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },

    glossaryContainer: {
      marginTop: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor,
    },

    headerName: {
      padding: 10,
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: textColor,
      borderBottomWidth: 1,
      borderColor,
    },

    glossaryAbbr: {
      width: 48,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      textTransform: "uppercase",
    },

    glossaryDisplayName: {
      flex: 1,
      fontSize: 12,
      color: textColor,
      fontFamily: Fonts.OSREGULAR,
    },
    glossaryRow: {
      flexDirection: "row",
    },
    rowAltLight: {
      backgroundColor: Colors.light.itemBackground,
    },

    rowAltDark: {
      backgroundColor: Colors.dark.itemBackground,
    },
  });
};
