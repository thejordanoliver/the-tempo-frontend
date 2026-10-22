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

    /* =========================
       🏀 TEAM
    ========================= */
    teamSection: {
      alignItems: "center",
      width: 70,
    },

    logo: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },

    teamName: {
      width: 70,
      marginTop: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    rank: {
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    teamScore: {
      width: 72,
      fontFamily: Fonts.BOLD,
      fontSize: 28,
      textAlign: "center",
    },

    teamRecord: {
      width: 72,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
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
