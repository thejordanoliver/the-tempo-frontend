import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const stackedGameCardStyles = (
  isDark: boolean,
  isChampionship?: boolean,
) => {
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const subTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const accentRed = isDark ? Colors.dark.lightRed : Colors.light.red;
  const borderColor =
    isChampionship && isDark
      ? Colors.lightGray
      : isChampionship
        ? Colors.darkGray
        : isDark
          ? Colors.darkGray
          : Colors.lightGray;

  const headlineColor = isChampionship
    ? isDark
      ? Colors.white
      : Colors.black
    : subTextColor;

  return StyleSheet.create({
    card: {
      flexDirection: "row",
      flex: 1,
      height: 94,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      justifyContent: "space-between",
      borderRadius: 8,
      padding: 12,
    },
    cardWrapper: {
      justifyContent: "center",
      borderRightColor: borderColor,
      borderRightWidth: 0.5,
      paddingRight: 12,
      gap: 4,
      flex: 1,
    },
    teamSection: {
      flexDirection: "row",
      justifyContent: "center",
      alignContent: "center",
      gap: 8,
    },
    teamWrapper: {
      flexDirection: "row",
      gap: 8,
      width: 100,
      flex: 1,
    },
    logo: { width: 24, height: 24, resizeMode: "contain" },
    footballIcon: { width: 28, height: 28, resizeMode: "contain" },
    teamName: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      flexShrink: 1,
      color: textColor,
      textAlign: "left",
    },
    rank: {
      fontSize: 10,
      color: subTextColor,
    },
    teamScore: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: textColor,
      width: 40,
    },
    teamRecord: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: textColor,
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 30,
      width: 100,
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },
    date: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: textColor,
    },
    dateFinal: {
      fontFamily: Fonts.OSREGULAR,
      color: subTextColor,
      fontSize: 12,
    },
    time: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: textColor,
    },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    basesContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 2,
    },
    outsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    period: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: textColor,
    },
    clock: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: accentRed,
    },
    outs: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: accentRed,
      textAlign: "center",
    },
    broadcast: {
      fontSize: 10,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: subTextColor,
    },
    headlineText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 8,
      color: headlineColor,
      position: "absolute",
      left: 12,
      top: 4,
    },
    downDistance: {
      fontSize: 10,
      fontFamily: Fonts.OSREGULAR,
      color: isChampionship
        ? isDark
          ? Colors.white
          : Colors.black
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
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
    notificationBell: {
      position: "absolute",
      top: 8,
      right: 4,
    },
    footballPossesion: {
      width: 25,
      height: 25,
      resizeMode: "contain",
    },

    mlbHeadlineText: {
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

    winnerContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    fighter: {
      width: 30,
      height: 30,
      resizeMode: "contain",
    },

    fighterContainer: {
      width: 25,
      height: 25,
      borderWidth: 1,
      alignItems: "center",
      borderRadius: 100,
      borderColor: subTextColor,
      overflow: "hidden",
    },

    fighterFlag: {
      width: 20,
      height: 20,
    },
  });
};
