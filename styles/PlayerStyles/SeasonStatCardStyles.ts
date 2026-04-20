import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const seasonStatCardStyles = (isDark: boolean) => {
  const bg = isDark ? Colors.black : Colors.white;
  const surface = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const text = isDark ? Colors.white : Colors.black;
  const muted = Colors.midTone;
  const divider = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    card: {
      borderRadius: 8,
      padding: 12,
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
      fontSize: 20,
      fontFamily: Fonts.OSBOLD,
      color: text,
    },
    statLabel: {
      fontSize: 10,
      fontFamily: Fonts.OSMEDIUM,
      color: muted,
      letterSpacing: 1.8,
      marginTop: 3,
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: divider,
    },
  });
};
