import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

const ROW_HEIGHT = 60; // or whatever fits your design
const RANK_WIDTH = 40;
const TEAM_COL_WIDTH = 60; // Increased to fit badge
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
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    heading: {
      fontSize: 22,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    row: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingVertical: 10,
      height: ROW_HEIGHT,
      minHeight: ROW_HEIGHT,
      maxHeight: ROW_HEIGHT,
      alignItems: "center",
    },
    rankContainer: {
      width: RANK_WIDTH,
      justifyContent: "center",
      alignItems: "center",
    },
    rankText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    text: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      marginVertical: 4,
    },
    subText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 12,
    },
    teamInfo: {
      width: TEAM_COL_WIDTH,
      flexDirection: "row",
      alignItems: "center",
    },
    teamInfoWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    logo: {
      width: 28,
      height: 28,
      marginRight: 6,
    },
    teamName: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: 32,
    },
    collegeTeamName: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: 40,
    },
    collegeTeamTrend: {
      fontSize: 10,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: 40,
    },
    teamHeaderText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
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
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    statTextSecondary: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.darkGray : Colors.lightGray,
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
      color: isDark ? Colors.white : Colors.black,
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
      color: isDark ? Colors.white : Colors.black,
    },

    droppedoutNames: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      marginVertical: 2,
      marginRight: 8,
    },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
