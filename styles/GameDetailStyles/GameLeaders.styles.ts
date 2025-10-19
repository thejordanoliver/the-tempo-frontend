import { Fonts } from "constants/fonts";
import { StyleSheet } from "react-native";
export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { marginTop: 12, overflow: "hidden" },
    center: { alignItems: "center", justifyContent: "center", padding: 16 },
    error: { fontFamily: Fonts.OSREGULAR },
    card: { flexDirection: "row", alignItems: "center", padding: 12 },
    avatar: {
      width: 48,
      height: 48,
    },
    avatarWrapper: {
      width: 50,
      height: 50,

      borderRadius: 100,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
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
    statText: { fontFamily: Fonts.OSREGULAR, fontSize: 14 },
    teamLogo: { position: "absolute", top: 6, right: 6, width: 28, height: 28 },
  });
