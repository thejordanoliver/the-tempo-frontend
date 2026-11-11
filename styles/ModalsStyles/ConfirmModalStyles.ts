import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const ConfirmModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    modal: {
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
      paddingHorizontal: 22,
      paddingVertical: 28,
    },
    card: {
      width: "100%",
      maxWidth: 480,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 18,
      borderRadius: 28,
      backgroundColor: isDark ? Colors.black : Colors.white,
      overflow: "hidden",
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: isDark ? 0.42 : 0.18,
      shadowRadius: 24,
      elevation: 22,
    },

    iconWrap: {
      alignItems: "center",
      alignSelf: "center",
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
      gap: 9,
      marginBottom: 18,
    },
    title: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.25,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    message: {
      alignSelf: "center",
      maxWidth: 310,
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      lineHeight: 22,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
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
    button: {
      flexGrow: 1,
      flexBasis: 120,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 999,
    },
    cancelButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(17,24,39,0.12)",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    confirmButton: {
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.24 : 0.14,
      shadowRadius: 10,
      elevation: 5,
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
      transform: [{ scale: 0.985 }],
    },
    cancelText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 15,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    confirmText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 15,
      color: Colors.white,
      textAlign: "center",
    },
  });
