import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";
export const styles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    container: {},
    teamBlock: { marginBottom: 12 },
    injuryItem: {
      flexDirection: "row",
      padding: 8,
      alignItems: "center",
      borderBottomColor: lighter? Colors.midTone : isDark ? Colors.midTone : Colors.midTone,
    },
    avatar: {
      width: 52,
      height: 52,
    },
    avatarWrapper: {
      width: 60,
      height: 60,
      borderRadius: 100,
      paddingTop: 8,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: lighter? Colors.dark.white : isDark ? Colors.dark.white : Colors.light.black,
    },

    headshot: {
      width: 50,
      height: 50,
      borderRadius: 100,
      paddingTop: 4,
      marginRight: 8,
      backgroundColor: isDark ? "#444" : "#ddd",
    },

    name: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: lighter? Colors.dark.text : isDark ? Colors.dark.text : Colors.light.text,
    },
    playerHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    status: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: lighter? Colors.lightGray : isDark ? Colors.midTone : Colors.midTone,
    },
    jersey: {
 fontSize: 12,
      fontFamily: Fonts.OSREGULAR,
      color: lighter? Colors.lightGray : isDark ? Colors.lightGray : Colors.darkGray,
   marginLeft: 4
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "flex-end", // Align text on the same baseline
    },
    infoSection: { flex: 1, marginLeft: 10, justifyContent: "flex-end" },
    details: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color:lighter? Colors.dark.lightRed : isDark ? Colors.dark.lightRed : Colors.light.red,
    },

    row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },

    placeholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
      backgroundColor: "#ccc",
    },
    playerInfo: { flexDirection: "row", alignItems: "flex-end" },
  

    position: {
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      color: lighter? Colors.lightGray : isDark ? Colors.lightGray : Colors.darkGray,
      marginBottom: 4,
    },
    detail: {
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? "#ccc" : "#444",
    },
    returnDate: {
      marginTop: 2,
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      color: "#888",
    },
    separator: { height: 10 },
    loadingText: { marginTop: 8, fontSize: 14, color: "#333" },
    errorText: { fontSize: 14, color: "red" },
    bottom: { flexDirection: "row", alignItems: "center" },
    divder: {
      width: 1,
      height: 16,
      backgroundColor: lighter? Colors.midTone : isDark ? Colors.midTone : Colors.lightGray,
      marginHorizontal: 4,
    },
  });
