import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native";
import { useSharedValue, type SharedValue } from "react-native-reanimated";
import {
  TICKER_REORDER_MIN_MOVEMENT,
  tickerReorderScrollTarget,
} from "utils/tickerReorderScroll";

type Phase = "idle" | "holding" | "dragging" | "settling";
export interface TickerReorderScroll {
  scrollRef: RefObject<ScrollView | null>;
  scrollEnabled: boolean;
  scrollOffset: SharedValue<number>;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  onContentSizeChange: (width: number, height: number) => void;
  hold: (pageY: number) => void;
  beginDrag: () => void;
  moveDrag: (translationY: number) => void;
  releaseDrag: () => void;
  finishDrag: () => void;
  cancelHold: () => void;
}

export const TickerReorderScrollContext =
  createContext<TickerReorderScroll | null>(null);

export function useTickerReorderScroll(): TickerReorderScroll {
  const value = useContext(TickerReorderScrollContext);
  if (!value)
    throw new Error(
      "Ticker reorder controls require a reorderable ticker page.",
    );
  return value;
}

export function useTickerReorderPageScroll(
  resetKey?: string,
): TickerReorderScroll {
  const scrollRef = useRef<ScrollView | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollOffset = useSharedValue(0);
  const offset = useRef(0);
  const contentHeight = useRef(0);
  const viewportTop = useRef<number | null>(null);
  const viewportHeight = useRef(0);
  const phase = useRef<Phase>("idle");
  const startPageY = useRef(0);
  const translation = useRef(0);
  const measureEpoch = useRef(0);
  const frame = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);

  const stopFrames = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    lastFrameTime.current = null;
  }, []);

  const measureViewport = useCallback(() => {
    const epoch = ++measureEpoch.current;
    scrollRef.current
      ?.getNativeScrollRef()
      ?.measureInWindow((_x, y, _width, height) => {
        if (epoch !== measureEpoch.current || !Number.isFinite(y)) return;
        viewportTop.current = y;
        if (height > 0 && Number.isFinite(height))
          viewportHeight.current = height;
      });
  }, []);

  const tick = useCallback(
    function onFrame(timestamp: number) {
      frame.current = null;
      if (phase.current !== "dragging") return;
      const elapsedMs =
        lastFrameTime.current === null ? 0 : timestamp - lastFrameTime.current;
      lastFrameTime.current = timestamp;
      if (viewportTop.current !== null) {
        const next = tickerReorderScrollTarget({
          pointerY: startPageY.current + translation.current,
          translationY: translation.current,
          viewportTop: viewportTop.current,
          viewportHeight: viewportHeight.current,
          contentHeight: contentHeight.current,
          scrollOffset: offset.current,
          elapsedMs,
        });
        if (Math.abs(next - offset.current) > 0.01) {
          // Keep the list's outer offset aligned with the immediate native scroll.
          offset.current = next;
          scrollOffset.value = next;
          scrollRef.current?.scrollTo({ y: next, animated: false });
        }
      }
      frame.current = requestAnimationFrame(onFrame);
    },
    [scrollOffset],
  );

  const clearDrag = useCallback(() => {
    stopFrames();
    phase.current = "idle";
    translation.current = 0;
    ++measureEpoch.current;
    scrollRef.current?.setNativeProps({ scrollEnabled: true });
  }, [stopFrames]);

  const finishDrag = useCallback(() => {
    clearDrag();
    setScrollEnabled(true);
  }, [clearDrag]);

  const hold = useCallback(
    (pageY: number) => {
      if (
        !Number.isFinite(pageY) ||
        phase.current === "dragging" ||
        phase.current === "settling"
      )
        return;
      stopFrames();
      phase.current = "holding";
      startPageY.current = pageY;
      translation.current = 0;
      // Lock on press-in rather than waiting for the long-press drag callback.
      scrollRef.current?.setNativeProps({ scrollEnabled: false });
      setScrollEnabled(false);
      // Stop existing momentum without changing the page's current position.
      scrollRef.current?.scrollTo({ y: offset.current, animated: false });
      measureViewport();
    },
    [measureViewport, stopFrames],
  );

  const beginDrag = useCallback(() => {
    stopFrames();
    phase.current = "dragging";
    translation.current = 0;
    scrollRef.current?.setNativeProps({ scrollEnabled: false });
    setScrollEnabled(false);
  }, [stopFrames]);

  const moveDrag = useCallback(
    (translationY: number) => {
      if (phase.current !== "dragging" || !Number.isFinite(translationY))
        return;
      translation.current = translationY;
      if (
        Math.abs(translationY) >= TICKER_REORDER_MIN_MOVEMENT &&
        frame.current === null
      )
        frame.current = requestAnimationFrame(tick);
    },
    [tick],
  );

  const releaseDrag = useCallback(() => {
    stopFrames();
    if (phase.current === "dragging") phase.current = "settling";
  }, [stopFrames]);

  const cancelHold = useCallback(() => {
    if (phase.current === "holding") finishDrag();
  }, [finishDrag]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      if (!Number.isFinite(y)) return;
      offset.current = y;
      scrollOffset.value = y;
    },
    [scrollOffset],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewportHeight.current = event.nativeEvent.layout.height;
      measureViewport();
    },
    [measureViewport],
  );

  const onContentSizeChange = useCallback((_width: number, height: number) => {
    if (Number.isFinite(height)) contentHeight.current = height;
  }, []);

  const resetPage = useCallback(() => {
    // The keyed ScrollView remounts at zero on a connection change. Do not
    // replay the previous device's offset when its replacement is grabbed.
    offset.current = 0;
    scrollOffset.value = 0;
    viewportTop.current = null;
    viewportHeight.current = 0;
    contentHeight.current = 0;
    finishDrag();
  }, [finishDrag, scrollOffset]);

  useLayoutEffect(() => {
    resetPage();
    return clearDrag;
  }, [resetKey, resetPage, clearDrag]);

  return useMemo(
    () => ({
      scrollRef,
      scrollEnabled,
      scrollOffset,
      onScroll,
      onLayout,
      onContentSizeChange,
      hold,
      beginDrag,
      moveDrag,
      releaseDrag,
      finishDrag,
      cancelHold,
    }),
    [
      scrollEnabled,
      scrollOffset,
      onScroll,
      onLayout,
      onContentSizeChange,
      hold,
      beginDrag,
      moveDrag,
      releaseDrag,
      finishDrag,
      cancelHold,
    ],
  );
}
