import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";


const ROW_HEIGHT = 50;

export const awardTableStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    table: {
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      borderColor: lighter
        ? Colors.white
        : isDark
        ? Colors.white
        : Colors.black,
    },

    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    headerRow: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: Colors.lightGray,
      backgroundColor: lighter ? "transparent" : Colors.darkGray + "20",
    },

    headerName: {
      paddingHorizontal: 10,
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    headerCell: {
      textAlign: "center",
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 13,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    row: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.lightGray,
    },

    nameRow: {
      height: ROW_HEIGHT,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.lightGray,
      paddingHorizontal: 10,
      justifyContent: "center",
    },
    nameWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    playerName: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    seasonText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      opacity: 0.75,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    cell: {
      justifyContent: "center",
      alignItems: "center",
    },

    cellText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    showMoreLess: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    dropdownRow: {
      flexDirection: "row",
      gap: 8,
      justifyContent: "flex-end",
    },
  });
