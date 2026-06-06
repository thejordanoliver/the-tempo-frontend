import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const gameHeaderStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderBottomWidth: 1,
      backgroundColor: isDark ? Colors.black : Colors.white,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
         flex: 1,
         justifyContent: "center"
    },
    teamsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
       flex: 1,
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
      marginHorizontal: 4,
      width: 1,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    seriesContainer: {
      position: "absolute",
      width: "100%",
      top: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    seriesText: {
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
    },
  });
