// HomeScreen.styles.ts
import { Fonts, Colors } from "constants/Styles";
import { StyleSheet } from "react-native";

export const homeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 16,
    },

    tabBarWrapper: {
      paddingHorizontal: 80,
    },
    contentArea: {
      flex: 1,
    },
    teamLabel: {
      marginTop: 4,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
    },
    emptyText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
