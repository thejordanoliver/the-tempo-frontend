import { Colors, Fonts, globalStyles } from "constants/styles";
import { StyleSheet } from "react-native";

export const ConfirmModalStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const typography = globalStyles(isDark);

  return StyleSheet.create({
    backdrop: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: isDark ? "rgba(0,0,0,0.66)" : "rgba(0,0,0,0.48)",
    },
    modal: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      margin: 0,
    },
    keyboardAvoidingView: {
      flex: 1,
      width: "100%",
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      width: "100%",
      maxWidth: 440,
      padding: 24,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.gray,
      backgroundColor: theme.background,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: isDark ? 0.42 : 0.18,
      shadowRadius: 24,
      elevation: 22,
    },

    iconWrap: {
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 44,
      marginBottom: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 22,
    },
    dangerIconWrap: {
      borderColor: isDark ? "rgba(248,113,113,0.34)" : "rgba(239,68,68,0.2)",
      backgroundColor: isDark ? "rgba(239,68,68,0.16)" : "rgba(239,68,68,0.1)",
    },
    messageContainer: {
      gap: 8,
      marginBottom: 24,
    },
    title: typography.subheading,
    message: {
      ...typography.text,
      color: theme.secondaryText,
    },
    children: {
      width: "100%",
      marginBottom: 18,
      paddingTop: 2,
    },
    buttonRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      width: "100%",
      marginTop: 2,
    },
    stackedButtons: {
      flexDirection: "column",
      flexWrap: "nowrap",
    },
    button: {
      flexGrow: 1,
      minWidth: 120,
      maxWidth: "100%",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    cancelButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(17,24,39,0.12)",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    confirmButton: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    focusedButton: {
      outlineColor: theme.text,
      outlineOffset: 2,
      outlineStyle: "solid",
      outlineWidth: 2,
    },
    defaultConfirmButton: {
      backgroundColor: Colors.light.actionBackground,
    },
    dangerConfirmButton: {
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    confirmButtonDisabled: {
      opacity: 0.58,
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    buttonPressed: {
      opacity: 0.88,
    },
    cancelText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      lineHeight: 22,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    confirmText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      lineHeight: 22,
      flexShrink: 1,
      textAlign: "center",
    },
  });
};
