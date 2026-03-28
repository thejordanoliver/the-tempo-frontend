import { Colors, Fonts } from "constants/Styles";
import { StyleSheet } from "react-native";

export const gamePreviewModalStyle = (isChampionship?: boolean) =>
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
      backgroundColor: isChampionship ? Colors.lightGray : Colors.midTone,
      width: 36,
      height: 4,
      borderRadius: 2,
    },
    backgroundStyle: { backgroundColor: "transparent" },
    container: {
      flex: 1,
      overflow: "hidden",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    blurViewContainer: {
      flex: 1,
      padding: 12,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 40,
    },
    contentContainerStyle: {
      paddingBottom: 100,
    },
    headlineText: {
      fontSize: 12,
      fontFamily: Fonts.OSLIGHT,
      color: Colors.dark.white,
      textAlign: "center",
    },
    gameHeaderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
      justifyContent: "center",
      alignItems: "center",
    },
    headlineContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    headlineDivider: {
      height: 14,
      width: 1,
      marginHorizontal: 4,
      backgroundColor: Colors.white,
    },
  });
