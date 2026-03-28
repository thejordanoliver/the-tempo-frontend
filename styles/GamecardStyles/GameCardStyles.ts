import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const GameCardStyles = (isDark: boolean, isChampionship?: boolean) => {
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const subTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const accentRed = isDark ? Colors.dark.lightRed : Colors.light.red;
  const borderColor = isDark ? Colors.lightGray : Colors.darkGray;

  const headlineColor = isChampionship
    ? isDark
      ? Colors.white
      : Colors.black
    : subTextColor;

  return StyleSheet.create({
    /* =========================
       🧱 LAYOUT
    ========================= */
    card: {
      flexDirection: "row",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
      justifyContent: "space-between",
    },

    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 100,
    
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    winnerContainer: {
      alignItems: "center",
      justifyContent: "center",
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
      marginTop: 4,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: textColor,
      textAlign: "center",
        width: 100,
    },

    rank: {
      fontSize: 10,
      color: subTextColor,
    },

    teamScore: {
      fontSize: 28,
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
      width: 72,
    },

    teamRecord: {
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      color: textColor,
      textAlign: "center",
      width: 72,
    },

    /* =========================
       🥊 FIGHTERS
    ========================= */
    fighterContainer: {
      width: 40,
      height: 40,
      borderWidth: 1,
      alignItems: "center",

      borderRadius: 100,
      borderColor,
      overflow: "hidden",
    },

    fighter: {
      width: 48,
      height: 48,
      resizeMode: "contain",
    },

    leftFighterFlag: {
      position: "absolute",
      width: 20,
      height: 20,
      left: 4,
      bottom: 14,
      zIndex: 99,
    },

    rightFighterFlag: {
      position: "absolute",
      width: 20,
      height: 20,
      right: 4,
      bottom: 14,
      zIndex: 99,
    },

    /* =========================
       🏈 GAME STATE / STATUS
    ========================= */
    date: {
      fontFamily: Fonts.OSREGULAR,
      color: textColor,
      fontSize: 14,
    },

    period: {
      fontFamily: Fonts.OSREGULAR,
      color: textColor,
      fontSize: 14,
    },

    finalText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: accentRed,
      textAlign: "center",
    },

    clock: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: accentRed,
      textAlign: "center",
    },

    outs: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: accentRed,
      textAlign: "center",
    },

    downDistance: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 10,
      color: subTextColor,
      textAlign: "center",
    },

    broadcast: {
      fontFamily: Fonts.OSREGULAR,
      color: subTextColor,
      fontSize: 10,
      textAlign: "center",
    },

    statusDivider: {
      height: 14,
      width: 1,
      backgroundColor: textColor,
    },

    finalStatusDivider: {
      height: 14,
      width: 1,
      backgroundColor: accentRed,
    },

    /* =========================
       📰 HEADLINES
    ========================= */
    headlineContainer: {
      position: "absolute",
      top: 4,
      left: 0,
      right: 0,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },

    headlineText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 8,
      color: headlineColor,
      textAlign: "center",
    },

    headlineDivider: {
      height: 8,
      width: 1,
      backgroundColor: headlineColor,
    },

    /* =========================
       ⚾ POSSESSION / EXTRAS
    ========================= */
    awayPossession: {
      width: 24,
      height: 24,
      resizeMode: "contain",
      position: "absolute",
      bottom: -20,
    },

    homePossession: {
      width: 24,
      height: 24,
      resizeMode: "contain",
      position: "absolute",
      bottom: -20,
    },
  });
};
