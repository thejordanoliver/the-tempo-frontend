import { Colors } from "constants/styles";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { getTeamCardGradientColors } from "utils/games/teamCardGradient";

type Props = {
  isDark: boolean;
  awayColor?: string | null;
  homeColor?: string | null;
};

/**
 * Two subtle, diagonal washes behind preview content.
 * Away starts in the top-left; home starts in the top-right.
 * Each fades into the modal's original background before reaching the content.
 */
export function GamePreviewCornerGradients({
  isDark,
  awayColor,
  homeColor,
}: Props) {
  const background = isDark ? Colors.dark.background : Colors.light.background;
  const colors = getTeamCardGradientColors(
    isDark,
    awayColor ?? undefined,
    homeColor ?? undefined,
    background,
  );

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <LinearGradient
        colors={[colors[0], colors[1], background]}
        locations={[0, 0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.leftCorner}
      />
      <LinearGradient
        colors={[colors[4], colors[3], background]}
        locations={[0, 0.4, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.rightCorner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  leftCorner: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "58%",
    height: 260,
  },
  rightCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "58%",
    height: 260,
  },
});
