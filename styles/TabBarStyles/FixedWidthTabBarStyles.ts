import { Colors, Fonts } from "constants/Styles";
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
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.midTone : Colors.midTone,
      opacity: 0.5,
    },
    tabSelected: {
      color: isDark ? Colors.white : Colors.black,
      opacity: 1,
    },
    underline: {
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 2,
      borderRadius: 50,
    },
  });
