import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const lineScoreStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      padding: 12,
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
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
      paddingLeft: 8,
    },
    scoresWrapper: {
      flex: 1,
      flexDirection: "row",
    },
    header: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      textTransform: "uppercase",
      width: "100%",
    },
    score: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      textAlign: "center",
    },
    totalScore: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
      textAlign: "center",
    },
  });
