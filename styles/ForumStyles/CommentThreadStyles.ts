import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const commentThreadStyles = (isDark: boolean) =>
  StyleSheet.create({
    blurviewContainer: {
      flexDirection: "row",
      padding: 16,
      paddingBottom: 30,
    },
    textInputContainer: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
    },
    sendButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
    },
  });
