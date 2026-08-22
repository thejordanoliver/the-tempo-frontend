import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export function postItemStyles(isDark: boolean) {
  const textColor = isDark ? Colors.white : Colors.black;
  const mutedColor = Colors.midTone;
  const surfaceColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const borderColor = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    /* -------------------------------------------------------------------------- */
    /*                                  Container                                 */
    /* -------------------------------------------------------------------------- */

    container: {
      paddingHorizontal: 14,
    },

    postContainer: {
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },

    /* -------------------------------------------------------------------------- */
    /*                                   Header                                   */
    /* -------------------------------------------------------------------------- */

    userRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    leftSide: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flexShrink: 1,
    },

    profileImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },

    profilePlaceholder: {
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },

    username: {
      flexShrink: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      lineHeight: 20,
      color: textColor,
    },

    /* -------------------------------------------------------------------------- */
    /*                                Post Content                                */
    /* -------------------------------------------------------------------------- */

    postTextWrapper: {
      paddingTop: 12,
    },

    postText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      lineHeight: 23,
      color: textColor,
    },

    singleImageWrapper: {
      marginTop: 12,
    },

    singlePostImage: {
      width: "100%",
      height: 280,
      borderRadius: 14,
      marginTop: 12,
    },

    pollContainer: {
      marginTop: 14,
      padding: 14,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: surfaceColor,
    },

    pollQuestion: {
      marginBottom: 14,
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      lineHeight: 21,
      color: textColor,
    },

    optionWrapper: {
      position: "relative",
      minHeight: 46,
      marginBottom: 9,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      overflow: "hidden",
    },

    optionFill: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      borderRadius: 10,
    },

    optionLabelRow: {
      minHeight: 46,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    optionContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingRight: 8,
    },

    optionText: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 19,
      color: textColor,
    },

    percentageText: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: mutedColor,
    },

    footerText: {
      marginTop: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: mutedColor,
    },

    /* -------------------------------------------------------------------------- */
    /*                                   Footer                                   */
    /* -------------------------------------------------------------------------- */

    postFooter: {
      marginTop: 12,
    },

    interactionContainer: {
      width: "100%",
    },

    interactionWrapper: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    rightSide: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    buttonContainer: {
      minWidth: 44,
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingHorizontal: 4,
    },

    count: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 14,
      lineHeight: 18,
      color: mutedColor,
    },

    timestamp: {
      marginTop: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 16,
      color: mutedColor,
    },

    timeWrapper: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 3,
    },

    /* -------------------------------------------------------------------------- */
    /*                                    Edit                                    */
    /* -------------------------------------------------------------------------- */

    editPostText: {
      minHeight: 110,
      marginTop: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      borderRadius: 12,
      backgroundColor: surfaceColor,
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      lineHeight: 22,
      color: textColor,
    },

    editActionsContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 10,
      width: "100%",
    },

    button: {
      minHeight: 40,
      paddingHorizontal: 18,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surfaceColor,
    },

    saveText: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: textColor,
    },

    cancelText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: mutedColor,
    },

    /* -------------------------------------------------------------------------- */
    /*                                    Menu                                    */
    /* -------------------------------------------------------------------------- */

    menuAnchor: {
      position: "relative",
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 60,
    },

    menuPlaceholder: {
      width: 40,
      height: 40,
    },

    menuButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },

    submenu: {
      position: "absolute",
      top: 42,
      right: 0,
      width: 160,

      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,

      shadowColor: Colors.black,
      shadowOpacity: 0.16,
      shadowRadius: 14,
      shadowOffset: {
        width: 0,
        height: 8,
      },

      elevation: 20,
      overflow: "hidden",
      zIndex: 80,
    },

    submenuItem: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      gap: 10,
    },

    submenuIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    submenuText: {
      flex: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    submenuSeparator: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 52,
      backgroundColor: borderColor,
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

    replyRoot: {
      paddingHorizontal: 0,
      marginLeft: 42,
      marginTop: 8,
      backgroundColor: "transparent",
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

    replyCommentContainer: {
      paddingVertical: 7,
      borderBottomWidth: 0,
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

    replyProfileImage: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },

    profilePlaceholder: {
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },

    profileInitial: {
      color: Colors.white,
      fontFamily: Fonts.BOLD,
      fontSize: 14,
    },

    replyProfileInitial: {
      fontSize: 12,
    },

    userMeta: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
      paddingRight: 8,
    },

    username: {
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },

    replyUsername: {
      fontSize: 14,
    },

    timestamp: {
      marginTop: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: Colors.midTone,
    },

    replyTimestamp: {
      fontSize: 10,
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
      fontFamily: Fonts.BOLD,
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
      fontFamily: Fonts.REGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    replyText: {
      fontSize: 13,
      lineHeight: 19,
    },

    expandButton: {
      alignSelf: "flex-start",
      marginTop: 5,
    },

    expandText: {
      fontSize: 12,
      fontFamily: Fonts.BOLD,
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

    replyMediaWrapper: {
      maxWidth: "92%",
    },

    mediaOnlyWrapper: {
      marginTop: 0,
    },

    commentActionsRow: {
      marginTop: 8,
      minHeight: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    replyActionButton: {
      minHeight: 24,
      justifyContent: "center",
    },

    replyActionText: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    replyCountText: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.REGULAR,
      color: Colors.midTone,
    },

    repliesContainer: {
      marginTop: 4,
    },

    viewRepliesButton: {
      alignSelf: "flex-start",
      minHeight: 28,
      justifyContent: "center",
      marginLeft: 42,
      marginTop: 2,
    },

    viewRepliesText: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
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
      fontFamily: Fonts.REGULAR,
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
      fontFamily: Fonts.REGULAR,
    },

    saveText: {
      color: isDark ? Colors.dark.leafGreen : Colors.light.green,
      fontSize: 15,
      fontFamily: Fonts.REGULAR,
    },
  });
