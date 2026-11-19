import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const GradientGameCardStyles = (
  isDark: boolean,
  isChampionship?: boolean,
) => {
  const textColor = isDark ? Colors.dark.text : Colors.light.text;

  const subTextColor = isDark ? Colors.lightGray : Colors.darkGray;

  const accentRed = isDark ? Colors.dark.lightRed : Colors.light.red;

  const borderColor = isDark ? Colors.lightGray : Colors.darkGray;

  const liveColor = isDark ? Colors.dark.limeGreen : Colors.light.green;

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
      overflow: "hidden",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 8,
      minHeight: 80,
      borderRadius: 8,
      borderColor: Colors.midTone,
      borderWidth: 1,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    info: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      minWidth: 0,
      marginTop: 4,
      zIndex: 2,
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    // ==================================================
    // TEAMS
    // ==================================================

    teamSection: {
      flex: 1,
      minWidth: 0,
      position: "relative",
      justifyContent: "center",
      flexDirection: "row",
      alignItems: "center",
    },

    possesionContainer: {
      alignItems: "center",
      width: 70,
    },

    logo: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },

    awayLogo: {
      position: "absolute",
      zIndex: 0,
      bottom: -70,
      right: -40,
      width: 180,
      height: 180,
      resizeMode: "contain",
      opacity: 0.4,
      transform: [{ rotate: "10deg" }],
    },

    homeLogo: {
      position: "absolute",
      zIndex: 0,
      bottom: -70,
      left: -40,
      width: 180,
      height: 180,
      resizeMode: "contain",
      opacity: 0.4,
      transform: [{ rotate: "-10deg" }],
    },

    teamName: {
      fontFamily: Fonts.BOLD,
      fontSize: 40,
      color: textColor,
      textAlign: "center",
      flexShrink: 1,
      zIndex: 1,
    },

    rank: {
      textAlign: "center",
      fontSize: 18,
      fontFamily: Fonts.BOLD,
      color: textColor,
      mixBlendMode: "overlay",
    },

    awayRankContainer: {
      position: "absolute",
      bottom: -20,
      left: -20,
      zIndex: 3,
      justifyContent: "center",
      borderRadius: 999,
      borderColor: textColor,
      borderWidth: 1,
      height: 50,
      width: 50,
      transform: [{ rotate: "15deg" }],
    },

    homeRankContainer: {
      position: "absolute",
      bottom: -20,
      right: -20,
      zIndex: 3,
      justifyContent: "center",
      borderRadius: 999,
      borderColor: textColor,
      borderWidth: 1,
      height: 50,
      width: 50,
      transform: [{ rotate: "-15deg" }],
    },

    teamScore: {
      flex: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 28,
      textAlign: "center",
      zIndex: 1,
    },

    teamRecord: {
      flex: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: textColor,
      textAlign: "center",
      zIndex: 1,
    },

    // Football possession stays below the score, not between columns.
    footballScoreColumn: {
      flex: 1,
      minWidth: 0,
      height: 58,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },

    footballScoreColumnActive: {
      paddingBottom: 14,
    },

    footballScoreText: {
      flex: 0,
      width: "100%",
      fontFamily: Fonts.BOLD,
      fontSize: 28,
      textAlign: "center",
      zIndex: 1,
    },

    footballRecordText: {
      flex: 0,
      width: "100%",
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: textColor,
      textAlign: "center",
      zIndex: 1,
    },

    footballBelowScore: {
      position: "absolute",
      bottom: 0,
      alignSelf: "center",
      width: 17,
      height: 17,
      resizeMode: "contain",
      zIndex: 3,
    },

    // ==================================================
    // FIGHTERS
    // ==================================================

    fighterContainer: {
      alignItems: "center",
      width: 40,
      height: 40,
      borderWidth: 1,
      borderColor,
      borderRadius: 100,
      overflow: "hidden",
    },

    fighter: {
      width: 48,
      height: 48,
      resizeMode: "contain",
    },

    leftFighterFlag: {
      position: "absolute",
      bottom: 14,
      left: 10,
      zIndex: 99,
      width: 20,
      height: 20,
    },

    rightFighterFlag: {
      position: "absolute",
      right: 10,
      bottom: 14,
      zIndex: 99,
      width: 20,
      height: 20,
    },

    // ==================================================
    // GAME STATE / STATUS
    // ==================================================

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

    // ==================================================
    // HEADLINES
    // ==================================================

    headlineContainer: {
      position: "absolute",
      top: 4,
      right: 0,
      left: 0,
      zIndex: 10,
      alignItems: "center",
      justifyContent: "center",
    },

    headlineText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 8,
      color: headlineColor,
      textAlign: "center",
    },

    // ==================================================
    // POSSESSION / EXTRAS
    // ==================================================

    possession: {
      width: 22,
      height: 22,
      zIndex: 999,
      resizeMode: "contain",
    },

    flagStack: {
      flexDirection: "row",
      alignItems: "center",
    },

    flagContainer: {
      justifyContent: "center",
      alignItems: "center",
      width: 40,
      height: 40,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.white : Colors.black,
      overflow: "hidden",
    },

    flag: {
      width: 68,
      height: 68,
    },

    overlappingFlag: {
      marginLeft: -20,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    tiebreak: {
      color: textColor,
      fontFamily: Fonts.REGULAR,
      fontSize: 8,
    },

    serveIndicator: {
      position: "absolute",
      bottom: -10,
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: liveColor,
    },
  });
};
