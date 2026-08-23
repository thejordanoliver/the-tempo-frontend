import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const ROW_HEIGHT = 50;

export const awardTableStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { marginVertical: 12 },
    contentContainerStyle: {
      paddingHorizontal: 12,
      paddingBottom: 100,
      paddingTop: 12,
    },

    table: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },

    errorText: {
      marginTop: 20,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      height: ROW_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    headerName: {
      paddingHorizontal: 10,
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    headerCell: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    row: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.lightGray,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: ROW_HEIGHT,
      paddingHorizontal: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.lightGray,
    },
    leftContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    rightContainer: { alignItems: "flex-end" },
    teamLogo: {
      width: 28,
      height: 28,
    },
    nameWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    playerName: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    seasonText: {
      opacity: 0.75,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    showMoreLess: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    dropdownRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
    },
  });
