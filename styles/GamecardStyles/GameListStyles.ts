import { StyleSheet } from "react-native";

export const gameListStyles = StyleSheet.create({
  /* ---------- Containers ---------- */

  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },

  gridListContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },

  /* ---------- Skeletons ---------- */

  skeletonWrapper: {
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  skeletonGridWrapper: {
    paddingHorizontal: 12,
  },

  headerSkeleton: {
    marginHorizontal: 12,
  },

  /* ---------- Grid ---------- */

  gridRow: {
    flexDirection: "row",
    gap: 12, // single source of spacing truth
    marginBottom: 12,
  },

  gridItem: {
    flex: 1,
    minWidth: 0,
  },
});
