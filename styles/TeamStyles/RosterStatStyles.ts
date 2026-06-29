import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const PLAYER_NAME_WIDTH = 140;
const STAT_CELL_WIDTH = 80;

export const rosterStatsStyles = (isDark: boolean) =>
  StyleSheet.create({
    center: { alignItems: "center", justifyContent: "center" },
    container: {
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContainer: {
      flexGrow: 1,
      borderRadius: 4,
      overflow: "hidden",
      paddingHorizontal: 12,
      paddingBottom: 100,
    },
    fixedColumnContainer: {
      zIndex: 2,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    table: {
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      overflow: "hidden",
    },
    tableWrapper: {
      flexDirection: "row",
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      justifyContent: "flex-start",
      alignItems: "center",
      minHeight: 40,
    },
    teamTableContainer: { flex: 1, gap: 20 },

    teamTableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: 40,
      paddingHorizontal: 8,
    },

    tableCell: {
      padding: 8,
    },

    nameColumn: {
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
      width: PLAYER_NAME_WIDTH,
      zIndex: 10,
      elevation: 10,
    },

    playerName: {
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },

    statValue: {
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      width: STAT_CELL_WIDTH,
    },
    cardWrapper: { flexDirection: "row", alignItems: "flex-end" },
    cardContainer: {
      justifyContent: "center",
      alignItems: "flex-start",
    },
    statCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      width: 260,
      borderRadius: 10,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cardLabel: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 20,
      marginBottom: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    cardName: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 14,
      marginTop: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    cardValue: {
      fontSize: 24,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    nameValue: { marginLeft: 12, flexDirection: "column" },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      paddingTop: 8,
      marginVertical: 4,
      borderWidth: 1,
      borderColor: Colors.midTone,
    },
    divider: {
      width: 1,
      height: "72%",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      marginHorizontal: 16,
    },
    number: {
      fontSize: 10,
      color: Colors.midTone,
      lineHeight: 14,
      transform: [{ translateY: 3 }],
    },
    headerText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    nameHeaderText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: PLAYER_NAME_WIDTH,
    },
    categoryTitle: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 20,
      marginBottom: 4,
      color: isDark ? Colors.white : Colors.black,
      marginLeft: 4,
    },

    tabScene: {
      flex: 1,
    },
    hiddenTabScene: {
      display: "none",
    },
  });
