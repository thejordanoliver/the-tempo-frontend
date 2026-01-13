import { Fonts, Colors } from "constants/Styles";
import { StyleSheet } from "react-native";


const COLUMN_WIDTH = 50;
const NAME_COLUMN_WIDTH = 160;
const PLAYER_ROW_HEIGHT = 36;
const COLLAPSED_ROWS = 5;
const COLLAPSED_HEIGHT = PLAYER_ROW_HEIGHT * COLLAPSED_ROWS;

export const boxScoreStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    loading: {
      textAlign: "center",
      padding: 20,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    error: {
      textAlign: "center",
      padding: 20,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: lighter
        ? Colors.dark.lightRed
        : isDark
        ? Colors.dark.lightRed
        : Colors.light.red,
    },
    teamBox: {
      borderRadius: 10,
      overflow: "hidden",
      borderColor: Colors.midTone,
      borderWidth: 1,
    },
    teamLabel: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      marginVertical: 10,
      paddingHorizontal: 12,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      paddingVertical: 8,
      height: 40,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.lightGray
        : Colors.darkGray,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingVertical: 6,
      height: PLAYER_ROW_HEIGHT,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.darkGray
        : Colors.lightGray,
    },
    cellName: {
      width: NAME_COLUMN_WIDTH,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      paddingHorizontal: 8,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    cell: {
      width: COLUMN_WIDTH,
      fontSize: 13,
      textAlign: "center",
      paddingHorizontal: 4,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSREGULAR,
    },
    cellHeader: {
      width: COLUMN_WIDTH,
      fontSize: 13,
      textAlign: "center",
      paddingHorizontal: 4,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
    },
    cellContainer: { justifyContent: "center", alignItems: "center" },
    teamLogo: { width: 28, height: 28, resizeMode: "contain" },
    teamHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },
    showMoreLess: {
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
    },
  });
