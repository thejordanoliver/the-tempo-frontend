import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

const ROW_HEIGHT = 50;

export const awardTableStyles = (isDark: boolean) =>
  StyleSheet.create({
    contentContainerStyle: {
      paddingHorizontal: 12,
      paddingBottom: 100,
      paddingTop: 12,
    },
    container: { marginVertical: 12 },
    table: {
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      borderColor: isDark ? Colors.white : Colors.black,
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
      backgroundColor: Colors.darkGray + "20",
    },

    headerName: {
      paddingHorizontal: 10,
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    headerCell: {
      textAlign: "center",
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    leftContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
    rightContainer: { alignItems: "flex-end" },
    teamLogo: { width: 28, height: 28 },
    nameWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    playerName: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    seasonText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      opacity: 0.75,
      color: isDark ? Colors.white : Colors.black,
    },
    showMoreLess: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    dropdownRow: {
      flexDirection: "row",
      gap: 8,
      justifyContent: "flex-end",
    },
  });
