import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Ellipse } from "react-native-svg";

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

export default function PlayLocationPulse({
  x,
  y,
  color,
  radiusX = 13,
  radiusY = 8,
}: {
  x: number;
  y: number;
  color: string;
  radiusX?: number;
  radiusY?: number;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
      -1,
      false,
      undefined,
      ReduceMotion.System,
    );
    return () => cancelAnimation(progress);
  }, [progress, x, y]);
  const animatedProps = useAnimatedProps(
    () => ({
      rx: radiusX + progress.value * 18,
      ry: radiusY + progress.value * 11,
      opacity: 0.8 * (1 - progress.value),
    }),
    [progress, radiusX, radiusY],
  );
  return (
    <AnimatedEllipse
      cx={x}
      cy={y}
      rx={radiusX}
      ry={radiusY}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      animatedProps={animatedProps}
    />
  );
}
