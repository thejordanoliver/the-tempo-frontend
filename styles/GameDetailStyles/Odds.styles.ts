import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const gameOddsStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      padding: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    headerText: {
      fontSize: 12,
      textAlign: "center",
    },
    headerTeamText: {
      paddingLeft: 4,
      fontSize: 12,
      textAlign: "left",
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    teamInfo: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingLeft: 4,
    },
    teamLogo: {
      width: 28,
      height: 28,
    },
    teamName: {
      fontSize: 14,
    },
    oddsText: {
      flex: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      textAlign: "center",
    },
    divider: {
      marginVertical: 8,
      borderBottomWidth: 1,
    },
    bookmaker: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 12,
    },
    bookmakerWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    subtext: {
      fontFamily: Fonts.LIGHT,
      fontSize: 12,
      color: Colors.midTone,
    },
    errorText: {
      marginTop: 20,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
  });
