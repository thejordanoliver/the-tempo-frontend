import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
import type { ExploreWidgetSize } from "types/widgets";

export const collegePollWidgetStyles = (
  isDark: boolean,
  size: ExploreWidgetSize,
) => {
  const compact = size === "small";
  const dense = size === "large";

  return StyleSheet.create({
    container: {
      position: "relative",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },
    header: {
      position: compact ? "absolute" : "relative",
      top: compact ? 6 : undefined,
      right: compact ? 6 : undefined,
      zIndex: compact ? 30 : undefined,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: compact ? 6 : 12,
      minHeight: compact ? 30 : 58,
      paddingHorizontal: compact ? 0 : 12,
      borderBottomWidth: compact ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    headingCopy: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: compact ? 14 : 17,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      paddingTop: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: compact ? 10 : 11,
      color: Colors.midTone,
    },

    leagueButton: {
      position: "absolute",
      zIndex: 999,
      right: 10,
      top: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: compact ? 4 : 5,
      minHeight: compact ? 28 : 34,
      paddingHorizontal: compact ? 6 : 9,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
      overflow: "hidden",
    },

    leagueLogo: {
      width: 22,
      height: 22,
    },
    leagueLabel: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    table: {
      flex: 1,
      minHeight: 0,
    },
    page: {
      flex: 1,
      minHeight: 0,
    },
    carousel: {
      flex: 1,
      overflow: "hidden",
    },
    tableEditing: {
      opacity: 0.62,
    },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      height: dense ? 19 : 25,
      paddingHorizontal: compact ? 6 : 9,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      height: dense ? "17.5%" : compact ? 92 : "13.5%",
      paddingHorizontal: compact ? 6 : 9,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    columnLabel: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 9,
      color: Colors.midTone,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    rankColumn: {
      width: compact ? 22 : 25,
      textAlign: "center",
    },
    teamColumn: {
      flex: 1,
      minWidth: 0,
    },
    recordColumn: {
      width: compact ? 50 : 58,
      textAlign: "center",
    },
    pointsColumn: {
      width: compact ? 34 : 42,
      textAlign: "right",
    },
    rank: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    teamCell: {
      flexDirection: "row",
      alignItems: "center",
      gap: compact ? 4 : 6,
    },
    teamLogo: {
      width: dense ? 25 : compact ? 26 : 12,
      height: dense ? 25 : compact ? 26 : 12,
    },
    logoFallback: {
      alignItems: "center",
      justifyContent: "center",
      width: dense ? 12 : compact ? 26 : 18,
      height: dense ? 12 : compact ? 26 : 18,
      borderRadius: 6,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    logoFallbackText: {
      fontFamily: Fonts.BOLD,
      fontSize: 7,
      color: isDark ? Colors.white : Colors.black,
    },
    teamName: {
      flexShrink: 1,
      fontFamily: Fonts.MEDIUM,
      fontSize: dense ? 12 : compact ? 10 : 11,
      color: isDark ? Colors.white : Colors.black,
    },
    trend: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 1,
    },
    trendText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 8,
    },
    stat: {
      fontFamily: Fonts.REGULAR,
      fontSize: dense ? 8 : 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    state: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      padding: 12,
    },
    stateTitle: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    stateText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      lineHeight: 15,
      color: Colors.midTone,
      textAlign: "center",
    },
    pressed: {
      opacity: 0.72,
    },
    compactSlide: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 18,
      overflow: "hidden",
    },
    compactTeamGlow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: -1,
      width: "150%",
      height: "120%",
    },
    compactRankContainer: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      top: 8,
      left: 9,
      zIndex: 1,
      width: 40,
      height: 40,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    compactRank: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    compactLogo: {
      width: "48%",
      height: "48%",
      resizeMode: "contain",
    },
    compactCopy: {
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
      maxWidth: "100%",
    },
    compactTeamName: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    compactTrend: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 1,
    },
    compactTrendText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 20,
    },
    compactStatsContainer: {
      gap: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    compactStats: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    compactStatsDivider: {
      width: 1,
      height: 12,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
};
