import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const teamPreviewModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    sheetBackground: {
      backgroundColor: "transparent",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },

    handleIndicator: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      width: 36,
      height: 4,
      borderRadius: 2,
      opacity: 0.6,
    },

    handleContainer: {
      position: "absolute",
      top: 10,
      right: 0,
      left: 0,
      zIndex: 1,
      alignItems: "center",
    },

    linearGradient: {
      flex: 1,
      padding: 1.5,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },

    blurViewWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 40,
      borderTopLeftRadius: 18.5,
      borderTopRightRadius: 18.5,
      backgroundColor: "rgba(255,255,255,0.05)",
    },

    teamLogo: {
      width: 60,
      height: 60,
      marginBottom: 10,
    },

    teamName: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    establishedText: {
      marginBottom: 12,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    subText: {
      marginVertical: 12,
      fontFamily: Fonts.EXTRALIGHT,
      color: isDark ? Colors.white : Colors.black,
    },

    goButton: {
      alignItems: "center",
      width: "100%",
      marginBottom: 12,
      padding: 16,
      borderRadius: 10,
    },

    goText: {
      fontFamily: Fonts.SEMIBOLD,
      color: isDark ? Colors.black : Colors.white,
    },

    removeButton: {
      alignItems: "center",
      width: "100%",
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    removeText: {
      fontFamily: Fonts.SEMIBOLD,
      color: Colors.white,
    },
  });
