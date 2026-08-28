import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const squareGameCardStyles = (
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
      justifyContent: "space-between",
      height: 120,
      paddingVertical: 28,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      gap: 8,
      width: 120,
      borderRightWidth: 0.5,
      borderRightColor: borderColor,
    },
    teamSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
      width: "100%",
      paddingRight: 8,
    },
    teamWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    logo: {
      width: 20,
      height: 20,
      resizeMode: "contain",
    },

    possession: {
      width: 16,
      height: 16,
      resizeMode: "contain",
    },

    teamName: {
      width: 40,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: textColor,
    },
    rank: {
      fontSize: 8,
      color: subTextColor,
    },

    teamScore: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: Colors.midTone,
      textAlign: "right",
    },
    teamRecord: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
      textAlign: "right",
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      width: 60,
    },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    divider: {
      width: 0.5,
      height: 12,
      marginHorizontal: 4,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
      textAlign: "center",
    },

    period: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
      textAlign: "center",
    },
    dateFinal: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: textColor,
    },
    time: {
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
    basesContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 2,
    },
    outs: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },
    finalText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },
    broadcast: {
      paddingHorizontal: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
      textAlign: "center",
    },
    headlineText: {
      position: "absolute",
      top: 4,
      left: 8,
      width: "100%",
      fontFamily: Fonts.REGULAR,
      fontSize: 8,
      color: headlineColor,
    },
    downDistance: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 10,
      color: subTextColor,
      textAlign: "center",
    },
    notificationBell: {
      position: "absolute",
      top: 8,
      right: 4,
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
      alignItems: "center",
      width: 25,
      height: 25,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 100,
      overflow: "hidden",
    },

    fighterFlag: {
      position: "absolute",
      top: "50%",
      left: "50%",
      zIndex: -1,
      width: 50,
      height: 100,
      transform: "translate(-50%, -50%)",
    },
  });
};
