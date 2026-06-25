import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const headToHeadStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },

    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 12,
      overflow: "hidden",
    },

    seriesText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },

    gameCard: {
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    lastGameCard: {
      borderBottomWidth: 0,
    },

    info: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    teamInfo: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },

    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    teamLogo: {
      width: 40,
      height: 40,
    },

    teamName: {
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },

    teamScore: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 24,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
      flex: 1,
    },
    teamRecord: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    loserScore: {
      opacity: 0.5,
    },
    gameDate: {
      textAlign: "center",
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 16,
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
    circle: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 999,
      opacity: 0.25,
      zIndex: 0,
    },
  });
