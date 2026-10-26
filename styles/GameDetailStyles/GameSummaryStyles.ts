import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const GameSummaryStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  return StyleSheet.create({
    latestLabel: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: theme.icon,
    },
    wrapper: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },

    sectionLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 10,
      letterSpacing: 0.6,
      color: theme.icon,
    },
    scoreLegend: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendLogo: {
      width: 16,
      height: 16,
    },
    listContainer: {
      height: 420,
    },
    playRow: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: 10,
      paddingHorizontal: 12,
      paddingTop: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    scoringRow: {
      backgroundColor: theme.transparentItemBackground,
    },
    timeColumn: {
      width: 44,
      paddingTop: 3,
      alignItems: "flex-end",
    },
    clockText: {
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      lineHeight: 22,
      color: theme.text,
    },
    periodText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: theme.icon,
      marginTop: 2,
    },
    timelineColumn: {
      width: 32,
      alignItems: "center",
    },
    teamMarker: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      backgroundColor: theme.itemBackground,
    },
    scoringMarker: {
      borderWidth: 1,
      borderColor: theme.green,
    },
    logo: {
      width: 24,
      height: 24,
    },
    neutralDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.icon,
    },
    playContent: {
      flex: 1,
      minWidth: 0,
      paddingBottom: 16,
    },
    playMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 7,
    },
    eventLabel: {
      flex: 1,
      fontFamily: Fonts.MEDIUM,
      fontSize: 11,
      color: theme.icon,
    },
    scoringLabel: {
      color: theme.green,
    },
    playDesc: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 21,
      color: theme.text,
    },
    scorePill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: theme.itemBackground,
    },
    scoringScorePill: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.green,
    },
    scoreText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 15,
      color: theme.text,
      fontVariant: ["tabular-nums"],
    },
    scoreDivider: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: theme.icon,
    },
  });
};
