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
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? Colors.transparentLightGray
        : Colors.transparentDarkGray,
    },
    optionButton: {
      flex: 1,
      paddingVertical: 12,
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
    closeButton: {
      position: "absolute",
      top: 24,
      right: 15,
    },
    input: {
      width: "100%",
      marginVertical: 12,
      padding: 20,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      fontFamily: Fonts.LIGHT,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
  });
