import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";

export const tickerRotationStyles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 12,
  },
  itemHeader: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1 },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  draggingItem: {
    elevation: 5,
    shadowColor: Colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  pressed: { opacity: 0.7 },
  muted: { opacity: 0.4 },
});
