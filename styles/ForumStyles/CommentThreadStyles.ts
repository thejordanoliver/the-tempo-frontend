import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const commentThreadStyles = (isDark: boolean) =>
  StyleSheet.create({
    blurviewContainer: {
      padding: 16,
      paddingBottom: 30,
      flexDirection: "row",
    },
    textInputContainer: {
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flex: 1,
      fontFamily: Fonts.OSREGULAR,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    sendButton: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    centerContainer: { flex: 1, justifyContent: "center" },
  });
