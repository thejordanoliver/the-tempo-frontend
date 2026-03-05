import React, { useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  ScrollViewProps,
} from "react-native";
import CustomActivityIndicator from "./CustomActivityIndicator";

interface Props {
  children: React.ReactElement<ScrollViewProps>;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
}

export default function CustomRefreshControl({
  children,
  onRefresh,
  threshold = 120,
}: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(0);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------- Reset Animation ---------------- */

  const reset = () => {
    Animated.spring(translateY, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  /* ---------------- Trigger Refresh ---------------- */

  const triggerRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    Animated.spring(translateY, {
      toValue: threshold,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();

    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
      reset();
    }
  };

  /* ---------------- Pull Resistance ---------------- */

  const applyResistance = (dy: number) => {
    const resisted = dy * 0.6;
    return Math.min(resisted, threshold * 1.5);
  };

  /* ---------------- Gesture Handling ---------------- */

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 10 && scrollY.current <= 0 && !refreshing,

      onPanResponderMove: (_, g) => {
        if (g.dy > 0 && scrollY.current <= 0) {
          translateY.setValue(applyResistance(g.dy));
        }
      },

      onPanResponderRelease: (_, g) => {
        if (g.dy > threshold) {
          triggerRefresh();
        } else {
          reset();
        }
      },
    })
  ).current;

  /* ---------------- Spinner Animations ---------------- */

  const spinnerScale = translateY.interpolate({
    inputRange: [0, threshold],
    outputRange: [0.6, 1],
    extrapolate: "clamp",
  });

  const spinnerOpacity = translateY.interpolate({
    inputRange: [0, threshold * 0.5, threshold],
    outputRange: [0, 0.7, 1],
    extrapolate: "clamp",
  });

  /* ---------------- Inject Scroll Listener ---------------- */

  const enhancedChild = React.cloneElement(children, {
    scrollEventThrottle: 16,
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.current = e.nativeEvent.contentOffset.y;

      // Preserve existing onScroll if provided
      if (children.props.onScroll) {
        children.props.onScroll(e);
      }
    },
  });

  return (
    <View style={styles.container}>
      {/* Spinner */}
      <Animated.View
        style={[
          styles.spinnerContainer,
          {
            transform: [{ translateY }, { scale: spinnerScale }],
            opacity: spinnerOpacity,
          },
        ]}
      >
        <CustomActivityIndicator size={42} thickness={4} lighter />
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={{ transform: [{ translateY }] }}
        {...panResponder.panHandlers}
      >
        {enhancedChild}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spinnerContainer: {
    position: "absolute",
    top: -80,
    left: 0,
    right: 0,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});
