import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const teamPreviewModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },

    blurViewContainer: {
      flex: 1,
      justifyContent: "flex-end",
    },

    linearGradient: {
      marginTop: "auto",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 1.5,
    },

    blurViewWrapper: {
      borderTopLeftRadius: 18.5,
      borderTopRightRadius: 18.5,
      paddingHorizontal: 20,
      paddingVertical: 40,
      backgroundColor: "rgba(255,255,255,0.05)",
      alignItems: "center",
    },

    teamLogo: {
      width: 60,
      height: 60,
      marginBottom: 10,
    },

    teamName: {
      fontSize: 20,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    establishedText: {
      marginBottom: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    subText: {
      marginVertical: 12,
      fontFamily: Fonts.OSEXTRALIGHT,
      color: isDark ? Colors.white : Colors.black,
    },

    goButton: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      padding: 16,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 12,
      width: "100%",
    },

    goText: {
      color: isDark ? Colors.black : Colors.white,
      fontFamily: Fonts.OSSEMIBOLD,
    },

    removeButton: {
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      width: "100%",
    },

    removeText: {
      color: Colors.white,
      fontFamily: Fonts.OSSEMIBOLD,
    },
  });
