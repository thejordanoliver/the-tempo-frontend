import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const getStyles = (dark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      height: 120,
      backgroundColor: dark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      justifyContent: "space-between",
      borderRadius: 8,
      paddingVertical: 16,
          paddingHorizontal: 12,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      borderRightColor: dark ? Colors.darkGray : Colors.lightGray,
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
      gap: 8,
      width: 72,
      
    },
    logo: { width: 24, height: 24, resizeMode: "contain" },
    footballIcon: {
      width: 28,
      height: 28,
      resizeMode: "contain",
      position: "absolute",
      right: -10,
      top: 0,
    },
    teamName: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      color: dark ? Colors.dark.text : Colors.light.text,
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
      color: dark ? Colors.dark.text : Colors.light.text,
    },
    info: { alignItems: "center", justifyContent: "center", width: 60,  },
    date: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: dark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    dateFinal: {
      fontFamily: Fonts.OSREGULAR,
      color: dark ? Colors.dark.text : Colors.light.text,
      fontSize: 12,
    },
    time: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: dark ? Colors.dark.text : Colors.light.text,
    },
    clock: {
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: dark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    finalText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      color: dark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    broadcast: {
      fontSize: 10,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: dark ? Colors.dark.text : Colors.light.text,
    },
    headlineText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 10,
      color: dark ? Colors.lightGray : Colors.darkGray,
      position: "absolute",
      top: 4,
      left: 12,
      width: "100%",
    },
  });
