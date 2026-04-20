import { StyleSheet } from "react-native";
export const editFavoritesStyles = (isDark: boolean, isGridView: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 12,
    },

    buttonContainer: {
      width: "100%",
      marginVertical: 12,
    },
  });
