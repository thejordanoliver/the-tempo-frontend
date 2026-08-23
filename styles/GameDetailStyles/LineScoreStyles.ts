import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const lineScoreStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    wrapper: {
      padding: 12,
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
      overflow: "hidden",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
    },
    teamCode: {
      width: 48,
      paddingLeft: 8,
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
    },
    scoresWrapper: {
      flex: 1,
      flexDirection: "row",
    },
    header: {
      width: "100%",
      fontFamily: Fonts.MEDIUM,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      textTransform: "uppercase",
    },
    score: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      textAlign: "center",
    },
    totalScore: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      textAlign: "center",
    },
  });
