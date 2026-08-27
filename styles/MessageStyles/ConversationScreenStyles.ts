import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet } from "react-native";

export const ConversationScreenStyles = (isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    messagesContent: {
      flexGrow: 1,
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 120,
    },

    olderMessagesLoader: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },

    messageRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 12,
    },

    currentUserRow: {
      justifyContent: "flex-end",
    },

    otherUserRow: {
      justifyContent: "flex-start",
    },

    messageAvatar: {
      width: 30,
      height: 30,
      marginRight: 8,
      borderRadius: 15,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    messageStack: {
      maxWidth: "78%",
    },

    currentUserMessageStack: {
      alignItems: "flex-end",
    },

    otherUserMessageStack: {
      alignItems: "flex-start",
    },

    messageBubble: {
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 18,
    },

    attachmentMessageBubble: {
      paddingHorizontal: 6,
      paddingTop: 6,
      paddingBottom: 8,
      overflow: "hidden",
    },

    currentUserBubble: {
      borderColor: isDark ? Colors.white : Colors.black,
      borderBottomRightRadius: 6,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    otherUserBubble: {
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomLeftRadius: 6,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    messageText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    attachmentCaptionText: {
      marginTop: 8,
      paddingHorizontal: 6,
    },

    currentUserMessageText: {
      color: isDark ? Colors.black : Colors.white,
    },

    messageAttachment: {
      width: 210,
      height: 160,
      borderRadius: 14,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    messageTime: {
      alignSelf: "flex-end",
      marginTop: 6,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: Colors.midTone,
    },

    attachmentMessageTime: {
      paddingHorizontal: 6,
    },

    currentUserMessageTime: {
      color: isDark ? Colors.darkGray : Colors.lightGray,
    },

    messageReceiptText: {
      alignSelf: "flex-end",
      marginTop: 4,
      marginRight: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingBottom: 80,
    },

    emptyTitle: {
      marginTop: 12,
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },

    emptyText: {
      marginTop: 6,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },

    retryButton: {
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 18,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    retryButtonText: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: isDark ? Colors.black : Colors.white,
    },

    typingBubble: {
      maxWidth: "78%",
      justifyContent: "center",
      minHeight: 40,
      paddingHorizontal: 13,
      paddingVertical: 10,
    },

    typingBubbleText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      fontStyle: "italic",
      lineHeight: 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    composerOuter: {
      position: "absolute",
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 20,
      paddingHorizontal: 12,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark ? Colors.black : Colors.white,
      elevation: 20,
    },

    previewContainer: {
      alignSelf: "center",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 14,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },

    uploadStatusText: {
      marginBottom: 8,
      paddingHorizontal: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    previewMedia: {
      width: 200,
      height: 200,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    previewBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "#00000088",
    },

    previewBadgeText: {
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      color: Colors.white,
    },

    previewCloseButton: {
      position: "absolute",
      top: 6,
      right: 6,
      borderRadius: 999,
      backgroundColor: "#00000088",
    },

    composer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      minHeight: 50,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 24,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    attachmentAnchor: {
      position: "relative",
      zIndex: 100,
      elevation: 100,
    },

    attachmentButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "transparent",
    },

    attachmentButtonActive: {
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    themeButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 19,
      backgroundColor: "transparent",
    },

    input: {
      flex: 1,
      minHeight: 38,
      maxHeight: 112,
      paddingTop: 8,
      paddingBottom: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 19,
      color: isDark ? Colors.white : Colors.black,
    },

    sendButton: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    sendButtonDisabled: {
      opacity: 0.35,
    },

    sendError: {
      marginTop: 6,
      paddingHorizontal: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
