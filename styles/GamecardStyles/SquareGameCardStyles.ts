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
      height: 120,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      justifyContent: "space-between",
      borderRadius: 8,
      paddingVertical: 28,
      paddingHorizontal: 12,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      borderRightColor: borderColor,
      borderRightWidth: 0.5,
      gap: 8,
      width: 120,
    },
    teamSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 4,
      paddingRight: 8,
      width: "100%",
    },
    teamWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    logo: { width: 20, height: 20, resizeMode: "contain" },
    footballPossesion: {
      width: 16,
      height: 16,
      resizeMode: "contain",
    },
    teamName: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: textColor,
    },
    rank: {
      fontSize: 8,
      color: borderColor,
    },

    teamScore: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: Colors.midTone,
    },
    teamRecord: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "right",
      color: textColor,
    },
    info: { alignItems: "center", justifyContent: "center", width: 60 },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    date: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: textColor,
      textAlign: "center",
    },

    period: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: textColor,
      textAlign: "center",
    },
    dateFinal: {
      fontFamily: Fonts.OSREGULAR,
      color: textColor,
      fontSize: 12,
    },
    time: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: textColor,
    },
    clock: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
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
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: accentRed,
      textAlign: "center",
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: accentRed,
      textAlign: "center",
    },
    broadcast: {
      paddingHorizontal: 4,
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
      width: "100%",
      top: 4,
      left: 8,
    },

    downDistance: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 10,
      color: borderColor,
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
      width: 25,
      height: 25,
      borderWidth: 1,
      alignItems: "center",
      borderRadius: 100,
      borderColor: borderColor,
      overflow: "hidden",
    },

    fighterFlag: {
      width: 20,
      height: 20,
    },
  });
};
