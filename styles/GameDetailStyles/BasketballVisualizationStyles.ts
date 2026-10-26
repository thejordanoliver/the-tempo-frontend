import { Colors, Fonts } from "constants/styles";
import { StyleSheet } from "react-native";

export const basketballVisualizationStyles = (isDark: boolean) =>
  StyleSheet.create({
    controls: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
    },
    button: {
      minHeight: 36,
      minWidth: 44,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    buttonText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    disabled: { opacity: 0.35 },
    caption: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      lineHeight: 15,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    score: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    card: {
      padding: 10,
      gap: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
    },
    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    swatch: { width: 10, height: 10, borderRadius: 5 },
    chart: { width: "100%", height: 210 },
    tooltip: { minHeight: 48, gap: 2, justifyContent: "center" },
    empty: {
      minHeight: 80,
      justifyContent: "center",
      alignItems: "center",
      padding: 12,
    },
  });
