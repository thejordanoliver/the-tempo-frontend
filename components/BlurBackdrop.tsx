import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useDerivedValue,
  runOnJS,
} from "react-native-reanimated";

export default function BlurBackdrop({ animatedPosition, style }: BottomSheetBackdropProps) {
  const { resolvedColorScheme } = usePreferences();
  const [intensity, setIntensity] = useState(0);

  const minPosition = 576; // 40% snap point
  const maxPosition = 76;  // 92% snap point (top of screen)

  useDerivedValue(() => {
    const newIntensity = Math.round(
      interpolate(
        animatedPosition.value,
        [minPosition, maxPosition],
        [0, 100],
        Extrapolate.CLAMP
      )
    );

    runOnJS(setIntensity)(newIntensity);
  }, [animatedPosition]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedPosition.value,
      [minPosition, maxPosition],
      [0, 1],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style, animatedStyle]}>
      <BlurView
        tint={resolvedColorScheme === "dark" ? "dark" : "light"}
        intensity={intensity}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}
