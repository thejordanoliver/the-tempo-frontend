import { activeOpacity, Colors, Fonts } from "constants/styles";
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
      paddingBottom: 100,
      paddingHorizontal: 12,
      overflow: "hidden",
    },
    searcBarContainer: {
      paddingHorizontal: 12,
    },

    leagueButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 14,
    },
    buttonContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: "transparent",
    },
    buttonWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonPressed: {
      opacity: activeOpacity,
    },

    leagueLogo: {
      width: 36,
      height: 36,
      marginRight: 8,
    },
    leagueText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
  });
