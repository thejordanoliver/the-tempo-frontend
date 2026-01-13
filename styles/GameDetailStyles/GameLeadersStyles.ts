import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const gameLeadersStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    container: { overflow: "hidden" },
    center: { alignItems: "center", justifyContent: "center", padding: 16 },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 12,
    },
    error: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: lighter
        ? Colors.dark.lightRed
        : isDark
        ? Colors.dark.lightRed
        : Colors.light.red,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.midTone
        : Colors.midTone,
    },
    avatar: {
      width: 52,
      height: 52,
    },
    avatarWrapper: {
      width: 60,
      height: 60,
      borderRadius: 100,
      paddingTop: 10,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: lighter
        ? Colors.white
        : isDark
        ? Colors.white
        : Colors.black,
    },
    jersey: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      marginLeft: 4,
      color: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.lightGray
        : Colors.darkGray,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "flex-end", // Align text on the same baseline
    },
    infoSection: { flex: 1, marginLeft: 10, justifyContent: "flex-end" },
    playerName: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    statRow: {
      flexDirection: "row",
      marginTop: 4,
      justifyContent: "space-between",
      paddingRight: 12,
    },
    statBlock: { alignItems: "flex-start", flex: 1 },
    statLabel: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 10,
      color: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.midTone
        : Colors.midTone,
    },
    statText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
    teamLogo: { position: "absolute", top: 8, right: 8, width: 28, height: 28 },
  });
