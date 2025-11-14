import { StyleSheet } from "react-native";
import { Fonts } from "constants/fonts";


export const combinedGameStyles = StyleSheet.create({
  skeletonWrapper: { gap: 12, marginHorizontal: 12, paddingBottom: 12 },
  skeletonGridWrapper: { paddingBottom: 12, gap: 12 },
  gridRow: { justifyContent: "space-between", marginBottom: 12 },
  skeletonGridRow: { justifyContent: "space-between" },
  gridItem: { flex: 1 },
  listItem: { marginHorizontal: 12 },
  gridListContainer: { paddingBottom: 100 },
  contentContainer: { paddingTop: 10 },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 20,
    fontFamily: Fonts.OSLIGHT,
  },
});
