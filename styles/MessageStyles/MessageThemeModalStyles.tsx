import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const MessageThemeModalStyles = (isDark: boolean) =>
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
    backgroundStyle: { backgroundColor: isDark ? Colors.black : Colors.white },
    container: {
      flex: 1,
      padding: 12,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 40,
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

    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },

    title: {
      fontSize: 20,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },

    scrollContent: {
      gap: 8,
      paddingBottom: 8,
    },

    optionRow: {
      minHeight: 66,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    optionSelected: {
      borderColor: isDark ? Colors.white : Colors.black,
    },

    optionPressed: {
      opacity: 0.78,
    },

    optionBody: {
      flex: 1,
      minWidth: 0,
    },

    optionTitle: {
      fontSize: 14,
      lineHeight: 19,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    optionMeta: {
      marginTop: 2,
      fontSize: 11,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },

    defaultIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      flexDirection: "row",
    },

    defaultSwatch: {
      flex: 1,
    },

    defaultSwatchDark: {
      backgroundColor: Colors.black,
    },

    defaultSwatchLight: {
      backgroundColor: Colors.white,
    },

    sectionHeader: {
      paddingTop: 8,
      paddingHorizontal: 2,
    },

    sectionTitle: {
      fontSize: 12,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textTransform: "uppercase",
    },

    loadingRow: {
      minHeight: 72,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyState: {
      minHeight: 72,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    emptyTitle: {
      fontSize: 13,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    logoWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    logo: {
      width: 30,
      height: 30,
    },

    swatchRow: {
      flexDirection: "row",
      gap: 4,
    },

    colorSwatch: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
    },

    errorText: {
      marginTop: 10,
      fontSize: 12,
      lineHeight: 17,
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    actions: {
      flexDirection: "row",
      gap: 10,
      padding: 12,
    },

    actionButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },

    cancelButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: "transparent",
    },

    saveButton: {
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    actionButtonDisabled: {
      opacity: 0.4,
    },

    cancelText: {
      fontSize: 14,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    saveText: {
      fontSize: 14,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.black : Colors.white,
    },
  });
