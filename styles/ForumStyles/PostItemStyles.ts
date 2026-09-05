import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export function PostItemStyles(isDark: boolean) {
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
      flexShrink: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    profileImage: {
      width: 32,
      height: 32,
      borderRadius: 999,
    },

    profilePlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    username: {
      flexShrink: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
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
      marginTop: 12,
      borderRadius: 14,
    },

    pollContainer: {
      marginTop: 14,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      borderRadius: 14,
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
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      borderRadius: 10,
      overflow: "hidden",
    },

    optionFill: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      borderRadius: 10,
    },

    optionLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 46,
      paddingHorizontal: 12,
      paddingVertical: 10,
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },

    rightSide: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    buttonContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      minWidth: 44,
      minHeight: 40,
      paddingHorizontal: 4,
    },

    count: {
      fontFamily: Fonts.REGULAR,
      fontSize: 16,
      color: textColor,
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
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
      width: "100%",
    },

    button: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
      paddingHorizontal: 18,
      borderRadius: 10,
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
      zIndex: 60,
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
    },

    menuPlaceholder: {
      width: 40,
      height: 40,
    },

    menuButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "transparent",
    },

    submenu: {
      position: "absolute",
      top: 42,
      right: 0,
      zIndex: 80,
      width: 160,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 14,
      overflow: "hidden",
      shadowColor: Colors.black,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.16,
      shadowRadius: 14,
      elevation: 20,
    },

    submenuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minHeight: 48,
      paddingHorizontal: 12,
    },

    submenuIconWrap: {
      alignItems: "center",
      justifyContent: "center",
      width: 30,
      height: 30,
      borderRadius: 15,
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

export const CommentItemStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      zIndex: 1,
      paddingHorizontal: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
      overflow: "visible",
      elevation: 0,
    },

    replyRoot: {
      marginLeft: 42,
      marginTop: 8,
      paddingHorizontal: 0,
      backgroundColor: "transparent",
    },

    containerMenuOpen: {
      zIndex: 1000,
      elevation: 24,
    },

    commentContainer: {
      zIndex: 1,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors.midTone,
      overflow: "visible",
    },

    replyCommentContainer: {
      paddingVertical: 7,
      borderBottomWidth: 0,
    },

    lastContainer: {
      borderBottomWidth: 0,
    },

    userRow: {
      zIndex: 60,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "visible",
      elevation: 60,
    },

    leftSide: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
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
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    profileInitial: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: Colors.white,
    },

    replyProfileInitial: {
      fontSize: 12,
    },

    userMeta: {
      flex: 1,
      justifyContent: "center",
      minWidth: 0,
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
      zIndex: 120,
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      elevation: 120,
    },

    menuPlaceholder: {
      width: 32,
      height: 32,
    },

    menuButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "transparent",
      borderRadius: 16,
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
      zIndex: 160,
      width: 136,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 14,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 24,
    },

    submenuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },

    submenuIconWrap: {
      alignItems: "center",
      justifyContent: "center",
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    submenuText: {
      flex: 1,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
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
      zIndex: 1,
      marginTop: 8,
      overflow: "visible",
    },

    commentTextClip: {
      width: "100%",
      overflow: "hidden",
    },

    commentText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
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
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    measureText: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      zIndex: -1,
      opacity: 0,
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
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 24,
      marginTop: 8,
    },

    replyActionButton: {
      justifyContent: "center",
      minHeight: 24,
    },

    replyActionText: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    replyCountText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 16,
      color: Colors.midTone,
    },

    repliesContainer: {
      marginTop: 4,
    },

    viewRepliesButton: {
      alignSelf: "flex-start",
      justifyContent: "center",
      minHeight: 28,
      marginLeft: 42,
      marginTop: 2,
    },

    viewRepliesText: {
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      lineHeight: 16,
      color: isDark ? Colors.dark.blue : Colors.light.blue,
    },

    editContainer: {
      marginTop: 10,
    },

    editInput: {
      minHeight: 84,
      maxHeight: 160,
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 6,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    editActionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      width: "100%",
      marginTop: 8,
    },

    editButton: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 8,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },

    cancelText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    saveText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 15,
      color: isDark ? Colors.dark.leafGreen : Colors.light.green,
    },
  });
