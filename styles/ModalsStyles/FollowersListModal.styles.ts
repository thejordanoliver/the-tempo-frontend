import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";

export const followersListModalStyles = (isDark: boolean) =>
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
      backgroundColor: isDark
        ? Colors.netural.lightGray
        : Colors.netural.darkGray,
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
      backgroundColor: isDark
        ? Colors.netural.darkGray
        : Colors.netural.lightGray,
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
    blurContainer: {
      flex: 1,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: "hidden",
    },
    modalContainer: {
      paddingTop: 68,
      paddingHorizontal: 12,
      paddingBottom: 40,
    },
    searchInput: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      fontFamily: Fonts.OSLIGHT,
      marginBottom: 12,
      borderColor: isDark ? Colors.netural.midTone : Colors.netural.midTone,
      color: isDark ? Colors.netural.white : Colors.netural.black,
    },
    userItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 100,
      marginRight: 12,
    },
    username: {
      flex: 1,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },
    closeButton: {
      position: "absolute",
      top: 15,
      right: 20,
    },
    error: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
      marginVertical: 8,
    },
  });
