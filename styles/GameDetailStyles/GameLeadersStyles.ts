import { activeOpacity, Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const gameLeadersStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      gap: 10,
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
    },
    pressed: {
      opacity: activeOpacity,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
    },
    avatar: {
      width: 52,
      height: 52,
    },
    avatarWrapper: {
      width: 60,
      height: 60,
      borderRadius: 100,
      paddingTop: 10,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    jersey: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      marginLeft: 4,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    infoSection: { flex: 1, marginLeft: 10, justifyContent: "flex-end" },
    playerName: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    statRow: {
      flexDirection: "row",
      marginTop: 4,
      justifyContent: "space-between",
      paddingRight: 12,
    },
    statBlock: { alignItems: "flex-start", flex: 1 },
    statLabel: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 10,
      color: isDark ? Colors.midTone : Colors.midTone,
    },
    statText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    teamLogo: { position: "absolute", top: 8, right: 8, width: 28, height: 28 },
  });
