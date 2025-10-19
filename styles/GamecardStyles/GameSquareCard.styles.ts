import { StyleSheet } from "react-native";
import { Fonts } from "constants/fonts";


export const getStyles = (dark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      height: 120,
      backgroundColor: dark ? "#2e2e2e" : "#eee",
      justifyContent: "space-between",
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 16,
    },
    cardWrapper: {
      flexDirection: "column",
      justifyContent: "center",
      borderRightColor: dark ? "#444" : "#888",
      borderRightWidth: 0.5,
      paddingRight: 12,
      gap: 8,
    },
    teamSection: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 4,
    },
    teamWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      width: 80,
    },
    logo: { width: 28, height: 28, resizeMode: "contain" },
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
      color: dark ? "#fff" : "#1d1d1d",
    },
    teamScore: {
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: dark ? "#aaa" : "#888",
      width: 40,
    },
    teamRecord: {
      width: 40,
      fontSize: 14,
      fontFamily: Fonts.OSBOLD,
      textAlign: "right",
      color: dark ? "#aaa" : "#888",
    },
    info: { alignItems: "center", justifyContent: "center", width: 60 },
    date: {
      fontSize: 12,
      fontFamily: Fonts.OSMEDIUM,
      color: dark ? "#fff" : "#1d1d1d",
      textAlign: "center",
    },
    dateFinal: {
     fontFamily: Fonts.OSREGULAR,
      color: dark ? "rgba(255,255,255, .5)" : "rgba(0, 0, 0, .5)",
      fontSize: 12,
    },
    time: {
      fontSize: 10,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
    },
    clock: {
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: dark ? "#ff4444" : "#cc0000",
      textAlign: "center",
    },
    finalText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      color: dark ? "#ff4444" : "#cc0000",
      textAlign: "center",
    },
    broadcast: {
      fontSize: 10,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      color: dark ? "#fff" : "#1d1d1d",
    },
  });
