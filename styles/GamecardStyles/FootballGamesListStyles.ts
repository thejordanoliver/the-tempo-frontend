import { StyleSheet } from "react-native";
import { Colors, Fonts } from "constants/Styles";

export const footballGamesListStyle = StyleSheet.create({
  skeletonWrapper: {
    paddingHorizontal: 12,
    gap: 12,
  },
  skeletonGridWrapper: {
    paddingBottom: 20,
    gap: 12,
  },
  gridListContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  contentContainer: {},
  gridItem: {
    flex: 1,
    marginHorizontal: 12,
  },
  emptyText: {
    fontFamily: Fonts.OSLIGHT,
    fontSize: 16,
    textAlign: "center",
    color: Colors.midTone,
  },
  headerWrapper: {
    marginHorizontal: 12,
    marginTop: 12,
  },
});