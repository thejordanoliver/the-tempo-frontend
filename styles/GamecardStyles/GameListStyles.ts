import { StyleSheet } from "react-native";

export const gameListStyles = StyleSheet.create({
  /* ---------- Containers ---------- */

  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },

  gridListContainer: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },

  emptyWrapper: {
    paddingHorizontal: 12,
    paddingTop: 24,
  },

  /* ---------- Skeletons ---------- */

  skeletonWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 12,
  },

  skeletonGridWrapper: {
    gap: 12,
  },

  /* ---------- Grid ---------- */

  gridRow: {
    flexDirection: "row",
    gap: 12, // single source of spacing truth
    marginBottom: 12,
  },

  gridItem: {
    flex: 1,
  },
});
