import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";

export const FavoritesScrollSkeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
      paddingTop: 24,
      paddingHorizontal: 16,
    },

    tabContainer: {
      alignItems: "center",
      width: 80,
    },

    circle: {
      alignItems: "center",
      justifyContent: "center",
      width: 80,
      height: 80,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.light.background : Colors.dark.background,
      borderRadius: 40,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },

    labelWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 30,
      marginTop: 4,
    },

    label: {
      width: 50,
      height: 12,
      borderRadius: 4,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },

    shimmer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 60,
      borderRadius: 10,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.15)"
        : "rgba(255,255,255,0.4)",
      opacity: 0.7,
      transform: [{ rotate: "20deg" }],
    },
  });
