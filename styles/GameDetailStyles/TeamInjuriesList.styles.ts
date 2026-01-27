import { Fonts, Colors } from "constants/Styles";
import { StyleSheet } from "react-native";
export const teamInjuryStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    container: {},
    injuryItem: {
      flexDirection: "row",
      padding: 12,
      height: 80,
      alignItems: "center",
      borderBottomColor: lighter
        ? Colors.midTone
        : isDark
        ? Colors.midTone
        : Colors.midTone,
    },
    avatar: {
      width: 50,
      height: 50,
    },
    avatarWrapper: {
      width: 50,
      height: 50,
      borderRadius: 100,
      paddingTop: 8,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: lighter
        ? Colors.dark.white
        : isDark
        ? Colors.dark.white
        : Colors.light.black,
    },

    headshot: {
      width: 50,
      height: 50,
      borderRadius: 100,
      paddingTop: 4,
      marginRight: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    name: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: lighter
        ? Colors.dark.text
        : isDark
        ? Colors.dark.text
        : Colors.light.text,
    },
    playerHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    status: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.midTone
        : Colors.midTone,
    },
    jersey: {
      fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.lightGray
        : Colors.darkGray,
      marginLeft: 4,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "flex-end", // Align text on the same baseline
    },
    infoSection: { flex: 1, marginLeft: 10, justifyContent: "center" },
    details: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: lighter
        ? Colors.dark.lightRed
        : isDark
        ? Colors.dark.lightRed
        : Colors.light.red,
    },

    row: { flexDirection: "row", alignItems: "center" },

    placeholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
      backgroundColor: Colors.lightGray,
    },
    playerInfo: { flexDirection: "row", alignItems: "flex-end" },
    tabLogo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
    position: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.lightGray
        : Colors.darkGray,
    },
    detail: {
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    returnDate: {
      marginTop: 2,
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.midTone,
    },
    separator: { height: 10 },
    loadingText: { marginTop: 8, fontSize: 14, color: Colors.darkGray },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      color: lighter
        ? Colors.dark.white
        : isDark
        ? Colors.dark.white
        : Colors.light.black,
      textAlign: "center",
      marginVertical: 8,
    },
    bottom: { flexDirection: "row", alignItems: "center" },
    divder: {
      width: 1,
      height: 16,
      backgroundColor: lighter
        ? Colors.midTone
        : isDark
        ? Colors.midTone
        : Colors.lightGray,
      marginHorizontal: 4,
    },
    tabLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    logo: {
      width: 28,
      height: 28,
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      paddingTop: 12,
    },
  });
