import { StyleSheet } from "react-native";

export const tickerDashboardStyles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 28,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredText: { textAlign: "center" },
  contentSummary: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    paddingVertical: 4,
  },
  leagueLogo: { width: 44, height: 44 },
  summaryCopy: { flex: 1, gap: 3 },
});
