import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const GiphySearchModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    handleStyle: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    handleIndicatorStyle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.midTone,
    },
    backgroundStyle: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    headerContent: {
      paddingBottom: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
    },
    subtitle: {
      marginTop: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    closeButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 46,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 14,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },
    listContent: {
      paddingHorizontal: 14,
      paddingBottom: 44,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    columnWrapper: {
      gap: 8,
    },
    gifContainer: {
      flex: 1 / 3,
      aspectRatio: 1,
      marginBottom: 8,
      borderRadius: 10,
      backgroundColor: isDark ? Colors.dark.itemBackground : Colors.lightGray,
      overflow: "hidden",
    },
    gifImage: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
    },
    emptyText: {
      marginTop: 24,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    loadingText: {
      paddingVertical: 12,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
  });
