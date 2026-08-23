import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const playerCardStyles = (isDark: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    avatarContainer: {
      width: 50,
      height: 50,
      paddingTop: 4,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 30,
      overflow: "hidden",
    },
    avatar: {
      width: 50,
      height: 50,
    },
    rank: {
      marginRight: 12,
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    info: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: "100%",
      marginLeft: 12,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
    },
    name: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    jerseyNumber: {
      marginLeft: 6,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    position: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
  });
