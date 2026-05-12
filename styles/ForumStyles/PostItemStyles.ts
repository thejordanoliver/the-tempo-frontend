import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export function postItemStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      paddingTop: 12,
      paddingHorizontal: 12,
    },
    postContainer: {
      borderBottomColor: Colors.midTone,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingVertical: 10,
    },
    username: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    timeWrapper: { flex: 1, justifyContent: "flex-end" },
    timestamp: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: Colors.midTone,
    },
    postTextWrapper: {
      minHeight: 100,
      justifyContent: "center",
    },
    postText: {
      marginTop: 12,
      marginBottom: 12,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    editPostText: {
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderWidth: 1,
      borderRadius: 6,
      padding: 8,
      minHeight: 100,
      maxHeight: 280,
      marginTop: 12,
      marginBottom: 12,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    postFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    leftSide: {
      flexDirection: "row",
    },
    rightSide: {
      flexDirection: "row",
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
      justifyContent: "space-between",
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 50,
      marginRight: 8,
    },
    profilePlaceholder: {
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },
    likeButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: 50,
    },
    count: {
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
      marginLeft: 4,
      marginRight: 4,
      fontFamily: Fonts.OSREGULAR,
    },
    interactionContainer: { flex: 1 },
    interactionWrapper: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 8,
    },
    dropdownMenu: {
      position: "absolute",
      right: 12,
      top: 36,
      borderRadius: 8,
      borderTopRightRadius: 2,
      overflow: "hidden",
      width: 120,
      height: 100,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 1000,
      justifyContent: "center",
    },
    dropdownItem: { borderBottomWidth: 1, borderBottomColor: Colors.midTone },

    singleImageWrapper: {
      marginTop: 4,
    },
    singlePostImage: {
      width: "100%",
      height: 250,
      borderRadius: 8,
      marginBottom: 10,
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
    button: {
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
    },

    //Poll Block
    pollContainer: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      padding: 14,
      marginTop: 10,
    },

    pollQuestion: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSBOLD,
      fontSize: 15,
      marginBottom: 12,
    },
    optionWrapper: {
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
    },
    optionFill: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      borderRadius: 8,
    },
    optionLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    optionContent: { flexDirection: "row", alignItems: "center", gap: 6 },
    optionText: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 14,
    },
    percentageText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
    },
    footerText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      marginTop: 4,
    },

    menuAnchor: {
      position: "relative",
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 60,
      elevation: 60,
    },

    menuPlaceholder: {
      width: 32,
      height: 32,
    },

    menuButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "transparent",
      backgroundColor: "transparent",
    },

    submenu: {
      position: "absolute",
      top: 38,
      right: 0,
      width: 136,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      shadowColor: Colors.black,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 18,
      overflow: "hidden",
      zIndex: 80,
    },

    submenuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 8,
    },

    submenuIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    submenuText: {
      flex: 1,
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    submenuSeparator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
}

export const commentItemStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
      overflow: "visible",
      zIndex: 1,
      elevation: 0,
    },

    containerMenuOpen: {
      zIndex: 1000,
      elevation: 24,
    },

    commentContainer: {
      borderBottomColor: Colors.midTone,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingVertical: 10,
      overflow: "visible",
      zIndex: 1,
    },

    lastContainer: {
      borderBottomWidth: 0,
    },

    userRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "visible",
      zIndex: 60,
      elevation: 60,
    },

    leftSide: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
    },

    avatarButton: {
      marginRight: 8,
    },

    profileImage: {
      width: 34,
      height: 34,
      borderRadius: 17,
    },

    profilePlaceholder: {
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },

    profileInitial: {
      color: Colors.white,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
    },

    userMeta: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
      paddingRight: 8,
    },

    username: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },

    timestamp: {
      marginTop: 1,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 11,
      color: Colors.midTone,
    },

    menuAnchor: {
      position: "relative",
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 120,
      elevation: 120,
    },

    menuPlaceholder: {
      width: 32,
      height: 32,
    },

    menuButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "transparent",
      backgroundColor: "transparent",
    },

    menuButtonActive: {
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    submenu: {
      position: "absolute",
      top: 38,
      right: 0,
      width: 136,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      shadowColor: Colors.black,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 24,
      overflow: "hidden",
      zIndex: 160,
    },

    submenuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 8,
    },

    submenuIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    submenuText: {
      flex: 1,
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    deleteSubmenuText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    submenuSeparator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    commentBody: {
      position: "relative",
      marginTop: 8,
      overflow: "visible",
      zIndex: 1,
    },

    commentTextClip: {
      overflow: "hidden",
      width: "100%",
    },

    commentText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    expandButton: {
      alignSelf: "flex-start",
      marginTop: 5,
    },

    expandText: {
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    measureText: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      opacity: 0,
      zIndex: -1,
    },

    commentMediaWrapper: {
      width: "100%",
      marginTop: 4,
    },

    mediaOnlyWrapper: {
      marginTop: 0,
    },

    editContainer: {
      marginTop: 10,
    },

    editInput: {
      minHeight: 84,
      maxHeight: 160,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 8,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    editActionsContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      width: "100%",
      marginTop: 8,
    },

    editButton: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginLeft: 8,
      flexDirection: "row",
      alignItems: "center",
    },

    cancelText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: 15,
      fontFamily: Fonts.OSREGULAR,
    },

    saveText: {
      color: isDark ? Colors.dark.leafGreen : Colors.light.green,
      fontSize: 15,
      fontFamily: Fonts.OSREGULAR,
    },
  });
