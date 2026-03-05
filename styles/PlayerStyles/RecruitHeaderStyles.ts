import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const recruitHeaderStyles = (isDark: boolean) =>
  StyleSheet.create({
    playerHeader: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarContainer: {
      marginRight: 20,
      paddingRight: 20,
      borderRightWidth: 1,
      alignItems: "center",
      borderRightColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    avatar: {
      width: 140,
      height: 140,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    avatarPlaceholder: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: Colors.midTone,
      justifyContent: "center",
      alignItems: "center",
    },
    initial: {
      fontSize: 48,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSBOLD,
    },
    jerseyNumber: {
      flexDirection: "row",
      justifyContent: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    jersey: {
      fontSize: 36,
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    infoContainer: {
      justifyContent: "center",
    },
    name: {
      fontSize: 24,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    playerInfo: {
      fontFamily: Fonts.OSLIGHT,
      color: isDark ? Colors.white : Colors.black,
    },
    playerInfoLabel: {
      fontFamily: Fonts.OSMEDIUM,
    },
  });
