import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const newsHighlightsListStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      gap: 12,
      paddingHorizontal: 12,
      paddingBottom: 100
    },
    emptyText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
