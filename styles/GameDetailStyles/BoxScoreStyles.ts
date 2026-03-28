import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

const COLUMN_WIDTH = 50;
const NAME_COLUMN_WIDTH = 160;
const PLAYER_ROW_HEIGHT = 36;

export const boxScoreStyles = (isDark: boolean) =>
  StyleSheet.create({
    playerColumn: { flexDirection: "row", width: "100%" },
    loading: {
      textAlign: "center",
      padding: 20,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    error: {
      textAlign: "center",
      padding: 20,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    teamContainer: {
      borderRadius: 8,
      overflow: "hidden",
      borderColor: Colors.midTone,
      borderWidth: 1,
    },
    teamLabel: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      marginVertical: 10,
      paddingHorizontal: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    playerNameColumn: {
      width: NAME_COLUMN_WIDTH,
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      paddingVertical: 8,
      height: 40,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingVertical: 6,
      height: PLAYER_ROW_HEIGHT,
      borderColor: Colors.midTone,
    },
    cellName: {
      width: NAME_COLUMN_WIDTH,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      paddingHorizontal: 8,
      color: isDark ? Colors.white : Colors.black,
    },
    cell: {
      width: COLUMN_WIDTH,
      fontSize: 13,
      textAlign: "center",
      paddingHorizontal: 4,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSREGULAR,
    },
    didNotPlayerRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    didNotPlayCell: {
      flex: 1,
      fontSize: 12,
      textAlign: "center",
      color: Colors.midTone,
      fontFamily: Fonts.OSMEDIUM,
    },
    cellHeader: {
      width: COLUMN_WIDTH,
      fontSize: 13,
      textAlign: "center",
      paddingHorizontal: 4,
      color: isDark ? Colors.white : Colors.black,
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
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
    },
  });
