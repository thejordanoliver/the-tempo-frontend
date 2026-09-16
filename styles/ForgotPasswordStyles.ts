import { StyleSheet } from "react-native";
import { Colors, Fonts } from "constants/styles";

export const forgotPasswordStyles = (isDark: boolean) => {
  const text = isDark ? Colors.white : Colors.black;
  const secondaryText = isDark ? Colors.lightGray : Colors.darkGray;
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return StyleSheet.create({
    content: {
      flexGrow: 1,
      justifyContent: "center",
      gap: 32,
    },
    header: {
      gap: 8,
    },
    kicker: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      color: Colors.midTone,
      textAlign: "center",
      textTransform: "uppercase",
    },
    title: {
      fontFamily: Fonts.BOLD,
      fontSize: 34,
      color: text,
      textAlign: "center",
    },
    subtitle: {
      paddingHorizontal: 24,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: secondaryText,
      textAlign: "center",
    },
    form: {
      gap: 12,
    },
    inputBorder: { borderWidth: 1, borderColor: border },
    codeInputText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 22,
      letterSpacing: 8,
      textAlign: "center",
    },
    helperText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: secondaryText,
      textAlign: "center",
    },
    errorText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
    successText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
      textAlign: "center",
    },
    button: {
      marginTop: 8,
    },
    linkButton: {
      alignSelf: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },

    linkText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: Colors.midTone,
    },
    disabledLinkText: {
      opacity: 0.6,
    },
  });
};
