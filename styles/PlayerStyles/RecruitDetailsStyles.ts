import { Colors, Fonts, globalStyles } from "constants/styles";
import { StyleSheet } from "react-native";

export const RecruitDetailsStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const typography = globalStyles(isDark);
  return StyleSheet.create({
    container: { paddingBottom: 24, gap: 10 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    section: {
      padding: 12,
      gap: 10,
      borderRadius: 8,
      backgroundColor: theme.itemBackground,
      overflow: "hidden",
    },
    heading: { ...typography.subtitle, fontFamily: Fonts.BOLD },
    text: { ...typography.text, fontSize: 14, lineHeight: 20 },
    secondaryText: { ...typography.secondaryText },
    label: { ...typography.label, fontSize: 10, lineHeight: 14 },
    statsRow: { flexDirection: "row", paddingVertical: 4 },
    stat: { flex: 1, minWidth: 0, alignItems: "center", gap: 4 },
    statValue: {
      color: theme.text,
      fontFamily: Fonts.BOLD,
      fontSize: 28,
      lineHeight: 32,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      paddingTop: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.transparentGray,
    },
    stars: {
      ...typography.secondaryText,
      fontFamily: Fonts.MEDIUM,
      color: theme.gold,
    },
    badge: {
      ...typography.caption,
      color: theme.gold,
      backgroundColor: theme.transparentGold,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    status: {
      ...typography.caption,
      fontFamily: Fonts.MEDIUM,
      color: theme.secondaryText,
    },
    prediction: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.transparentGray,
    },
    schoolRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    teamLogo: { width: 28, height: 28, flexShrink: 0 },
    school: { flex: 1, minWidth: 0 },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.itemBackground,
    },
    summaryValue: { ...typography.textMedium, fontSize: 14, lineHeight: 20 },
  });
};
