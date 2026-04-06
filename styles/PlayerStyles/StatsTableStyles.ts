import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const statsTableStyles = (isDark: boolean) => {
  const borderColor = isDark ? Colors.darkGray : Colors.lightGray;
  const textColor = isDark ? Colors.white : Colors.black;
  const altRowColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  return StyleSheet.create({
    container: {
      paddingTop: 24,
    },

    dropdownContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    dropdown: {
      position: "absolute",
      right: 0,
      top: 18,
    },

    tableWrapper: {
      flexDirection: "row",
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor,
    },

    headerRow: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    row: {
      flexDirection: "row",
      paddingVertical: 8,
      alignItems: "center",
      borderBottomColor: borderColor,
      borderBottomWidth: 1,
    },

    rowAlt: {
      backgroundColor: altRowColor,
    },

    careerCell: {
      minWidth: 60,
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: Colors.white,
    },

    cell: {
      minWidth: 60,
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    seasonHeaderCell: {
      minWidth: 60,
      flex: 1,
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: textColor,
      textTransform: "uppercase",
    },

    careerHeaderCell: {
      fontFamily: Fonts.OSBOLD,
      color: Colors.white,
      paddingHorizontal: 8,
      textTransform: "uppercase",
    },

    headerCell: {
      fontFamily: Fonts.OSBOLD,
      color: textColor,
      paddingHorizontal: 8,
      textTransform: "uppercase",
    },

    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    seasonCell: {
      minWidth: 80,
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      color: textColor,
      borderBottomColor: borderColor,
      borderBottomWidth: 1,
    },

    seasons: {
      minWidth: 60,
      flex: 1,
      textAlign: "left",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: textColor,
    },

    legendContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      marginTop: 12,
      borderTopColor: borderColor,
      borderTopWidth: 1,
    },

    legendColorBox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      marginRight: 8,
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

    seasonText: {
      minWidth: 70,
      paddingHorizontal: 8,
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: textColor,
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
    rowAltLight: {
      backgroundColor: Colors.light.itemBackground,
    },

    rowAltDark: {
      backgroundColor: Colors.dark.itemBackground,
    },
  });
};
