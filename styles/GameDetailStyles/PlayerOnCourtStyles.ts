import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const playerOnCourtStyles = (isDark: boolean) =>
  StyleSheet.create({
    loading: {
      textAlign: "center",
      padding: 20,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    tabLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    tabLogo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
    wrapper: {
      borderRadius: 10,
      overflow: "hidden",
      paddingTop: 12,
      borderColor: Colors.midTone,
      borderWidth: 1,
      width: "100%",
    },
    container: { padding: 12 },
    avatar: { width: 44, height: 44 },
    avatarWrapper: {
      width: 44,
      height: 44,
      borderRadius: 100,
      paddingTop: 8,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    teamLabel: {
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      marginVertical: 10,
      marginRight: 5,
      color: isDark ? Colors.white : Colors.black,
    },
    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,

      borderBottomColor: Colors.midTone,
      justifyContent: "space-between",
    },
    playerInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 12,
    },
    playerInfoWrapper: { flexDirection: "row", alignItems: "center" },
    nameWrapper: { flexDirection: "row", alignItems: "baseline" },
    playerName: {
      marginLeft: 8,
      fontFamily: Fonts.OSBOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    jersey: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    posistion: {
      marginLeft: 4,
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      color: isDark ? Colors.midTone : Colors.black,
    },
    teamLogo: { width: 28, height: 28, resizeMode: "contain" },
    teamHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },
  });
