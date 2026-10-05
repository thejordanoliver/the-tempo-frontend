import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const GAME_TEAM_STATS_ROW_HEIGHT = 80;

export const GameTeamStatsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: Colors.midTone,
      borderBottomRightRadius: 12,
      borderBottomLeftRadius: 12,
    },
    wrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      opacity: 0,
    },
    logosRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderTopRightRadius: 12,
      borderTopLeftRadius: 12,
    },
    teamContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    logo: {
      width: 32,
      height: 32,
      resizeMode: "contain",
    },
    teamLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    statSection: {
      height: GAME_TEAM_STATS_ROW_HEIGHT,
      paddingHorizontal: 12,
    },
    statLabel: {
      fontSize: 12,
      textAlign: "center",
      fontFamily: Fonts.MEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    row: {
      flex: 1,
      alignItems: "center",
      justifyContent: "space-between",
      flexDirection: "row",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    barText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    showMoreLessContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
    },
    showMoreLess: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
  });
