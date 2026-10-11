import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { FadeInLeft, ReduceMotion } from "react-native-reanimated";

const ENTER_PLAY = FadeInLeft.duration(280)
  .withInitialValues({ opacity: 0, transform: [{ translateX: -24 }] })
  .reduceMotion(ReduceMotion.System);

export default function GameSummaryPlayRow({
  children, animate, index, style,
}: PropsWithChildren<{ animate: boolean; index: number; style: StyleProp<ViewStyle> }>) {
  return (
    <Animated.View
      entering={animate ? ENTER_PLAY.delay(Math.min(index, 4) * 35) : undefined}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
