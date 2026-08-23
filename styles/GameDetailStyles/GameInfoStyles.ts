import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const gameInfoStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    time: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    broadcasts: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    downAndDistance: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    dateFinal: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    finalText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    statusDivider: {
      width: 1,
      height: 16,
      backgroundColor: isDark ? Colors.dark.white : Colors.light.black,
    },
    finalStatusDivider: {
      width: 1,
      height: 16,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    headlineText: {
      fontFamily: Fonts.EXTRALIGHT,
      fontSize: 13,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    outsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    basesContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 2,
    },
  });

export const getStyles = gameInfoStyles;
