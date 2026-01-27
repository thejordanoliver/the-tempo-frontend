import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const seasonStatCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 12,
    },
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
      color: isDark ? Colors.midTone : Colors.midTone,
      marginTop: 2,
    },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
