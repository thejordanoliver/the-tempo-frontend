import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import type { PagerViewOnPageScrollEvent } from "react-native-pager-view";

export function usePagerTabScrollProgress() {
  const [scrollProgress] = useState(() => new Animated.Value(0));
  const settleFrame = useRef<number | null>(null);

  const cancelPendingSettle = useCallback(() => {
    if (settleFrame.current != null) {
      cancelAnimationFrame(settleFrame.current);
      settleFrame.current = null;
    }
  }, []);

  const handlePageScroll = useCallback(
    (event: PagerViewOnPageScrollEvent) => {
      const { offset, position } = event.nativeEvent;
      scrollProgress.setValue(position + offset);
    },
    [scrollProgress],
  );

  const syncPageScrollProgress = useCallback(
    (index: number) => {
      cancelPendingSettle();

      // PagerView can dispatch onPageSelected before its final onPageScroll.
      // Defer the exact value until those trailing native events have flushed;
      // otherwise the indicator briefly jumps to the tab, back to a fractional
      // position, and then forward again.
      settleFrame.current = requestAnimationFrame(() => {
        settleFrame.current = requestAnimationFrame(() => {
          settleFrame.current = null;
          scrollProgress.setValue(index);
        });
      });
    },
    [cancelPendingSettle, scrollProgress],
  );

  useEffect(() => cancelPendingSettle, [cancelPendingSettle]);

  return {
    scrollProgress,
    handlePageScroll,
    syncPageScrollProgress,
  };
}
