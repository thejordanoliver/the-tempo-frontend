import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const playerCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: Colors.midTone,
      paddingTop: 8,
    },
    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 30,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      borderColor: Colors.midTone,
    },
    rank: {
      fontSize: 24,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSBOLD,
      marginRight: 12,
    },
    initial: {
      fontSize: 24,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSBOLD,
    },
    info: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginLeft: 12,
      height: "100%",
    },
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    name: {
      fontSize: 16,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    jerseyNumber: {
      fontSize: 16,
      marginLeft: 6,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    position: {
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSBOLD,
    },
  });
