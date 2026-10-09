import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";

export const TeamInfoModalStyles = (isDark: boolean, insets: any) =>
  StyleSheet.create({
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
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.midTone,
    },
    backgroundStyle: {
      overflow: "hidden",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    container: {
      flex: 1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    blurViewContainer: {
      flex: 1,
      padding: 12,
      paddingTop: 40,
    },
    contentContainerStyle: {
      paddingBottom: 40,
    },
  });
