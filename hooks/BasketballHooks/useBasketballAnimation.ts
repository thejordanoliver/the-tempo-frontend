import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";
import {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** One UI-thread animation at a time; a duplicate id never restarts playback. */
export function useBasketballAnimation(eventKey: string, active: boolean) {
  const progress = useSharedValue(1);
  const initialReducedMotion = useReducedMotion();
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const reducedMotion = motionOverride ?? initialReducedMotion;
  useEffect(() => {
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setMotionOverride,
    );
    return () => listener.remove();
  }, []);
  const played = useRef<string | null>(null);
  useEffect(() => {
    cancelAnimation(progress);
    if (!active || reducedMotion) {
      progress.value = 1;
      if (active) played.current = eventKey;
    } else if (played.current !== eventKey) {
      played.current = eventKey;
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 1100,
        easing: Easing.inOut(Easing.quad),
        reduceMotion: ReduceMotion.System,
      });
    }
    return () => cancelAnimation(progress);
  }, [active, eventKey, progress, reducedMotion]);
  return { progress, reducedMotion };
}
