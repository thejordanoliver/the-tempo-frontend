import { Colors, Fonts } from "constants/styles";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
type Props = {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
  duration?: number;
};

export default function ProgressRing({
  value,
  max,
  size = 72,
  strokeWidth = 8,
  color,
  label,
  duration = 900,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = progressRingStyles(isDark);
  const progress = max > 0 ? value / max : 0;

  // Animated value (0 → progress)
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedProgress.setValue(0);

    Animated.timing(animatedProgress, {
      toValue: progress,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // SVG does not support native driver
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: "center", width: size }}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          stroke="#e5e5e5"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Animated foreground ring */}
        <AnimatedCircle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Value */}
      <Text style={styles.teamValue}>{value}</Text>

      {/* Label */}
      <Text style={styles.teamName}>{label}</Text>
    </View>
  );
}

const progressRingStyles = (isDark: boolean) =>
  StyleSheet.create({
    teamValue: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      marginTop: 6,
    },
    teamName: {
      fontSize: 10,
      fontFamily: Fonts.OSBOLD,
      marginTop: 6,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
  });
