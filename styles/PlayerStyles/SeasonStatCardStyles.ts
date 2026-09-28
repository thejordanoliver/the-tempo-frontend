import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const seasonStatCardStyles = (isDark: boolean) => {
  const surface = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const text = isDark ? Colors.white : Colors.black;
  const muted = Colors.midTone;
  const divider = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    card: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: surface,
      overflow: "hidden",
    },
    rankStrip: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 28,
      width: "120%",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      zIndex: 1,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: text,
      textAlign: "center",
    },
    statRank: {
      width: "100%",
      height: 28,
      marginTop: -12,
      marginBottom: 7,
      fontFamily: Fonts.MEDIUM,
      fontSize: 11,
      lineHeight: 28,
      letterSpacing: 0.4,
      textAlign: "center",
    },
    statLabel: {
      marginTop: 3,
      fontFamily: Fonts.MEDIUM,
      fontSize: 10,
      letterSpacing: 1.8,
      color: muted,
      textAlign: "center",
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: divider,
    },
    errorText: {
      fontFamily: Fonts.REGULAR,
      color: muted,
      textAlign: "center",
    },
  });
};
