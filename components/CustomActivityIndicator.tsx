import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface Props {
  size?: number;
  thickness?: number;
  lighter?: boolean;
}

export default function CustomActivityIndicator({
  size = 48,
  thickness = 4,
  lighter,
}: Props) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const isDark = useColorScheme() === "dark";

  const gradientStart = lighter ? Colors.white : Colors.white;
  const gradientEnd = lighter ? "transparent" : "transparent";

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const radius = (size - thickness) / 2;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={gradientStart} stopOpacity="1" />
              <Stop offset="100%" stopColor={gradientEnd} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#grad)"
            strokeWidth={thickness}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
