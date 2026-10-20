import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const ChampionshipGameCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 12,
      marginBottom: 14,
    },

    card: {
      position: "relative",
      borderRadius: 8,
      paddingHorizontal: 18,
      paddingTop: 12,
      overflow: "hidden",
    },

    badgeContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
      gap: 4,
    },

    badge: {
      fontSize: 14,
      letterSpacing: 2,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
      textTransform: "uppercase",
    },

    matchupRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    teamColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    logo: {
      width: 54,
      height: 54,
    },

    teamName: {
      maxWidth: 120,
      fontSize: 14,
      textAlign: "center",
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    rank: {
      fontSize: 20,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    score: {
      fontSize: 34,
      textAlign: "center",
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    record: {
      fontSize: 18,
      textAlign: "center",
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    centerColumn: {
      width: 94,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },

    info: {
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    statusDivider: {
      width: 1,
      height: 14,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    finalStatusDivider: {
      width: 1,
      height: 12,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    period: {
      fontSize: 14,
      textTransform: "uppercase",
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    clock: {
      fontSize: 14,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    date: {
      fontSize: 14,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    statusText: {
      fontSize: 14,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },

    broadcast: {
      fontSize: 10,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
  });
