import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const style = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loadContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    monthSelector: {
      flexDirection: "row",
      paddingHorizontal: 0,
    },
    monthButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 6,
    },
    monthButtonSelected: {
      backgroundColor: "transparent",
    },
    monthText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 20,
      color: Colors.midTone,
    },
    monthTextSelected: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    errorText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    emptyText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
