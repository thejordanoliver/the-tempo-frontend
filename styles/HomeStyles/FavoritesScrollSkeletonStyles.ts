import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";
export const favoritesScrollSkeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: "row",
      marginBottom: 20,
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    skeletonItem: {
      alignItems: "center",
      marginRight: 16,
    },
    circleWrapper: {
      position: "relative",
      width: 80,
      height: 80,
      marginBottom: 6,
      borderRadius: 40,
      overflow: "hidden",
    },
    circle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    labelWrapper: {
      position: "relative",
      width: 50,
      height: 12,
      borderRadius: 4,
      overflow: "hidden",
    },
    label: {
      width: 50,
      height: 12,
      borderRadius: 4,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
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
