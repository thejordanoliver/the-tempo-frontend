import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

/** Focus and foreground eligibility, with an immediate guard for async callbacks. */
export function useScreenActivity() {
  const focused = useRef(false);
  const foreground = useRef(AppState.currentState === "active");
  const activeRef = useRef(false);
  const [active, setActive] = useState(false);
  const update = useCallback(() => {
    activeRef.current = focused.current && foreground.current;
    setActive(activeRef.current);
  }, []);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      foreground.current = AppState.currentState === "active";
      update();
      return () => {
        focused.current = false;
        update();
      };
    }, [update]),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      foreground.current = state === "active";
      update();
    });
    return () => {
      activeRef.current = false;
      subscription.remove();
    };
  }, [update]);
  return { active, activeRef };
}
