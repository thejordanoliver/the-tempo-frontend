import { useCallback, useRef } from "react";
import { Animated } from "react-native";
import type { PagerViewOnPageScrollEvent } from "react-native-pager-view";

export function usePagerTabScrollProgress() {
  const scrollProgress = useRef(new Animated.Value(0)).current;

  const handlePageScroll = useCallback(
    (event: PagerViewOnPageScrollEvent) => {
      const { offset, position } = event.nativeEvent;
      scrollProgress.setValue(position + offset);
    },
    [scrollProgress],
  );

  const syncPageScrollProgress = useCallback(
    (index: number) => {
      scrollProgress.setValue(index);
    },
    [scrollProgress],
  );

  return {
    scrollProgress,
    handlePageScroll,
    syncPageScrollProgress,
  };
}
