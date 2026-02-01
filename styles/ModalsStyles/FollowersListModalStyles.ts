import { Colors, Fonts } from "constants/Styles";
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
      backgroundColor: Colors.midTone,
      width: 36,
      height: 4,
      borderRadius: 2,
    },
    // Updated: add top border radius here
    backgroundStyle: {
      backgroundColor: "transparent",
      overflow: "hidden",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    container: {
      flex: 1,
    },
    blurViewContainer: {
      flex: 1,
      borderTopLeftRadius: 20, // already there
      borderTopRightRadius: 20, // already there
      overflow: "hidden",
      paddingTop: 70,
    },
    contentContainerStyle: {
      paddingHorizontal: 12,
      paddingBottom: 100,
    },
    header: {
      position: "absolute",
      width: "100%",
      top: 0,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderTopLeftRadius: 20, // optional: match the modal
      borderTopRightRadius: 20, // optional
      overflow: "hidden",
      paddingVertical: 12,
    },
    headerText: {
      textAlign: "center",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontSize: 18,
    },
    bottomSheetScrollViewContainer: {
      flex: 1,
    },
    bottomSheetScrollViewWrapper: {
      gap: 24,
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
