import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const gamePreviewModalStyle = ({
  isDark,
  isChampionship,
  awayColor,
  homeColor,
}: {
  isDark: boolean;
  isChampionship?: boolean;
  awayColor?: string;
  homeColor?: string;
}) =>
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
      backgroundColor: isChampionship ? Colors.lightGray : Colors.midTone,
    },
    backgroundStyle: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
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
      top: 0,
      left: 0,
      right: 0,
      padding: 12,
      paddingTop: 40,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    contentContainerStyle: {
      paddingBottom: 100,
    },
    headlineText: {
      fontFamily: Fonts.LIGHT,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    gameHeaderContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    bottomSheetScrollViewContainer: {
      flex: 1,
    },
    bottomSheetScrollViewWrapper: {
      gap: 24,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    headlineContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    leftCircle: {
      position: "absolute",
      top: -70,
      left: -70,
      width: 140,
      height: 140,
      borderRadius: 999,
      backgroundColor: awayColor,
    },
    rightCircle: {
      position: "absolute",
      top: -70,
      right: -70,
      width: 140,
      height: 140,
      borderRadius: 999,
      backgroundColor: homeColor,
    },
  });
