import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const stackedGameCardStyles = (
  isDark: boolean,
  isChampionship: boolean
) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      flex: 1,
      height: 94,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      justifyContent: "space-between",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
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
      paddingRight: 12,
      gap: 8,
      flex: 1,
    },
    teamSection: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 4,
    },
    teamWrapper: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
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
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "left",
    },
    rank: {
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    teamScore: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: isDark ? Colors.dark.text : Colors.light.text,
      width: 40,
    },
    teamRecord: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 30,
      width: 100,
    },
    finalText: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 12,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    date: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    dateFinal: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 12,
    },
    time: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    period: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    clock: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    broadcast: {
      fontSize: 10,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.lightGray : Colors.darkGray,
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
      left: 12,
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
      backgroundColor: isDark ? Colors.dark.text : Colors.light.text,
    },
    finalStatusDivider: {
      height: 14,
      width: 1,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
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

    headlineContainer: {
      flexDirection: "row",
      alignItems: "center", // ← ensures vertical centering
      justifyContent: "center", // ← centers entire group horizontally
      position: "absolute",
      top: 4,
      width: "100%",
      gap: 4,
    },
  });
