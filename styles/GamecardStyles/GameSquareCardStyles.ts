import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const gameSquareCardStyles = (
  isDark: boolean,
  isChampionship?: boolean,
) =>
  StyleSheet.create({
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
      borderRightColor:
        isChampionship && isDark
          ? Colors.lightGray
          : isChampionship
            ? Colors.darkGray
            : isDark
              ? Colors.darkGray
              : Colors.lightGray,
      borderRightWidth: 0.5,
      gap: 8,
    },
    teamSection: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 4,
      paddingRight: 12,
    },
    teamWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      width: 60,
    },
    logo: { width: 20, height: 20, resizeMode: "contain" },
    footballPossesion: {
      width: 16,
      height: 16,
      resizeMode: "contain",
    },
    teamName: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    rank: {
      fontSize: 8,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    teamScore: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: Colors.midTone,
      width: 40,
    },
    teamRecord: {
      width: 40,
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    info: { alignItems: "center", justifyContent: "center", width: 60 },
    date: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    period: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    dateFinal: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 12,
    },
    time: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    clock: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    broadcast: {
      fontSize: 10,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
      position: "absolute",
      top: 4,
      left: 8,
    },
    headlineText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 8,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      position: "absolute",
      width: "100%",
      bottom: 4,
      left: 8,
    },
    headlineContainer: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 8,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      position: "absolute",
      width: "100%",
      bottom: 4,
      left: 8,
    },
    postSeasonHeadlineContainer: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 8,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      position: "absolute",
      flexDirection: "row",
      width: "100%",
      bottom: 4,
      left: 8,
      alignItems: "center",
    },
    postSeasonHeadlineText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 8,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    headlineDivider: {
      height: 8,
      width: 0.5,
      backgroundColor: isChampionship
        ? isDark
          ? Colors.white
          : Colors.black
        : isDark
          ? Colors.lightGray
          : Colors.darkGray,
      marginHorizontal: 4,
    },
    downDistance: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    notificationBell: {
      position: "absolute",
      top: 8,
      right: 4,
    },
  });
