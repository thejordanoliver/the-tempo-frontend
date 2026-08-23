import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const officialsStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      borderWidth: 1,
      borderColor: Colors.midTone,
      borderRadius: 8,
    },
    row: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },
    nameContainer: {
      flex: 1,
      marginLeft: 8,
    },
    refereeContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      paddingTop: 12,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.dark.white : Colors.light.black,
      borderRadius: 100,
      overflow: "hidden",
    },
    referee: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },
    name: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    position: {
      marginBottom: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: Colors.midTone,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
      color: Colors.black,
    },
    errorText: {
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
