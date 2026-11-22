import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";

export const tickerDeviceSummaryStyles = StyleSheet.create({
  container: { padding: 14, gap: 12, borderRadius: 8 },
  heading: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  settingsCard: {
    borderWidth: 1,
    borderColor: Colors.midTone,
    borderRadius: 12,
  },
  settingsIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    width: 48,
    height: 48,
  },
});
