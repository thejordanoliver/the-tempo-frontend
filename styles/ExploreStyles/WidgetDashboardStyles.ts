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
      gap: EXPLORE_WIDGET_GRID_GAP,
      width: "100%",
      alignItems: "flex-start",
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
      width: "100%",
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
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
      minHeight: 34,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: 8,
      paddingHorizontal: 10,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    toolbarButtonSelected: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      borderColor: isDark ? Colors.white : Colors.black,
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
      paddingHorizontal: 24,
      gap: 10,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    emptyTitle: {
      fontFamily: Fonts.SEMIBOLD,
      fontSize: 24,
      color: isDark ? Colors.white : Colors.black,
    },
    emptyText: {
      maxWidth: 280,
      textAlign: "center",
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    cta: {
      marginTop: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
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
      borderRadius: 8,
      padding: 14,
      gap: 6,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      position: "relative",
      overflow: "hidden",
    },
    loadingCard: {
      minHeight: 84,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    errorCard: {
      borderRadius: 8,
      padding: 14,
      gap: 6,
      backgroundColor: isDark ? "#351c1c" : "#fff0f0",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "#7a2d2d" : "#f2b8b8",
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
