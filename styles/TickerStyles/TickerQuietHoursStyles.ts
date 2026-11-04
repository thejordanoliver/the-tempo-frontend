import { MIN_TOUCH_TARGET } from "constants/styles";
import { StyleSheet } from "react-native";
export const tickerQuietHoursStyles = StyleSheet.create({
  editor: { gap: 12, marginTop: 8 },
  days: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  day: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.7 },
});
