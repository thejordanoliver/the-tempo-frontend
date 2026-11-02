import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Follows the device setting, including prefers-reduced-motion on Expo web. */
export function useReducedMotion() {
  // Avoid starting decorative motion before the preference has been read.
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let active = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        changed = true;
        setReduceMotion(enabled);
      },
    );

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active && !changed) setReduceMotion(enabled);
      })
      .catch(() => {
        // Keep motion reduced when the platform cannot report a preference.
      });

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
}
