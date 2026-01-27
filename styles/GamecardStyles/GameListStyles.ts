import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const gameListStyles = (isDark: boolean) =>
  StyleSheet.create({
    skeletonWrapper: {
      paddingHorizontal: 12,
      gap: 12,
    },
    skeletonGridWrapper: {
      paddingBottom: 20,
      paddingHorizontal: 12,
    },
    gridListContainer: {
      paddingBottom: 100,
      gap: 12,
    },
    contentContainer: {
      paddingHorizontal: 12,
      paddingBottom: 100,
    },
    gridRow: {
      justifyContent: "space-between",
      marginBottom: 12,
      gap: 12,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 20,
      fontFamily: Fonts.OSLIGHT,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    listItem: {
      marginHorizontal: 12,
    },

    gridItem: {
      flex: 1,
    },

    itemContainer: {
      flex: 1,
      marginHorizontal: 12, // ensures equal horizontal padding
    },
    stackedItem: {
      marginHorizontal: 12,
    },
  });
