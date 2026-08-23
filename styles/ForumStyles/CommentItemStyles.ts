import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

const ACTION_WIDTH = 180;

export function commentItemStyles(isDark: boolean) {
  const textColor = isDark ? Colors.white : Colors.black;

  return StyleSheet.create({
    // -----------------------------
    // Container
    // -----------------------------
    container: {
      marginHorizontal: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
    },

    // -----------------------------
    // User Row
    // -----------------------------
    user: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 12,
    },
    username: {
      flexShrink: 1,
      marginRight: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: textColor,
    },
    timestamp: {
      paddingBottom: 12,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: Colors.midTone,
    },

    // -----------------------------
    // Comment Content
    // -----------------------------
    commentContainer: {
      flex: 1,
      marginTop: 8,
    },
    timestampContainer: {
      flexDirection: "row",
    },
    image: {
      width: 30,
      height: 30,
      marginRight: 10,
      borderRadius: 100,
    },
    text: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: textColor,
    },
    expandText: {
      paddingVertical: 4,
      fontFamily: Fonts.BOLD,
      color: Colors.midTone,
    },

    // -----------------------------
    // Actions
    // -----------------------------
    actionsContainer: {
      flexDirection: "row",
      width: ACTION_WIDTH,
      paddingLeft: 12,
    },
    actionWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
    },
    confirmButton: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    deleteButton: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    // -----------------------------
    // Edit Mode
    // -----------------------------
    editInputContainer: {
      marginVertical: 12,
      padding: 12,
      borderRadius: 6,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: textColor,
    },
    editActionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    saveText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 20,
      color: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    cancelText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
}
