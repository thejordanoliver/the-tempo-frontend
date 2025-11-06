import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const seasonStatCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 8,
      padding: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    title: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      marginBottom: 12,
      textAlign: "center",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.netural.midTone : Colors.netural.midTone,
      marginTop: 2,
    },
    error: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
      marginVertical: 20,
    },
  });