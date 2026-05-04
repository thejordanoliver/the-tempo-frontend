import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const widgetDashboardStyles = (isDark: boolean) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      gap: 16,
      paddingBottom: 96,
    },
    scroll: {
      flex: 1,
    },
    gridRow: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
      alignItems: "flex-start",
    },
    gridCell: {
      flexShrink: 0,
    },
    gridCellFull: {
      width: "100%",
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
      fontFamily: Fonts.OSSEMIBOLD,
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
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 24,
      color: isDark ? Colors.white : Colors.black,
    },
    emptyText: {
      maxWidth: 280,
      textAlign: "center",
      fontFamily: Fonts.OSREGULAR,
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
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 14,
      color: isDark ? Colors.black : Colors.white,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dashboardTitle: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 22,
      color: isDark ? Colors.white : Colors.black,
    },
    dashboardSubtitle: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    section: {
      gap: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 0,
      gap: 8,
    },
    widgetControls: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    sizeControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    sizeButton: {
      width: 24,
      height: 24,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    sizeButtonSelected: {
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    sizeButtonText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: isDark ? Colors.white : Colors.black,
    },
    sizeButtonTextSelected: {
      color: isDark ? Colors.black : Colors.white,
    },
    iconAction: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    iconActionDisabled: {
      opacity: 0.35,
    },
    removeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    sectionTitle: {
      flex: 1,
      minWidth: 0,
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 17,
      color: isDark ? Colors.white : Colors.black,
    },
    sectionSubtitle: {
      marginTop: 2,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
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
    placeholderHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    placeholderTitle: {
      flex: 1,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    placeholderText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      lineHeight: 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    badge: {
      overflow: "hidden",
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 10,
      color: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
    },
  });
