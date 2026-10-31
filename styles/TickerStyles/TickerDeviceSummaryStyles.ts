import { StyleSheet } from "react-native";

export const tickerDeviceSummaryStyles = StyleSheet.create({
  container: { padding: 14, gap: 12, borderRadius: 8 },
  heading: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, gap: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
