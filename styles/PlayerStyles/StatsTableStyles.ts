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

    statsHeader: {
      minHeight: 44,
    },

    dropdown: {
      position: "absolute",
      right: 0,
      top: -12,
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

    rowAltLight: {
      backgroundColor: Colors.light.itemBackground,
    },

    rowAltDark: {
      backgroundColor: Colors.dark.itemBackground,
    },

    best: {
      backgroundColor: isDark ? "#5c4300" : "#ffd700",
    },

    careerRow: {
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
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

    fixedCareerHeaderCell: {
      color: Colors.white,
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

    seasonTabsPill: {
      flexDirection: "row",
      marginTop: 4,
      marginBottom: 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? Colors.transparentDarkGray : Colors.transparentLightGray ,
      backgroundColor: isDark ?  Colors.dark.itemBackground: Colors.light.itemBackground ,
    },

    tabContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: "transparent",
    },

    tabContainerActive: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderRadius: 999,
    },

    tabLabel: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    tabLabelActive: {
      color: isDark ? Colors.black : Colors.white,
    },

    legendText: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
    },

    glossaryContainer: {
      marginTop: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor,
      overflow: "hidden",
    },

    headerName: {
      padding: 10,
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: textColor,
      borderBottomWidth: 1,
      borderColor,
    },

    glossaryRow: {
      flexDirection: "row",
    },

    glossaryCell: {
      flex: 1,
      flexDirection: "row",
      padding: 12,
      backgroundColor: "transparent",
    },

    glossaryCellAlt: {
      backgroundColor: altRowColor,
    },

    glossaryCellWithRightBorder: {
      borderRightWidth: 1,
      borderRightColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
    },

    glossaryAbbr: {
      fontSize: 10,
      color: textColor,
      fontFamily: Fonts.OSBOLD,
    },

    glossaryDisplayName: {
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
    },
  });
};
