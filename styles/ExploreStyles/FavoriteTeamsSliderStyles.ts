import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const FavoriteTeamsSliderStyles = (isDark: boolean, compact: boolean) =>
  StyleSheet.create({
    slideButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: compact ? 10 : 18,
      width: "100%",
      paddingHorizontal: compact ? 8 : 14,
      paddingTop: compact ? 8 : 12,
      paddingBottom: compact ? 18 : 24,
    },
    leagueText: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    teamLogo: {
      width: compact ? "48%" : "52%",
      height: compact ? "48%" : "52%",
      resizeMode: "contain",
    },
    teamGlow: {
      width: compact ? "150%" : "150%",
      height: compact ? "120%" : "120%",
      top: 0,
      left: 0,
      right: 0,
      resizeMode: "contain",
      position: "absolute",
      zIndex: -1,
    },

    teamTextWrap: {
      alignItems: "center",
      gap: 4,
      maxWidth: "100%",
    },
    teamName: {
      fontFamily: Fonts.REGULAR,
      fontSize: compact ? 16 : 22,
      lineHeight: compact ? 20 : 27,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
  });
