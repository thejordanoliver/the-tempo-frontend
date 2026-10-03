import { Colors, Fonts, globalStyles } from "constants/styles";
import { StyleSheet } from "react-native";

export const fanPredictionRankingsStyles = (isDark: boolean) => {
  const colors = isDark ? Colors.dark : Colors.light;
  const global = globalStyles(isDark);

  return StyleSheet.create({
    screen: { backgroundColor: colors.background },
    content: { padding: 12, paddingBottom: 40 },
    header: { gap: 20, marginBottom: 12 },
    intro: {
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
    },
    introHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    trophy: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.transparentGold,
    },
    introCopy: { flex: 1, minWidth: 0, gap: 2 },
    eyebrow: { ...global.label },
    title: { ...global.subheading },
    description: { ...global.secondaryText },
    rulesToggle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 6,
      gap: 8,
    },
    rulesLabel: { ...global.secondaryText, fontFamily: Fonts.MEDIUM, color: colors.text },
    rules: {
      gap: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    record: { gap: 10 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    sectionTitle: { ...global.title },
    sectionNote: { ...global.caption },
    separator: { height: 8 },
    note: { ...global.caption },
    status: {
      marginBottom: 12,
      padding: 16,
      gap: 12,
      alignItems: "flex-start",
      borderRadius: 8,
      backgroundColor: colors.errorBackground,
    },
    empty: {
      padding: 24,
      gap: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
    },
    emptyTitle: { ...global.emptyTitle },
    emptyText: { ...global.emptyText },
    retry: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  });
};
