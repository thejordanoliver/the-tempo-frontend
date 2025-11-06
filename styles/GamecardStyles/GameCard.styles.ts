// GameCard.styles.ts
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "space-evenly",
    },
    teamSection: {
      alignItems: "center",
      width: 60,
      //  backgroundColor: "red"
    },
    logo: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },
    teamName: {
      marginTop: 4,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    teamScore: {
      fontSize: 28,
      fontFamily: Fonts.OSBOLD,
      width: 48,
      textAlign: "center",
      // backgroundColor: "red"
    },
    teamRecord: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
      width: 48,
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 120,
    },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    date: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 14,
    },
    time: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.netural.lightGray : Colors.netural.darkGray,
      fontSize: 12,
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    broadcast: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.netural.lightGray : Colors.netural.darkGray,
      fontSize: 10,
      textAlign: "center",
    },
    seriesStatus: {
      color: isDark ? Colors.netural.lightGray : Colors.netural.darkGray,
      fontFamily: Fonts.OSEXTRALIGHT,
      fontSize: 10,
      textAlign: "center",
      maxWidth: 180,
    },
    seriesDivider: {
      height: 10,
      width: 0.5,
      backgroundColor: isDark ? Colors.netural.lightGray : Colors.netural.darkGray,
    },
    statusDivider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? Colors.dark.text : Colors.light.text,
    },
    finalStatusDivider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    downDistance: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 10,
      color: isDark ? Colors.netural.lightGray : Colors.netural.darkGray,
      textAlign: "center",
    },
    headlineText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 10,
      color: isDark ? Colors.netural.lightGray : Colors.netural.darkGray,
      textAlign: "center",
      position: "absolute",
      top: 4,
      width: "100%",
    },
    notificationBell: {
      position: "absolute",
      top: 8,
      right: 4,
    },
  });
