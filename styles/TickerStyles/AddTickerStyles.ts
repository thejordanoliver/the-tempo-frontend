import { StyleSheet } from "react-native";

export const addTickerStyles = StyleSheet.create({
  introduction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 8,
  },
  copy: { flex: 1, gap: 3 },
  guidance: { gap: 12 },
  guidanceCopy: { gap: 4 },
  scanStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
