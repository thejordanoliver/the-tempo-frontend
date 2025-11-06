import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    date: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 16,
    },
    time: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 12,
    },
    broadcasts: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.netural.midTone : Colors.netural.midTone,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    downAndDistance: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.netural.midTone,
      textAlign: "center",
    },
    dateFinal: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 14,
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    playoffContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    playoffText: {
      fontSize: 13,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSEXTRALIGHT,
      textAlign: "center",
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    statusDivider: {
      height: 16,
      width: 1,
      backgroundColor: isDark ? Colors.dark.white : Colors.light.black,
    },
    finalStatusDivider: {
      height: 16,
      width: 1,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
       headlineContainer: {
      paddingHorizontal: 12,
      paddingTop: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    headlineText: {
      fontSize: 13,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSEXTRALIGHT,
      textAlign: "center",
    },
  });
