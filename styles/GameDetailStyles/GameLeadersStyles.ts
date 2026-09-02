import { activeOpacity, Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const LeadersStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      gap: 10,
    },
    wrapper: {
      borderWidth: 1,
      borderColor: Colors.midTone,
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
      width: 50,
      height: 50,
    },
    avatarWrapper: {
      alignItems: "center",
      justifyContent: "center",
      width: 50,
      height: 50,
      paddingTop: 8,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 100,
      overflow: "hidden",
    },
    jersey: {
      marginLeft: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    infoSection: {
      flex: 1,
      justifyContent: "flex-end",
      marginLeft: 10,
    },
    playerName: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
      paddingRight: 12,
    },
    statBlock: {
      flex: 1,
      alignItems: "flex-start",
    },
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
    teamLogo: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 28,
      height: 28,
    },
  });
