import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const gameWidgetStyles = (
  isDark: boolean,
  height: number,
  width: number
) => {
  const base = Math.min(height, width);

  return StyleSheet.create({
    container: {
      width: "100%",
      height,
      justifyContent: "center",
      paddingHorizontal: base * 0.08,
      paddingVertical: base * 0.06,
    },

    wrapper: {
      flexDirection: "row",
      alignItems: "center",
    },

    /* -------- TEAM SECTIONS -------- */

    awaySection: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    homeSection: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    teamWrapper: {
      alignItems: "center",
      justifyContent: "center",
    },

    teamLogo: {
      width: base * 0.38,
      height: base * 0.38,
      resizeMode: "contain",
    },

    awayPossession: {
      position: "absolute",
      bottom: -24,
      width: base * 0.24,
      height: base * 0.24,
      marginLeft: base * 0.2,
      resizeMode: "contain",
      
    },

    homePossession: {
      position: "absolute",
      bottom: -24,
      width: base * 0.24,
      height: base * 0.24,
      marginRight: base * 0.2,
      resizeMode: "contain",
    },
    scorePossession: {
      alignItems: "center",
      justifyContent: "center",
    },

    teamName: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: base * 0.11,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginTop: 2,
    },

    awayScore: {
      fontFamily: Fonts.OSBOLD,
      fontSize: base * 0.24,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: base * 0.2,
      minWidth: base * 0.2,
      textAlign: "center",
    },

    homeScore: {
      fontFamily: Fonts.OSBOLD,
      fontSize: base * 0.24,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginRight: base * 0.2,
      minWidth: base * 0.2,
      textAlign: "center",
    },

    awayRecord: {
      fontFamily: Fonts.OSBOLD,
      fontSize: base * 0.16,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: base * 0.1,
      minWidth: base * 0.2,
      textAlign: "center",
    },

    homeRecord: {
      fontFamily: Fonts.OSBOLD,
      fontSize: base * 0.16,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginRight: base * 0.1,
      minWidth: base * 0.2,
      textAlign: "center",
    },

    /* -------- CENTER INFO -------- */

    headlineContainer: {
      width: "100%",
     
    },
    headline: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: base * 0.08,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    gameInfo: {
      flex: 1, // 👈 shrinks before teams
      alignItems: "center",
      justifyContent: "center",
    },

    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    dateTime: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      fontSize: base * 0.11,
      textAlign: "center",
    },
 
    period: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      fontSize: base * 0.14,
      textAlign: "center",
    },
    finalText: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: base * 0.14,
      textAlign: "center",
    },
    clock: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: base * 0.14,
      textAlign: "center",
    },
    downAndDistance: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: base * 0.08,
      textAlign: "center",
    },

    divider: {
      marginHorizontal: base * 0.04,
      height: base * 0.14,
      width: 1,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    finalDivder: {
      marginHorizontal: base * 0.04,
      height: base * 0.14,
      width: 1,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    broadcast: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: base * 0.08,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
  });
};
