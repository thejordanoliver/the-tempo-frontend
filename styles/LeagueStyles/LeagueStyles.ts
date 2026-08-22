import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const LeagueScreenStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentArea: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 80,
      paddingHorizontal: 12,
      overflow: "hidden",
    },
    searcBarContainer: {
      marginHorizontal: 12,
      paddingTop: 12,
    },

    leagueButton: {
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    buttonContainer: {
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    buttonWrapper: { flexDirection: "row", alignItems: "center" },
    leagueLogo: {
      width: 36,
      height: 36,
      marginRight: 8,
    },
    leagueText: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.REGULAR,
    },
  });

