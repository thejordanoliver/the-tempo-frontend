import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const ROW_HEIGHT = 60; // or whatever fits your design
const RANK_WIDTH = 40;
const TEAM_COL_WIDTH = 60; // Increased to fit badge
const STAT_COL_WIDTH = 70;

export const standingsStyles = (isDark: boolean) =>
  StyleSheet.create({
    contentContainer: {
      paddingBottom: 100,
      paddingHorizontal: 12,
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
    },
    center: {
      flex: 1,
    },

    header: {
      flexDirection: "row",
      padding: 12,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    heading: {
      fontSize: 20,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
    droppedHeading: {
      fontSize: 20,
      paddingBottom: 4,
      marginBottom: 4,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.dark.white : Colors.light.black,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    dropdownRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 12,
    },
    statsHeaderRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingVertical: 10,
      height: ROW_HEIGHT,
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
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
    collegeDivisionHeader: {
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 16,
      marginTop: 4,
      paddingHorizontal: 12,
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
    headerText: {
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 12,
      textAlign: "center",
    },
    statText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    statusBadge: {
      marginLeft: 2,
      paddingVertical: 2,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    statusBadgeText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: Colors.white,
    },
    statusText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: 4,
      flexWrap: "wrap",
    },
    legendContainer: {
      marginTop: 10,
      paddingTop: 10,
    },

    legendItemsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingRight: 10,
    },

    legendItem: {
      width: "40%", // 2-column grid
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
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
    emptyText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
