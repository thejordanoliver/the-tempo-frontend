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
      fontFamily: Fonts.OSREGULAR,
      fontSize: 14,
      color: textColor,
      marginRight: 8,
      flexShrink: 1,
    },
    timestamp: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: Colors.midTone,
      paddingBottom: 12,
    },

    // -----------------------------
    // Comment Content
    // -----------------------------
    commentContainer: { flex: 1, marginTop: 8 },
    timestampContainer: {
      flexDirection: "row",
    },
    image: {
      width: 30,
      height: 30,
      borderRadius: 100,
      marginRight: 10,
    },
    text: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.OSREGULAR,
      color: textColor,
      flexShrink: 1,
    },
    expandText: {
      color: Colors.midTone,
      fontFamily: Fonts.OSBOLD,
      paddingVertical: 4,
    },

    // -----------------------------
    // Actions
    // -----------------------------
    actionsContainer: {
      width: ACTION_WIDTH,
      flexDirection: "row",
      paddingLeft: 12,
    },
    actionWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    button: {
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    confirmButton: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
    deleteButton: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    // -----------------------------
    // Edit Mode
    // -----------------------------
    editInputContainer: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: textColor,
      padding: 12,
      borderRadius: 6,
      marginVertical: 12,
    },
    editActionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    saveText: {
      color: isDark ? Colors.dark.leafGreen : Colors.light.green,
      fontSize: 20,
      fontFamily: Fonts.OSREGULAR,
    },
    cancelText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: 20,
      fontFamily: Fonts.OSREGULAR,
    },
  });
}
