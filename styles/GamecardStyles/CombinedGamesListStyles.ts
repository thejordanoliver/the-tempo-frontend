import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const combinedGameListStyles = (isDark: boolean) =>
  StyleSheet.create({
    skeletonWrapper: { gap: 12, marginHorizontal: 12, paddingBottom: 12 },
    skeletonGridWrapper: { paddingBottom: 12, gap: 12 },
    gridRow: { justifyContent: "space-between", marginBottom: 12 },
    skeletonGridRow: { justifyContent: "space-between" },
    gridItem: { flex: 1 },
    listItem: { marginHorizontal: 12 },
    gridListContainer: { paddingBottom: 100 },
    contentContainer: { paddingBottom: 100 },
    emptyText: {
      textAlign: "center",
      color: isDark ? Colors.lightGray : Colors.darkGray,
      marginTop: 20,
      fontSize: 20,
      fontFamily: Fonts.OSLIGHT,
    },
    itemSeparatorComponent: {
      height: 12,
    },
  });
