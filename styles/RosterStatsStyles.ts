import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const rosterStatsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { paddingTop: 20, padding: 12, flex: 1 },
    scrollContainer: { flexGrow: 1 },
    fixedColumnContainer: {
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
      zIndex: 2,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    tableWrapper: {
      borderRadius: 8,
      overflow: "hidden", // 🔑 REQUIRED for clipping rows
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    table: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomColor: Colors.midTone,
      justifyContent: "space-between",
    },
    headerRow: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    tableCell: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 13,
      textAlign: "left",
    },
    teamStatsTablecell: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 13,
      textAlign: "left",
    },
    headerText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.white : Colors.light.black,
      textTransform: "uppercase",
    },
    playerName: {
      fontFamily: Fonts.OSBOLD,
      textAlign: "left",
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
    statValue: {
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    categoryTitle: {
      fontSize: 16,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginBottom: 8,
      marginLeft: 4,
    },
    center: { padding: 20, alignItems: "center", justifyContent: "center" },
    statCard: {
      borderRadius: 10,
      padding: 12,
      alignItems: "center",
      width: 260,
      flexDirection: "row",
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
    nameValue: {
      marginLeft: 12,
      flexDirection: "column",
      justifyContent: "center",
    },
    cardWrapper: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    cardName: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 14,
      marginTop: 4,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
    cardValue: {
      fontSize: 24,
      fontFamily: Fonts.OSBOLD,
      color: Colors.midTone,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginVertical: 4,
      paddingTop: 8,
      borderWidth: 1,
      borderColor: Colors.midTone,
    },
    cardContainer: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
    },
    divider: {
      width: 1,
      height: "72%",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      alignSelf: "flex-end",
      marginHorizontal: 16,
    },
    number: {
      fontSize: 10,
      color: Colors.midTone,
      textAlignVertical: "bottom",
      lineHeight: 14,
      transform: [{ translateY: 3 }],
    },
  });
