import { Colors } from "constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

type HeaderSkeletonProps = {
  style?: StyleProp<ViewStyle>; // 👉 optional custom styling
};

export default function HeaderSkeleton({ style }: HeaderSkeletonProps) {
  const isDark = useColorScheme() === "dark";
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const styles = skeletonStyles(isDark);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, []);

  const baseColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;

  const overlayColor = isDark ? Colors.darkGray : Colors.lightGray;

  return (
    <View style={StyleSheet.flatten([styles.container, style])}>
      <View style={[styles.skeletonBase, { backgroundColor: baseColor }]}>
        <Animated.View
          style={[
            styles.overlay,
            {
              backgroundColor: overlayColor,
              opacity: pulseAnim,
            },
          ]}
        />
      </View>
    </View>
  );
}

const skeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginVertical: 8,
      marginHorizontal: 12,
    },
    skeletonBase: {
      height: 28,
      width: 160,
      borderRadius: 6,
      overflow: "hidden",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 6,
    },
  });
