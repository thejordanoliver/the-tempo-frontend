// TeamDetailScreen.styles.ts
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";
import { Colors } from "constants/Colors";

export const style = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
  });
