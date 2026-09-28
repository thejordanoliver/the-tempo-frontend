import { activeOpacity, Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";
export const leadersListStyles = (isDark: boolean) =>
  StyleSheet.create({
    contentContainerStyle: {
      paddingBottom: 100,
    },
    categoryContainer: {
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: 12,
    },
    playersList: { gap: 12 },
    showMoreButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      marginTop: 12,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.dark.icon : Colors.light.icon,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    showMoreButtonPressed: {
      opacity: activeOpacity,
    },
    showMoreText: {
      color: isDark ? Colors.dark.blue : Colors.light.blue,
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      textAlign: "center",
    },
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
