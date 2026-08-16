import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const gameCardStyles = (isDark: boolean, isChampionship?: boolean) => {
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
      padding: 8,
      alignItems: "center",
      justifyContent: "space-between",
    },

    info: {
      marginTop: 4,
      alignItems: "center",
      justifyContent: "center",
      width: 100,
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
      marginTop: 4,
      fontFamily: Fonts.REGULAR,
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
      fontFamily: Fonts.BOLD,
      textAlign: "center",
      width: 72,
    },

    teamRecord: {
      fontSize: 16,
      fontFamily: Fonts.BOLD,
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
      fontFamily: Fonts.REGULAR,
      color: textColor,
      fontSize: 12,
    },

    period: {
      fontFamily: Fonts.REGULAR,
      color: textColor,
      fontSize: 12,
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
      fontSize: 12,
      fontFamily: Fonts.REGULAR,
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
      textAlign: "center",
      color: subTextColor,
    },

    statusDivider: {
      height: 12,
      width: 1,
      backgroundColor: textColor,
      marginHorizontal: 4,
    },

    finalStatusDivider: {
      height: 12,
      width: 1,
      backgroundColor: accentRed,
      marginHorizontal: 4,
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
      fontFamily: Fonts.REGULAR,
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
    possession: {
      width: 22,
      height: 22,
      resizeMode: "contain",
      position: "absolute",
      bottom: -14,
    },
  });
};

export const racingCardStyles = (isDark: boolean, isChampionship?: boolean) => {
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const subTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const accentRed = isDark ? Colors.dark.lightRed : Colors.light.red;
  const borderColor = isDark ? Colors.lightGray : Colors.darkGray;
  const goldColor = isDark ? Colors.dark.gold : Colors.light.gold;

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
      flexDirection: "column",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      padding: 8,
    },

    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },

    eventInfo: {
      flexDirection: "column",
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    metaRow: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },

    metaText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: subTextColor,
      textAlign: "center",
    },

    driverList: {
      flexDirection: "column",
    },

    driverRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 6,
      paddingHorizontal: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },

    leaderRow: {
      borderRadius: 6,
    },

    lastDriverRow: {
      borderBottomWidth: 0,
    },

    /* =========================
       🏁 EVENT / TRACK
    ========================= */
    eventName: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: textColor,
    },

    trackName: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: subTextColor,
    },

    date: {
      fontFamily: Fonts.REGULAR,
      color: textColor,
      fontSize: 12,
    },

    lapInfo: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },

    /* =========================
       🏎️ DRIVER
    ========================= */
    positionContainer: {
      width: 24,
      alignItems: "center",
      justifyContent: "center",
    },

    position: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: subTextColor,
    },

    leaderPosition: {
      color: goldColor,
    },

    driverImageContainer: {
      width: 40,
      height: 40,
      borderWidth: 1,
      alignItems: "center",
      borderRadius: 100,
      borderColor,
      overflow: "hidden",
      marginRight: 8,
    },

    leaderImageContainer: {
      borderColor: goldColor,
      borderWidth: 1.5,
    },

    driverImage: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },

    driverInfoWrapper: {
      flex: 1,
      flexDirection: "column",
    },

    driverName: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: textColor,
    },

    teamName: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: subTextColor,
    },

    carNumberBadge: {
      width: 22,
      height: 22,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderWidth: 1,
      borderColor,
      marginRight: 8,
    },

    carNumberText: {
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      color: textColor,
    },

    countryFlag: {
      width: 16,
      height: 16,
      marginLeft: 4,
      resizeMode: "contain",
    },

    /* =========================
       ⏱️ TIMING / GAP
    ========================= */
    timeGap: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: textColor,
      textAlign: "right",
      width: 64,
    },

    interval: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: subTextColor,
      textAlign: "right",
      width: 64,
    },

    statusIcon: {
      color: accentRed,
    },

    /* =========================
       🏆 STATUS
    ========================= */
    finalText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },

    liveText: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },

    scheduledText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: subTextColor,
      textAlign: "center",
    },

    dnfText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: subTextColor,
      fontStyle: "italic",
    },

    statusDivider: {
      height: 12,
      width: 1,
      backgroundColor: textColor,
      marginHorizontal: 4,
    },

    finalStatusDivider: {
      height: 12,
      width: 1,
      backgroundColor: accentRed,
      marginHorizontal: 4,
    },

    /* =========================
       📰 HEADLINES
    ========================= */
    headlineContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },

    headlineText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 8,
      color: headlineColor,
      textAlign: "center",
    },

    /* =========================
       📡 BROADCAST / EXTRAS
    ========================= */
    broadcast: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      textAlign: "center",
      color: subTextColor,
    },

    showMoreButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
    },

    showMoreText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
    },
  });
};
