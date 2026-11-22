import { StyleSheet } from "react-native";

export const tickerSettingsViewStyles = StyleSheet.create({
  columns: { gap: 16 },
  wide: { flexDirection: "row", alignItems: "flex-start" },
  column: { gap: 16 },
  wideColumn: { flex: 1, minWidth: 0 },
  picker: {
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deviceDetails: { gap: 12, padding: 10, borderRadius: 8 },
});
