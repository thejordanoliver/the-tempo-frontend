import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const volleyballStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    content: { padding: 12, gap: 12, paddingBottom: 28 },
    card: {
      padding: 12,
      gap: 10,
      borderRadius: 12,
      backgroundColor: theme.itemBackground,
    },
    matchCard: {
      flexDirection: "column",
      alignItems: "stretch",
      height: "auto",
      gap: 10,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    spread: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
    },
    team: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minWidth: 0,
    },
    logo: { width: 30, height: 30 },
    grow: { flex: 1, minWidth: 0 },
    score: {
      color: theme.text,
      fontFamily: Fonts.SPORTS_BOLD,
      fontSize: 24,
      minWidth: 28,
      textAlign: "center",
    },
    point: {
      color: theme.text,
      fontFamily: Fonts.MEDIUM,
      fontSize: 15,
      width: 32,
      textAlign: "center",
    },
    rule: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.transparentGray,
      paddingBottom: 8,
    },
    live: { color: theme.green },
    link: {
      color: theme.blue,
      fontFamily: Fonts.MEDIUM,
      fontSize: 15,
      paddingVertical: 8,
    },
    selected: { backgroundColor: theme.transparentBlue, borderRadius: 6 },
    column: { gap: 8 },
    gridRow: { gap: 12 },
    table: { minWidth: 330, gap: 8 },
    stat: { minWidth: 72, textAlign: "right" },
    teamName: { width: 155 },
  });
};
