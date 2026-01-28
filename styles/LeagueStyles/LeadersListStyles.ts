import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";
export const leadersListStyles = (isDark: boolean) =>
  StyleSheet.create({
    categoryContainer: {
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: 12,
    },
    playersList: { gap: 12 },
    centered: { alignItems: "center", justifyContent: "center", flex: 1 },
    skeletonList: {
      paddingTop: 6,
      paddingBottom: 100,
    },
    infoText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
