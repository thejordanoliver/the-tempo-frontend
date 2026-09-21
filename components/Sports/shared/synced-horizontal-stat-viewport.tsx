import React, { memo, useMemo } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  contentWidth: number;
  scrollX: SharedValue<number>;
  viewportWidth: number;
};

function setSharedValue<T>(sharedValue: SharedValue<T>, value: T) {
  "worklet";
  sharedValue.value = value;
}

function SyncedHorizontalStatViewport({
  children,
  contentWidth,
  scrollX,
  viewportWidth,
}: Props) {
  const gestureStartX = useSharedValue(0);
  const maxOffset = Math.max(contentWidth - viewportWidth, 0);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-8, 8])
        .failOffsetY([-12, 12])
        .onBegin(() => {
          setSharedValue(gestureStartX, scrollX.value);
        })
        .onUpdate((event) => {
          setSharedValue(
            scrollX,
            Math.min(
              Math.max(gestureStartX.value - event.translationX, 0),
              maxOffset,
            ),
          );
        })
        .onEnd((event) => {
          setSharedValue(
            scrollX,
            withDecay({
              velocity: -event.velocityX,
              clamp: [0, maxOffset],
            }),
          );
        }),
    [gestureStartX, maxOffset, scrollX],
  );

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -scrollX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ flex: 1, overflow: "hidden" }}>
        <Animated.View
          style={[
            { flexDirection: "row", width: contentWidth },
            animatedContentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

export default memo(SyncedHorizontalStatViewport);
