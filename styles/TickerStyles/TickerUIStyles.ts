import { StyleSheet } from "react-native";

export const tickerStyles = StyleSheet.create({
  page: { flex: 1 },
  action: { gap: 8 },
  rowLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  label: { flexShrink: 1 },
  feedbackCopy: { flex: 1 },
  content: { padding: 12, paddingTop: 20, gap: 16 },
  card: { borderRadius: 12, padding: 16, gap: 14 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  value: { flex: 1, textAlign: "right" },
  busy: { flexDirection: "row", alignItems: "center", gap: 10 },
  device: {
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
