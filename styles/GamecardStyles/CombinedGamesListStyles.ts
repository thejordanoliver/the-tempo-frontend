import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const combinedGameListStyles = (isDark: boolean) =>
  StyleSheet.create({
    skeletonWrapper: {
      gap: 12,
      marginHorizontal: 12,
      paddingBottom: 12,
    },
    skeletonGridWrapper: {
      gap: 12,
      paddingBottom: 12,
    },
    gridRow: {
      justifyContent: "space-between",
      marginBottom: 12,
    },
    skeletonGridRow: { justifyContent: "space-between" },
    gridItem: { flex: 1 },
    listItem: { marginHorizontal: 12 },
    gridListContainer: { paddingBottom: 100 },
    contentContainer: { paddingBottom: 100 },
    headerSkeleton: { paddingHorizontal: 12 },
    emptyText: {
      marginTop: 20,
      fontFamily: Fonts.LIGHT,
      fontSize: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    itemSeparatorComponent: {
      height: 12,
    },
  });
