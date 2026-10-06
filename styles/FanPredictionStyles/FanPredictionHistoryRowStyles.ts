import { Colors, Fonts, globalStyles } from "constants/styles";
import { StyleSheet } from "react-native";
import { gameCardStyles } from "styles/GamecardStyles/GameCardStyles";

export const fanPredictionHistoryRowStyles = (isDark: boolean) => {
  const global = globalStyles(isDark);
  const game = gameCardStyles(isDark);
  return StyleSheet.create({
    container: {
      ...game.card,
      height: undefined,
      flexDirection: "column",
      alignItems: "stretch",
      gap: 12,
      padding: 14,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: "transparent",
    },
    score: { ...game.teamScore, width: undefined, minWidth: 30, fontSize: 24 },
    record: {
      ...game.teamRecord,
      width: undefined,
      minWidth: 30,
      fontSize: 12,
    },
    matchup: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    team: { ...game.teamSection, gap: 4 },
    teamCode: { ...game.teamName, fontFamily: Fonts.BOLD, fontSize: 14 },
    logoFallback: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    info: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    meta: { ...global.caption, textAlign: "center" },

    divider: {
      height: 12,
      width: 1,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    picked: {
      ...global.caption,
      color: isDark ? Colors.dark.green : Colors.light.green,
      fontSize: 10,
      borderRadius: 4,
      lineHeight: 14,
    },
    pickSpacer: { height: 14 },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingTop: 8,
    },
    pickSummary: { ...global.caption, flex: 1 },
    outcomeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    outcome: { ...global.caption, fontSize: 11, fontFamily: Fonts.MEDIUM },
  });
};
