import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const leadersListStyles = (isDark: boolean) =>
  StyleSheet.create({
    categoryContainer: {
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: 12,
    },
    playersList: { gap: 12 },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    skeletonList: {
      paddingTop: 6,
      paddingBottom: 100,
    },
    infoText: {
      marginTop: 20,
      fontFamily: Fonts.LIGHT,
      fontSize: 16,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
  });
