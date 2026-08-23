import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const playerOnCourtStyles = (isDark: boolean) =>
  StyleSheet.create({
    loading: {
      padding: 20,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
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
      width: "100%",
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 10,
      overflow: "hidden",
    },
    container: { padding: 12 },
    avatar: {
      width: 44,
      height: 44,
    },
    avatarWrapper: {
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 44,
      paddingTop: 8,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 100,
      overflow: "hidden",
    },
    teamLabel: {
      marginVertical: 10,
      marginRight: 5,
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },
    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    playerInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 12,
    },
    playerInfoWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    nameWrapper: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    playerName: {
      marginLeft: 8,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    jersey: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    posistion: {
      marginLeft: 4,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: isDark ? Colors.midTone : Colors.black,
    },
    teamLogo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
    },
    teamHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },
  });
