import { StyleSheet } from "react-native";
import { Fonts } from "constants/fonts";


export const getStyles = (dark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      flex: 1,
      height: 110,
      backgroundColor: dark ? "#2e2e2e" : "#eee",
      justifyContent: "space-between",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      borderRightColor: dark ? "#444" : "#888",
      borderRightWidth: 0.5,
      paddingRight: 12,
      gap: 4,
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
    logo: { width: 32, height: 32, resizeMode: "contain" },
    footballIcon: { width: 28, height: 28, resizeMode: "contain" },
    teamName: {
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      flexShrink: 1,
      color: dark ? "#fff" : "#1d1d1d",
      textAlign: "left",
    },
    teamScore: {
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: dark ? "#fff" : "#1d1d1d",
      width: 40,
    },
    teamRecord: {
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: dark ? "#fff" : "#1d1d1d",
    },
    info: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 30,
      width: 100,
    },
    finalText: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      color: dark ? "#ff4444" : "#cc0000",
      fontWeight: "bold",
      textAlign: "center",
      width: 60,
    },
    date: {
      fontSize: 12,
      fontFamily: Fonts.OSMEDIUM,
      textAlign: "center",
      color: dark ? "#fff" : "#1d1d1d",
    },
    dateFinal: {
      fontFamily: Fonts.OSREGULAR,
      color: dark ? "rgba(255,255,255, .5)" : "rgba(0, 0, 0, .5)",
      fontSize: 14,
    },
    time: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: dark ? "#ff4444" : "#cc0000",
    },
    clock: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
      color: dark ? "#ff4444" : "#cc0000",
    },
    broadcast: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: dark ? "rgba(255,255,255, .5)" : "rgba(0, 0, 0, .5)",
    },
       downDistance: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
    },
  });
