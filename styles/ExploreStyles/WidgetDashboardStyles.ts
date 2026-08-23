import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const EXPLORE_WIDGET_GRID_GAP = 12;
export const EXPLORE_WIDGET_ROW_GAP = 16;

export const widgetDashboardStyles = (isDark: boolean) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      gap: EXPLORE_WIDGET_ROW_GAP,
      paddingBottom: 96,
    },
    scroll: {
      flex: 1,
    },
    gridRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: EXPLORE_WIDGET_GRID_GAP,
      width: "100%",
    },
    gridCell: {
      flexShrink: 0,
    },
    gridCellFull: {
      width: "100%",
    },
    draggableCell: {
      marginBottom: 0,
    },
    dropPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      width: "100%",
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
      borderStyle: "dashed",
      borderRadius: 8,
      backgroundColor: isDark
        ? "rgba(68, 178, 111, 0.12)"
        : "rgba(44, 156, 83, 0.1)",
    },
    dropPlaceholderText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 13,
      color: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    toolbar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
      width: "100%",
    },
    toolbarButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      minHeight: 34,
      paddingHorizontal: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    toolbarButtonSelected: {
      borderColor: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    toolbarButtonText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 13,
      color: isDark ? Colors.white : Colors.black,
    },
    toolbarButtonTextSelected: {
      color: isDark ? Colors.black : Colors.white,
    },
    emptyWrap: {
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 24,
    },
    emptyIcon: {
      alignItems: "center",
      justifyContent: "center",
      width: 56,
      height: 56,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 16,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    emptyTitle: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 24,
      color: isDark ? Colors.white : Colors.black,
    },
    emptyText: {
      maxWidth: 280,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    cta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 6,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    ctaText: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 14,
      color: isDark ? Colors.black : Colors.white,
    },
    section: {
      flex: 1,
    },
    placeholderCard: {
      position: "relative",
      gap: 6,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },
    loadingCard: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 84,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    errorCard: {
      gap: 6,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "#7a2d2d" : "#f2b8b8",
      borderRadius: 8,
      backgroundColor: isDark ? "#351c1c" : "#fff0f0",
    },
    placeholderTitle: {
      flex: 1,
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    placeholderText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      lineHeight: 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
