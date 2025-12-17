import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const gameListStyles = StyleSheet.create({
   skeletonWrapper: {
    paddingHorizontal: 12,
    gap: 12,
  },
  skeletonGridWrapper: {
    paddingBottom: 20,
    gap: 12,
  },
  gridListContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 12,
  },
  contentContainer: {
  
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 20,
    fontFamily: Fonts.OSLIGHT,
  },
  listItem: {
    marginHorizontal: 12,
  },
  gridItem: {
    flex: 1,
    marginBottom: 12,
    marginHorizontal: 12, // ensures equal horizontal padding
  },
  stackedItem: {
    marginHorizontal: 12,
  },
  headerWrapper: {
    marginHorizontal: 12,
    marginBottom: 4,
  },
});
