import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const MessageListItemStyles = (isDark: boolean) => {
  const bgColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const subTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const pressed = isDark ? Colors.darkGray : Colors.lightGray;
  const borderColor = isDark ? Colors.lightGray : Colors.darkGray;

  return StyleSheet.create({
    swipeContainer: {
      marginBottom: 10,
      borderRadius: 8,
      overflow: "hidden",
    },

    rowContainer: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 82,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: bgColor,
    },

    avatarContainer: {
      width: 50,
      height: 50,
      marginRight: 12,
      borderRadius: 999,
      overflow: "hidden",
    },

    avatar: {
      width: 50,
      height: 50,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    onlineDot: {
      position: "absolute",
      right: 1,
      bottom: 1,
      width: 13,
      height: 13,
      borderWidth: 2,
      borderColor: borderColor,
      borderRadius: 7,
      backgroundColor: Colors.dark.leafGreen,
    },

    middleContent: {
      flex: 1,
      justifyContent: "center",
      minWidth: 0,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },

    username: {
      maxWidth: "82%",
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      color: textColor,
    },

    inlineIcon: {
      marginLeft: 5,
    },

    lastMessage: {
      marginTop: 3,
      fontSize: 13,
      fontFamily: Fonts.REGULAR,
      color: subTextColor,
    },

    metaContent: {
      alignItems: "flex-end",
      justifyContent: "center",
      minWidth: 48,
      marginLeft: 10,
    },

    timestamp: {
      marginBottom: 8,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: subTextColor,
    },

    unreadBadge: {
      alignItems: "center",
      justifyContent: "center",
      height: 22,
      minWidth: 22,
      paddingHorizontal: 7,
      borderRadius: 11,
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    unreadText: {
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      color: Colors.white,
    },

    actionContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 92,
      height: "100%",
    },

    pinAction: {
      backgroundColor: isDark ? Colors.dark.orange : Colors.light.orange,
    },

    deleteAction: {
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    actionText: {
      marginTop: 4,
      fontFamily: Fonts.BOLD,
      fontSize: 12,
      color: Colors.white,
    },
    pressed: {
      backgroundColor: pressed,
    },
  });
};
