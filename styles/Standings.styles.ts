import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

const ROW_HEIGHT = 60; // or whatever fits your design
const RANK_WIDTH = 40;
const TEAM_COL_WIDTH = 100; // Increased to fit badge
const STAT_COL_WIDTH = 70;

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? Colors.netural.darkGray
        : Colors.netural.lightGray,
    },
    heading: {
      fontSize: 22,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.netural.white : Colors.netural.black,
    },
    row: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? Colors.netural.darkGray
        : Colors.netural.lightGray,
      paddingVertical: 10,
      height: ROW_HEIGHT,
      minHeight: ROW_HEIGHT,
      maxHeight: ROW_HEIGHT,
    },
    rankContainer: {
      width: RANK_WIDTH,
      justifyContent: "center",
      alignItems: "center",
    },
    rankText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 16,
      color: isDark ? Colors.netural.white : Colors.netural.black,
    },
    teamInfo: {
      width: TEAM_COL_WIDTH,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 10,
    },
    logo: {
      width: 28,
      height: 28,
      marginRight: 6,
    },
    teamName: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.netural.white : Colors.netural.black,
      width: 32,
    },
    collegeTeamName: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.netural.white : Colors.netural.black,
      width: 40,
    },
    collegeTeamTrend: {
      fontSize: 10,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.netural.white : Colors.netural.black,
      width: 40,
    },
    teamHeaderText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 16,
      color: isDark ? Colors.netural.white : Colors.netural.black,
    },
    statCell: {
      width: STAT_COL_WIDTH,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 5,
    },
    statText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.netural.white : Colors.netural.black,
    },
    statTextSecondary: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.netural.darkGray : Colors.netural.lightGray,
    },
    statTextPositive: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },
    statTextNegative: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: "tomato",
    },
    statusBadge: {
      marginLeft: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      minWidth: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    statusBadgeText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: isDark ? Colors.netural.white : Colors.netural.black,
    },
    legendContainer: {
      marginTop: 20,
      paddingTop: 10,
    },
    legendItemsContainer: {
      flexWrap: "wrap",
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
      marginTop: 8,
    },
    legendLabel: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.netural.white : Colors.netural.black,
    },

    droppedoutNames: {
      color: isDark ? Colors.netural.lightGray : Colors.netural.darkGray,
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      marginVertical: 2,
      marginRight: 8,
    },
  });
