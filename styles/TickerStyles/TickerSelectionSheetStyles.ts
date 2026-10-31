import { activeOpacity } from "constants/styles";
import { StyleSheet } from "react-native";

export const tickerSelectionColumnGap = 10;

export const tickerSelectionSheetStyles = StyleSheet.create({
  header: { alignItems: "center" },
  headerText: { textAlign: "left" },
  closeButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: { opacity: activeOpacity },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  searchField: { flex: 1 },
  message: { paddingBottom: 12 },
  progress: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingBottom: 12,
  },
  progressText: { flex: 1 },
  columns: { gap: tickerSelectionColumnGap },
  rowSeparator: { height: tickerSelectionColumnGap },
  emptyMessage: { paddingVertical: 24, textAlign: "center" },
});
