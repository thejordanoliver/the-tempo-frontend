import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const sportsListModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    backgroundStyle: { backgroundColor: "transparent", overflow: "hidden" },
    handleStyle: {
      backgroundColor: "transparent",
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      left: 8,
      right: 8,
      top: 0,
    },
    handleIndicatorStyle: {
      backgroundColor: Colors.midTone,
      width: 36,
      height: 4,
      borderRadius: 2,
      zIndex: 9999,
      marginBottom: 4,
    },
    blurContainer: {
      flex: 1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
      paddingHorizontal: 12,
      paddingTop: 60,
    },
    scrollContent: {
      paddingTop: 12,
      paddingBottom: 40,
      overflow: "hidden"
    },
    searcBarContainer: {
      paddingTop: 12,
    },
    header: {
      position: "absolute",
      width: "100%",
      top: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingVertical: 12,
    },
    headerText: {
      textAlign: "center",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
    },
    leagueButton: {
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    buttonContainer: {
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    buttonWrapper: { flexDirection: "row", alignItems: "center" },
    leagueLogo: {
      width: 40,
      height: 40,
      marginRight: 8,
    },
    leagueText: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.OSREGULAR,
    },
  });
