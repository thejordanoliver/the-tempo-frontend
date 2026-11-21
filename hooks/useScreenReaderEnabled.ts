import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Pause automatic content changes until the assistive-technology setting is known. */
export function useScreenReaderEnabled() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let active = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      (nextEnabled) => {
        changed = true;
        setEnabled(nextEnabled);
      },
    );
    void AccessibilityInfo.isScreenReaderEnabled()
      .then((nextEnabled) => {
        if (active && !changed) setEnabled(nextEnabled);
      })
      .catch(() => {});
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}
