import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const gameHeaderStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    teamsContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    headlineContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    headlineText: {
      position: "absolute",
      top: 0,
      width: "100%",
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    divider: {
      width: 1,
      height: 10,
      marginHorizontal: 4,
      backgroundColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    seriesContainer: {
      position: "absolute",
      top: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    seriesText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
  });

export const DriverHeaderStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      padding: 12,
    },
  });
