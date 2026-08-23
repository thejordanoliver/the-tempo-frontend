import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const COLUMN_WIDTH = 50;
const NAME_COLUMN_WIDTH = 160;
const PLAYER_ROW_HEIGHT = 36;

export const boxScoreStyles = (isDark: boolean) =>
  StyleSheet.create({
    playerColumn: {
      flexDirection: "row",
      width: "100%",
    },
    loading: {
      padding: 20,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    error: {
      padding: 20,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    teamContainer: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },
    teamLabel: {
      marginVertical: 10,
      paddingHorizontal: 12,
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    playerNameColumn: {
      width: NAME_COLUMN_WIDTH,
    },
    tableHeader: {
      flexDirection: "row",
      height: 40,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    tableRow: {
      flexDirection: "row",
      height: PLAYER_ROW_HEIGHT,
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
    },
    cellName: {
      width: NAME_COLUMN_WIDTH,
      paddingHorizontal: 8,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    cell: {
      width: COLUMN_WIDTH,
      paddingHorizontal: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    didNotPlayerRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    didNotPlayCell: {
      flex: 1,
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      color: Colors.midTone,
      textAlign: "center",
    },
    cellHeader: {
      width: COLUMN_WIDTH,
      paddingHorizontal: 4,
      fontFamily: Fonts.MEDIUM,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    cellContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    teamLogo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
    teamHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },
    showMoreLess: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
  });
