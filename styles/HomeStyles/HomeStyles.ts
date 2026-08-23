// HomeScreen.styles.ts
import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const homeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    tabBarWrapper: {
      paddingHorizontal: 80,
    },
    contentArea: {
      flex: 1,
    },
    teamLabel: {
      marginTop: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    emptyText: {
      marginTop: 20,
      fontFamily: Fonts.LIGHT,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    errorText: {
      marginTop: 20,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
  });
