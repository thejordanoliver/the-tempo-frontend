import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      flex: 1,
      height: 110,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      justifyContent: "space-between",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      borderRightColor: isDark ? Colors.netural.darkGray : Colors.netural.lightGray,
      borderRightWidth: 0.5,
      paddingRight: 12,
      gap: 12,
      flex: 1,
    },
    teamSection: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 4,
    },
    teamWrapper: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 8,
      width: 100,
      flex: 1,
    },
    logo: { width: 32, height: 32, resizeMode: "contain" },
    footballIcon: { width: 28, height: 28, resizeMode: "contain" },
    teamName: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      flexShrink: 1,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "left",
    },
    teamScore: {
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: isDark ? Colors.dark.text : Colors.light.text,
      width: 40,
    },
    teamRecord: {
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 30,
      width: 100,
    },
    finalText: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
      width: 60,
    },
    date: {
      fontSize: 12,
      fontFamily: Fonts.OSMEDIUM,
      textAlign: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    dateFinal: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? "rgba(255,255,255, .5)" : "rgba(0, 0, 0, .5)",
      fontSize: 14,
    },
    time: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    clock: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    broadcast: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? "rgba(255,255,255, .5)" : "rgba(0, 0, 0, .5)",
    },
    downDistance: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
    },
    statusDivider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? Colors.dark.text : Colors.light.text,
    },
  });
