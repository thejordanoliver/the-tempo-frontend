import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const fixedWidthTabBarStyles = (isDark: boolean) =>
  StyleSheet.create({
    tabContainer: {
      position: "relative",
      width: "100%",
    },
    tabs: {
      flexDirection: "row",
    },
    tabPressable: {
      alignItems: "center",
      paddingBottom: 10,
    },
    tab: {
      opacity: 0.5,
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.midTone : Colors.midTone,
    },
    tabSelected: {
      opacity: 1,
      color: isDark ? Colors.white : Colors.black,
    },
    underline: {
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 2,
      borderRadius: 50,
    },
  });
