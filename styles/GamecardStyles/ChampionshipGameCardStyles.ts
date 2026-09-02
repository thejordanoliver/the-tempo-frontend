import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const champGameCardStyles = (isDark: boolean) =>
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
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: isDark ? 0.32 : 0.18,
      shadowRadius: 12,
    },

    topGlow: {
      position: "absolute",
      top: -80,
      alignSelf: "center",
      width: 220,
      height: 160,
      borderRadius: 110,
      backgroundColor: "rgba(255,255,255,0.10)",
    },

    badgeContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
      gap: 4,
    },

    badge: {
      fontSize: 10,
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
      minHeight: 36,
      fontSize: 14,
      textAlign: "center",
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    rank: {
      fontSize: 12,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    score: {
      marginTop: 4,
      fontSize: 34,
      lineHeight: 38,
      textAlign: "center",
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
      fontVariant: ["tabular-nums"],
    },

    record: {
      marginTop: 8,
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

    versus: {
      marginBottom: 8,
      fontSize: 20,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
      letterSpacing: 1.5,
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
      flexWrap: "wrap",
      gap: 6,
    },

    statusDivider: {
      width: 1,
      height: 12,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    finalStatusDivider: {
      width: 1,
      height: 12,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.22)"
        : "rgba(53,40,20,0.22)",
    },

    period: {
      fontSize: 12,
      textTransform: "uppercase",
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    clock: {
      fontSize: 12,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
      fontVariant: ["tabular-nums"],
    },

    date: {
      fontSize: 12,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    finalText: {
      fontSize: 11,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    broadcast: {
      fontSize: 10,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
  });
