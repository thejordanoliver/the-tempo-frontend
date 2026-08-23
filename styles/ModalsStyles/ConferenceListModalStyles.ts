import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const conferenceListModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    backgroundStyle: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: "transparent",
      overflow: "hidden",
    },
    handleStyle: {
      position: "absolute",
      top: 0,
      right: 8,
      left: 8,
      alignItems: "center",
      justifyContent: "center",
      height: 40,
      backgroundColor: "transparent",
    },
    handleIndicatorStyle: {
      zIndex: 9999,
      width: 36,
      height: 4,
      marginBottom: 4,
      borderRadius: 2,
      backgroundColor: Colors.midTone,
    },
    blurContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 60,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      position: "absolute",
      top: 0,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingVertical: 12,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    headerText: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    container: {
      flex: 1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    contentContainerStyle: {
      padding: 16,
      paddingTop: 60,
      paddingBottom: 80,
    },
    leagueButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.midTone,
      backgroundColor: "transparent",
    },
    leagueText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 18,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    leftContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    logo: {
      width: 28,
      height: 28,
      marginRight: 12,
    },
    logoPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      marginRight: 12,
    },
  });
