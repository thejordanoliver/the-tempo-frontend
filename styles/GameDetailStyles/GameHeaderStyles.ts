import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";
export const gameHeaderStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      backgroundColor: isDark ? Colors.black : Colors.white,
      paddingVertical: 4,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    teamsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    headlineContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    headlineText: {
      position: "absolute",
      width: "100%",
      top: 0,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
    },
    divider: {
      height: 10,
      width: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,

    },
  });
