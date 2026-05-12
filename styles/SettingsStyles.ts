import { StyleSheet } from "react-native";
import { Fonts, Colors } from "constants/styles";

export const settingsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
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
      fontSize: 24,
      fontFamily: Fonts.OSMEDIUM,
      paddingBottom: 4,
      marginBottom: 12,
      borderBottomWidth: 1,
      color: isDark ? Colors.dark.white : Colors.light.black,
      borderBottomColor: isDark ? Colors.midTone : Colors.midTone,
    },
    seperator: {
      height: 20,
    },
    optionButtonContainer: {
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? Colors.transparentLightGray
        : Colors.transparentDarkGray,
    },
    optionButton: {
      flexDirection: "row",
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
    },
    optionText: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.OSREGULAR,
    },

    dangerText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: 18,
      fontFamily: Fonts.OSMEDIUM,
    },
    closeButton: {
      position: "absolute",
      top: 24,
      right: 15,
    },
    input: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      color: isDark ? Colors.white : Colors.black,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      padding: 20,
      borderRadius: 8,
      fontSize: 16,
      marginVertical: 12,
      fontFamily: Fonts.OSLIGHT,
      width: "100%",
    },
  });