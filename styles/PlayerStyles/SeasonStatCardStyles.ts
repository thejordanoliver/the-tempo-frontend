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
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontFamily: Fonts.BOLD,
      fontSize: 20,
      color: text,
    },
    statLabel: {
      marginTop: 3,
      fontFamily: Fonts.MEDIUM,
      fontSize: 10,
      letterSpacing: 1.8,
      color: muted,
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
