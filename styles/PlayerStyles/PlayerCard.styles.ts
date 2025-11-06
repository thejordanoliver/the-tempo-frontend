import { Fonts } from "constants/fonts";
import { Colors } from "constants/Colors";
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
      paddingTop: 4,
    },
    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 30,
      backgroundColor: isDark ? "#444" : "#888",
      justifyContent: "center",
      alignItems: "center",
    },
    initial: {
      fontSize: 24,
      color: "#fff",
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
    },
    jerseyNumber: {
      fontSize: 16,
      marginLeft: 6,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? "#fff" : "#1d1d1d",
    },
    position: {
      fontSize: 16,
      color: isDark ? "#fff" : "#1d1d1d",
      fontFamily: Fonts.OSBOLD,
    },
  });