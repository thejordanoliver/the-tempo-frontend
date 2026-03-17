// GameCard.styles.ts
import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const GameCardStyles = (isDark: boolean, isChampionship?: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "space-evenly",
    },
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
    rank: {
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    teamSection: {
      alignItems: "center",
      width: 60,
    },
    logo: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },

    fighter: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },

    fighterContainer: {
      width: 40,
      height: 40,
      borderWidth: 1,
      alignItems: "center",
      borderRadius: 100,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
      overflow: "hidden",
    },

    rightFighterFlag: {
      position: "absolute",
      width: 20,
      height: 20,
      right: 4,
      bottom: 14,
      zIndex: 99,
    },
    leftFighterFlag: {
      position: "absolute",
      width: 20,
      height: 20,
      left: 4,
      bottom: 14,
      zIndex: 99,
    },
    teamName: {
      marginTop: 4,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
      width: 100,
    },
    teamScore: {
      fontSize: 28,
      fontFamily: Fonts.OSBOLD,
      width: 60,
      textAlign: "center",
    },
    teamRecord: {
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
      width: 80,
    },
    winnerContainer: {
      alignItems: "center",
      justifyContent: "center",
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
    date: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 14,
    },
    period: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 14,
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    broadcast: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 10,
      textAlign: "center",
    },

    statusDivider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? Colors.dark.text : Colors.light.text,
    },
    finalStatusDivider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    downDistance: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    headlineText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 8,
      color: isChampionship
        ? isDark
          ? Colors.white
          : Colors.black
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
      textAlign: "center",
      position: "absolute",
      top: 4,
      width: "100%",
    },
    postSeasonHeadlineText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 8,
      color: isChampionship
        ? isDark
          ? Colors.white
          : Colors.black
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
      textAlign: "center",
    },

    headlineDivider: {
      height: 8,
      width: 1,
      backgroundColor: isChampionship
        ? isDark
          ? Colors.white
          : Colors.black
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
    },
    headlineContainer: {
      flexDirection: "row",
      alignItems: "center", // ← ensures vertical centering
      justifyContent: "center", // ← centers entire group horizontally
      position: "absolute",
      top: 4,
      width: "100%",
      gap: 4,
    },

    notificationBell: {
      position: "absolute",
      top: 8,
      right: 4,
    },
  });
