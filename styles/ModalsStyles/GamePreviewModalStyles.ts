import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const gamePreviewModalStyle = ({
  isChampionship,
}: {
  isChampionship?: boolean;
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
      backgroundColor: Colors.black,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
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
      color: Colors.dark.white,
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
    headlineDivider: {
      width: 1,
      height: 14,
      marginHorizontal: 4,
      backgroundColor: Colors.white,
    },
  });
