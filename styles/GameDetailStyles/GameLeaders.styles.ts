import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";



export const getStyles = (isDark: boolean, lighter: boolean) =>
  
  StyleSheet.create({
    container: {overflow: "hidden" },
    center: { alignItems: "center", justifyContent: "center", padding: 16 },
    error: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    card: { flexDirection: "row", alignItems: "center", padding: 12,  borderBottomWidth: StyleSheet.hairlineWidth, },
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
      borderColor: lighter
        ? Colors.white
        : isDark
        ? Colors.white
        : Colors.black,
    },
    jersey: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      marginLeft: 4,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "flex-end", // Align text on the same baseline
    },
    infoSection: { flex: 1, marginLeft: 10, justifyContent: "flex-end" },
    playerName: { fontFamily: Fonts.OSBOLD, fontSize: 14 },
    statRow: {
      flexDirection: "row",
      marginTop: 4,
      justifyContent: "space-between",
      paddingRight: 12,
    },
    statBlock: { alignItems: "flex-start", flex: 1 },
    statLabel: { fontFamily: Fonts.OSMEDIUM, fontSize: 10 },
    statText: { fontFamily: Fonts.OSREGULAR,  fontSize: 14, color: isDark ? Colors.white: Colors.black },
    teamLogo: { position: "absolute", top: 6, right: 6, width: 28, height: 28 },
  });
