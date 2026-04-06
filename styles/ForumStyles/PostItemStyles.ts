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
  });
}
