import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const officialsStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
    },
    row: {
      flex: 1,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    nameContainer: {
      marginLeft: 8,
      flex: 1,
    },
    placeholder: {
      width: 50,
      height: 50,
      borderRadius: 100,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.dark.white : Colors.light.black,
    },
    initials: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.OSBOLD,
    },
    position: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: Colors.midTone,
      marginBottom: 4,
    },
    name: {
      fontSize: 16,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
      color: Colors.black,
    },
    errorText: {
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
