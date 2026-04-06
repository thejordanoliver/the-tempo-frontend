import { Colors } from "constants/styles";
import { StyleSheet } from "react-native";
export const favoritesScrollSkeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingTop: 24,
      marginBottom: 20,
    },
    skeletonItem: {
      marginRight: 16,
      alignItems: "center",
    },
    circleWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      overflow: "hidden",
      position: "relative",
      marginBottom: 6,
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
      width: 50,
      height: 12,
      borderRadius: 4,
      overflow: "hidden",
      position: "relative",
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
      backgroundColor: isDark
        ? "rgba(255,255,255,0.15)"
        : "rgba(255,255,255,0.4)",
      opacity: 0.7,
      borderRadius: 10,
      transform: [{ rotate: "20deg" }],
    },
  });
