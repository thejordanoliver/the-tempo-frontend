import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";

export const tickerSettingsViewStyles = StyleSheet.create({
  headerPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderBottomWidth: 2,
    backgroundColor: Colors.dark.transparentItemBackground,
  },
  headerPreviewTitle: { flex: 1 },
  headerPreviewLeague: { color: Colors.lightGray },
  deviceDetails: { gap: 12, paddingVertical: 8 },
});
