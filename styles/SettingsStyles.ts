import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const settingsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      position: "relative",
      flex: 1,
    },

    wrapper: {
      paddingHorizontal: 12,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingTop: 20,
      paddingBottom: 40,
    },
    heading: {
      marginBottom: 12,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.midTone : Colors.midTone,
      fontFamily: Fonts.MEDIUM,
      fontSize: 24,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
    seperator: {
      height: 20,
    },
    optionButtonContainer: {
      flex: 1,
      paddingVertical: 4,
      marginBottom: 12,
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? Colors.transparentLightGray
        : Colors.transparentDarkGray,
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    optionText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
    },

    dangerText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 18,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
