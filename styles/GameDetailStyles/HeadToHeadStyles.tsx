import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const headToHeadStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },

    wrapper: {
      paddingTop: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },

    seriesText: {
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    gameCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    lastGameCard: {
      borderBottomWidth: 0,
    },

    info: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    teamInfo: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    teamRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    teamLogo: {
      width: 40,
      height: 40,
    },

    teamName: {
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    teamScore: {
      flex: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    teamRecord: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    loserScore: {
      opacity: 0.5,
    },
    gameDate: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    date: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    period: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    finalText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    broadcast: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    statusDivider: {
      width: 1,
      height: 14,
      backgroundColor: isDark ? Colors.dark.text : Colors.light.text,
    },
    finalStatusDivider: {
      width: 1,
      height: 14,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    circle: {
      position: "absolute",
      zIndex: 0,
      width: 160,
      height: 160,
      borderRadius: 999,
      opacity: 0.25,
    },
  });
