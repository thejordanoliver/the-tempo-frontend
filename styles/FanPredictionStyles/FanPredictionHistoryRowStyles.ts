import { Colors, Fonts, globalStyles } from "constants/styles";
import { StyleSheet } from "react-native";

export const FanPredictionHistoryRowStyles = (isDark: boolean) => {
  const global = globalStyles(isDark);

  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const subTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const accentRed = isDark ? Colors.dark.lightRed : Colors.light.red;
  const borderColor = isDark ? Colors.lightGray : Colors.darkGray;
  const liveColor = isDark ? Colors.dark.limeGreen : Colors.light.green;

  return StyleSheet.create({
    container: {
      flexDirection: "column",
      alignItems: "stretch",
      padding: 8,
      minHeight: 80,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    /* =========================
       🧱 LAYOUT
    ========================= */
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 80,
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

    /* =========================
       🥊 FIGHTERS
    ========================= */
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

    /* =========================
       🏈 GAME STATE / STATUS
    ========================= */
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

    /* =========================
       📰 HEADLINES
    ========================= */
    headlineContainer: {
      position: "absolute",
      top: 4,
      right: 0,
      left: 0,
      zIndex: 10,
      alignItems: "center",
      justifyContent: "center",
    },

    /* =========================
       ⚾ POSSESSION / EXTRAS
    ========================= */
    possession: {
      position: "absolute",
      bottom: -14,
      width: 22,
      height: 22,
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

    meta: { ...global.caption, textAlign: "center" },

    divider: {
      height: 12,
      width: 1,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    picked: {
      ...global.caption,
      color: isDark ? Colors.dark.green : Colors.light.green,
      fontSize: 10,
      borderRadius: 4,
      lineHeight: 14,
    },
    pickSpacer: { height: 14 },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingTop: 8,
    },
    pickSummary: { ...global.caption, flex: 1 },
    outcomeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    outcome: { ...global.caption, fontSize: 11, fontFamily: Fonts.MEDIUM },
  });
};
