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
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      height: 94,
      padding: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cardWrapper: {
      flex: 1,
      justifyContent: "center",
      gap: 4,
      paddingRight: 12,
      borderRightWidth: 0.5,
      borderRightColor: borderColor,
    },
    teamSection: {
      flexDirection: "row",
      alignContent: "center",
      justifyContent: "center",
      gap: 8,
    },
    teamWrapper: {
      flex: 1,
      flexDirection: "row",
      gap: 8,
      width: 100,
    },
    logo: {
      width: 24,
      height: 24,
      resizeMode: "contain",
    },
    expoLogo: {
      width: 24,
      height: 24,
    },
    footballIcon: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
    teamName: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: textColor,
      textAlign: "left",
    },
    rank: {
      fontSize: 10,
      color: subTextColor,
    },
    teamScore: {
      width: 40,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: textColor,
      textAlign: "right",
    },
    teamRecord: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: textColor,
      textAlign: "right",
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 100,
      minHeight: 30,
    },
    finalText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },
    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
      textAlign: "center",
    },
    dateFinal: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: subTextColor,
    },
    time: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
      textAlign: "center",
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
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },
    outs: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },
    broadcast: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
      textAlign: "center",
    },
    headlineText: {
      position: "absolute",
      top: 4,
      left: 12,
      fontFamily: Fonts.REGULAR,
      fontSize: 8,
      color: headlineColor,
    },
    downDistance: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isChampionship
        ? isDark
          ? Colors.white
          : Colors.black
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
    },
    statusDivider: {
      width: 1,
      height: 14,
      backgroundColor: textColor,
    },
    finalStatusDivider: {
      width: 1,
      height: 14,
      backgroundColor: accentRed,
    },
    notificationBell: {
      position: "absolute",
      top: 8,
      right: 4,
    },
    possession: {
      width: 25,
      height: 25,
      resizeMode: "contain",
    },

    winnerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    fighter: {
      width: 30,
      height: 30,
      resizeMode: "contain",
    },

    fighterContainer: {
      alignItems: "center",
      width: 25,
      height: 25,
      borderWidth: 1,
      borderColor: subTextColor,
      borderRadius: 100,
      overflow: "hidden",
    },

    fighterFlag: {
      width: 20,
      height: 20,
    },
  });
};
