import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const leagueGamesListStyles = (isDark: boolean) =>
  StyleSheet.create({
    skeletonWrapper: {
      gap: 12,
      marginHorizontal: 12,
      paddingBottom: 12,
    },
    skeletonGridWrapper: {
      gap: 12,
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    gridRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    gridItem: { flex: 1, minWidth: 0 },
    listItem: { marginHorizontal: 12 },
    gridListContainer: { paddingHorizontal: 12, paddingBottom: 100 },
    gridSection: { paddingBottom: 4 },
    sectionSpacing: { marginTop: 8 },
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
