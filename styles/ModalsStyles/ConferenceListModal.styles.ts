import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const conferenceListModalStyles = (isDark: boolean) =>
  StyleSheet.create({
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
      backgroundColor: isDark ? Colors.netural.lightGray : Colors.netural.darkGray,
      width: 36,
      height: 4,
      borderRadius: 2,
      marginTop: 12,
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
      backgroundColor: isDark ? Colors.netural.darkGray : Colors.netural.midTone,
    },
    headerText: {
      textAlign: "center",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      fontFamily: Fonts.OSBOLD,
      paddingVertical: 6,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 18,
    },
    leagueButton: {
      paddingVertical: 12,
      backgroundColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.netural.darkGray : Colors.netural.midTone,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leagueText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 18,
      fontFamily: Fonts.OSREGULAR,
    },
  });
