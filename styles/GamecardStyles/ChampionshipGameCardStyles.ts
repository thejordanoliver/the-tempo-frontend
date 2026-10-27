import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const ChampionshipGameCardStyles = (isDark: boolean) => {
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const subTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const accentRed = isDark ? Colors.dark.lightRed : Colors.light.red;
  const headlineColor = isDark ? Colors.white : Colors.black;

  return StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      marginBottom: 14,
    },

    card: {
      position: "relative",
      overflow: "hidden",
      padding: 12,
      paddingBottom: 40,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },

    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 100,
      marginTop: 4,
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    headlineContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },

    headlineText: {
      fontSize: 14,
      letterSpacing: 1,
      fontFamily: Fonts.MEDIUM,
      color: headlineColor,
      textTransform: "uppercase",
    },

    matchupRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

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
      color: textColor,
      textAlign: "center",
    },

    rank: {
      fontSize: 10,
      fontFamily: Fonts.REGULAR,
      color: subTextColor,
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
      color: textColor,
      textAlign: "center",
    },

    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
    },

    period: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
    },

    finalText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },

    clock: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },

    outsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    outs: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },

    basesContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },

    downDistance: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
      textAlign: "center",
    },

    broadcast: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
      textAlign: "center",
    },

    statusDivider: {
      width: 1,
      height: 12,
      marginHorizontal: 4,
      backgroundColor: textColor,
    },

    finalStatusDivider: {
      width: 1,
      height: 12,
      marginHorizontal: 4,
      backgroundColor: accentRed,
    },
  });
};
