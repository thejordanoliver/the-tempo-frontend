import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const getStyles = 
  StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
    },
    date: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.dark.white,
    },
    time: {
      fontFamily: Fonts.OSREGULAR,
      color: Colors.dark.white,
      fontSize: 16,
    },
    period: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 20,
      color: Colors.dark.white,
    },
    clock: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 20,
      color: Colors.dark.white,
      textAlign: "center",
    },
    downAndDistance: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 10,
      color: Colors.dark.white,
      marginTop: 2,
      textAlign: "center",
    },
    finalText: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 20,
      color: Colors.dark.lightRed,
      textAlign: "center",
    },

    gameTitle: {
      position: "absolute",
      top: -40,
      width: 200,
      textAlign: "center",
      fontSize: 20,
      fontFamily: Fonts.OSEXTRALIGHT,
      color: Colors.dark.white,
    },
    headlineText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 10,
      color: Colors.midTone,
      textAlign: "center",
      width: 140,
      position: "absolute",
      top: -50,
    },
    logoWrapper: {
      width: 100,
      height: 60,
      position: "relative",
    },
    logo: {
      width: 100,
      height: 60,
      resizeMode: "contain",
      position: "absolute",
      top: 0,
      left: 0,
    },

    gameInfoRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 6,
    },
    gameNumberLabel: {
      fontSize: 12,
      fontFamily: Fonts.OSLIGHT,
      color: Colors.midTone,
    },

    headline: {
      fontSize: 12,
      fontFamily: Fonts.OSLIGHT,
      color: Colors.dark.white,
      position: "absolute",
      top: -48,
    },

    canceled: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      color: Colors.dark.lightRed,
      marginTop: 6,
    },

    livePeriod: {
      fontSize: 18,
      fontFamily: Fonts.OSMEDIUM,
      marginTop: 4,
    },

    formattedDate: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.dark.white,
    },

    broadcast: {
      fontSize: 10,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.dark.white,
      textAlign: "center",
    },
    infoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    statusDivider: {
      height: 16,
      width: 1,
      alignSelf: "center",
      backgroundColor: Colors.dark.white,
    },
    finalStatusDivider: {
      height: 20,
      width: 1,
      backgroundColor: Colors.dark.lightRed,
    },
  });
