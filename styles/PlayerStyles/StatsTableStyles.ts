import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const statsTableStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingTop: 24,
      paddingHorizontal: 12,
    },
headerRowContainer: {
  flexDirection: "row",
  justifyContent: "space-between", // Heading left, dropdowns right
  alignItems: "center",
  marginHorizontal: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#ccc", // same as table
  paddingBottom: 4,
  marginBottom: 8,
},

dropdownContainer: {
  flexDirection: "row",
  alignItems: "center",
},

heading: {
  fontWeight: "bold",
},
dropdownWrapper: {
  marginLeft: 8, // spacing between dropdowns
},
    tableWrapper: {
      flexDirection: "row",
      borderRadius: 8,
      overflow: "hidden", // 🔑 REQUIRED for clipping rows
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
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
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomWidth: 1,
    },
    careerCell: {
      minWidth: 60,
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.white : Colors.white,
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
      color: isDark ? Colors.white : Colors.black,
      textTransform: "uppercase",
    },
    careerHeaderCell: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.white,
      paddingHorizontal: 8,
      textTransform: "uppercase",
    },
    headerCell: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
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
      color: isDark ? Colors.white : Colors.black,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomWidth: 1,
    },
    seasons: {
      minWidth: 60,
      flex: 1,
      textAlign: "left",
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      paddingHorizontal: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    legendContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      marginTop: 12,
      borderTopColor: Colors.lightGray,
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
      color: isDark ? Colors.white : Colors.black,
    },

    rowAltLight: {
      backgroundColor: Colors.light.itemBackground,
    },

    rowAltDark: {
      backgroundColor: Colors.dark.itemBackground,
    },

    glossaryContainer: {
      marginTop: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    headerName: {
      padding: 10,
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
      borderBottomWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
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
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSREGULAR,
    },
  });
