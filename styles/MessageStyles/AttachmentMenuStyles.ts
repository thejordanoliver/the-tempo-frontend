import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const AttachmentMenuStyles = (isDark: boolean) =>
  StyleSheet.create({
    menu: {
      position: "absolute",
      bottom: 50,
      left: -4,
      zIndex: 100,
      width: 250,
      minHeight: 142,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.lightGray,
      borderRadius: 18,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "visible",
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 16,
      elevation: 20,
    },

    pointerDiamond: {
      position: "absolute",
      bottom: -7,
      left: 21,
      width: 14,
      height: 14,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      transform: [{ rotate: "45deg" }],
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    iconWrap: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      marginRight: 11,
      borderRadius: 19,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    textWrap: {
      flex: 1,
    },

    itemTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    itemSubtitle: {
      marginTop: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },

    separator: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 61,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
