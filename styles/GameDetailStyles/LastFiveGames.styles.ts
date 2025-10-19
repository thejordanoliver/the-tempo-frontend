import { StyleSheet } from "react-native";
import { Fonts } from "constants/fonts";


export const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderColor: "#aaa",
    marginBottom: 6,
  },
  cell: {
    fontSize: 14,
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.OSREGULAR,
  },
  date: { flex: 1.2 },
  team: { flex: 2 },
  teamWithLogo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 12,
    fontFamily: Fonts.OSREGULAR,
  },
});
