import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const editFavoritesStyles = (isDark: boolean, isGridView: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 12,
      alignItems: isGridView ? "center" : "stretch",
    },
    input: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSLIGHT,
      width: "100%",
    },
    buttonContainer: {
      width: "100%",
      marginVertical: 20,
    },
  });
