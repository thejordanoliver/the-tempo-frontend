import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const NotificationsCenterStyles = (isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
    },

    list: {
      flex: 1,
    },

    container: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 20,
    },

    emptyContainer: {
      justifyContent: "center",
    },

    selectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    selectionCount: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontVariant: ["tabular-nums"],
    },

    markAllButton: {
      paddingHorizontal: 4,
      paddingVertical: 4,
    },

    markAllButtonPressed: {
      opacity: 0.55,
    },

    selectAllText: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    notificationRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    notificationRowUnread: {
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },

    notificationRowPressed: {
      opacity: 0.55,
    },

    selectionCircle: {
      width: 23,
      height: 23,
      flexShrink: 0,
      marginTop: 9,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
      borderRadius: 999,
    },

    selectionCircleSelected: {
      borderColor: isDark ? Colors.dark.blue : Colors.light.blue,
      backgroundColor: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    iconWrapper: {
      position: "relative",
      width: 42,
      height: 42,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 21,
      marginHorizontal: 5,
    },

    gameTeamLogoWrapper: {
      width: 52,
      marginHorizontal: 0,
      borderWidth: 0,
      borderRadius: 0,
    },

    profileImage: {
      width: "100%",
      height: "100%",
      borderRadius: 21,
    },

    unreadDot: {
      position: "absolute",
      top: 2,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    textContainer: {
      flex: 1,
      minWidth: 0,
      gap: 4,
      paddingTop: 1,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: 7,
    },

    leagueLabel: {
      flexShrink: 0,
      overflow: "hidden",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: isDark ? Colors.dark.blue : Colors.light.blue,
      color: Colors.white,
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      lineHeight: 13,
      letterSpacing: 0.4,
    },

    notificationHeader: {
      flexShrink: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    notificationText: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    notificationTime: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    teamNames: {
      flexShrink: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.white : Colors.black,
    },

    chevron: {
      flexShrink: 0,
      marginTop: 12,
    },

    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 32,
      paddingVertical: 40,
    },

    emptyTitle: {
      marginTop: 4,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },

    emptyText: {
      maxWidth: 320,
      textAlign: "center",
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    selectionToolbar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: isDark
        ? Colors.dark.background
        : Colors.light.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    deleteButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 14,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    deleteButtonDisabled: {
      opacity: 0.4,
    },

    deleteButtonPressed: {
      opacity: 0.7,
    },

    deleteButtonText: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: Colors.white,
    },
  });
