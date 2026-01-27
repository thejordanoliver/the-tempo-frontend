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
  style?: StyleProp<ViewStyle>;
};

export default function HeaderSkeleton({ style }: HeaderSkeletonProps) {
  const isDark = useColorScheme() === "dark";
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const styles = skeletonStyles(isDark);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // ✅ REQUIRED for color animation
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, []);

  const borderBottomColor = pulseAnim.interpolate({
    inputRange: [0.3, 1],
    outputRange: [
      isDark ? Colors.darkGray : Colors.midTone,
      isDark ? Colors.lightGray : Colors.midTone,
    ],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        { borderBottomColor }, // ✅ CORRECT
      ]}
    >
      <View style={styles.skeletonBase}>
        <Animated.View
          style={[
            styles.overlay,
            {
              backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
              opacity: pulseAnim, // opacity CAN use native driver
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const skeletonStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingBottom: 4,
      marginBottom: 12,
      borderBottomWidth: 1,
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
