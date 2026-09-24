/* eslint-disable react-hooks/immutability, react-hooks/refs -- Reanimated shared values are mutable by design and gesture worklets execute off render. */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  LinearTransition,
  ZoomIn,
  ZoomOut,
  cancelAnimation,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { widgetCarouselStyles } from "styles/ExploreStyles/WidgetCarouselStyles";
import type { WidgetCarouselProps } from "types/widgetCarousel";
import { getWidgetCarouselDotWindow } from "utils/widgetCarousel";

const DEFAULT_AUTO_PLAY_INTERVAL_MS = 5_000;
const FADE_OUT_MS = 260;
const FADE_IN_MS = 320;
const SLIDE_MS = 620;
const SWIPE_THRESHOLD = 0.22;
const FLING_VELOCITY = 500;
const SLIDE_EASING = Easing.bezier(0.22, 1, 0.36, 1);
const DISSOLVE_EASING = Easing.bezier(0.4, 0, 0.2, 1);
const DOT_LAYOUT_TRANSITION = LinearTransition.duration(220).easing(
  SLIDE_EASING,
);
const DOT_ENTERING_TRANSITION = ZoomIn.duration(180).easing(SLIDE_EASING);
const DOT_EXITING_TRANSITION = ZoomOut.duration(160).easing(SLIDE_EASING);

function WidgetCarouselComponent<Item>({
  items,
  initialWidth,
  height,
  isDark,
  renderItem,
  keyExtractor,
  autoPlay = false,
  autoPlayIntervalMs = DEFAULT_AUTO_PLAY_INTERVAL_MS,
  disabled = false,
  showDots = true,
  style,
  pageStyle,
  accessibilityLabel,
  onPageChange,
}: WidgetCarouselProps<Item>) {
  const pageIndexRef = useRef(0);
  const transitionInProgressRef = useRef(false);
  const lastManualInteractionRef = useRef(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() =>
    Math.max(initialWidth, 1),
  );
  const styles = useMemo(() => widgetCarouselStyles(isDark), [isDark]);
  const visibleDotIndexes = useMemo(
    () => getWidgetCarouselDotWindow(pageIndex, items.length),
    [items.length, pageIndex],
  );
  const trackTranslateX = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const carouselOpacity = useSharedValue(1);

  const syncPageIndex = useCallback(
    (nextIndex: number) => {
      pageIndexRef.current = nextIndex;
      setPageIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex,
      );
      onPageChange?.(nextIndex);
    },
    [onPageChange],
  );

  const finishTransition = useCallback(() => {
    transitionInProgressRef.current = false;
  }, []);

  const beginManualInteraction = useCallback(() => {
    transitionInProgressRef.current = false;
    lastManualInteractionRef.current = Date.now();
  }, []);

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackTranslateX.value }],
  }));

  const opacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: carouselOpacity.value,
  }));

  // The active page follows the live track and changes at the visual midpoint.
  useAnimatedReaction(
    () => {
      const maximumIndex = Math.max(items.length - 1, 0);
      const measuredWidth = Math.max(viewportWidth, 1);

      return Math.max(
        0,
        Math.min(
          maximumIndex,
          Math.round(-trackTranslateX.value / measuredWidth),
        ),
      );
    },
    (visiblePageIndex, previousPageIndex) => {
      if (visiblePageIndex === previousPageIndex) return;
      scheduleOnRN(syncPageIndex, visiblePageIndex);
    },
    [items.length, syncPageIndex, viewportWidth],
  );

  // Keep the current page valid when data or the measured viewport changes.
  useEffect(() => {
    const maximumIndex = Math.max(items.length - 1, 0);
    const nextIndex = Math.min(pageIndexRef.current, maximumIndex);

    cancelAnimation(trackTranslateX);
    transitionInProgressRef.current = false;
    trackTranslateX.value = -nextIndex * viewportWidth;

    if (nextIndex !== pageIndexRef.current) syncPageIndex(nextIndex);
  }, [items.length, syncPageIndex, trackTranslateX, viewportWidth]);

  useEffect(() => {
    if (!autoPlay || disabled || items.length <= 1) return;

    const interval = setInterval(() => {
      if (
        transitionInProgressRef.current ||
        Date.now() - lastManualInteractionRef.current < autoPlayIntervalMs
      ) {
        return;
      }

      const isLastPage = pageIndexRef.current === items.length - 1;
      transitionInProgressRef.current = true;

      if (isLastPage) {
        carouselOpacity.value = withTiming(
          0,
          { duration: FADE_OUT_MS, easing: DISSOLVE_EASING },
          (finished) => {
            if (!finished) return;

            trackTranslateX.value = 0;
            carouselOpacity.value = withTiming(
              1,
              { duration: FADE_IN_MS, easing: DISSOLVE_EASING },
              (fadeFinished) => {
                if (fadeFinished) scheduleOnRN(finishTransition);
              },
            );
          },
        );
        return;
      }

      const nextIndex = pageIndexRef.current + 1;
      trackTranslateX.value = withTiming(
        -nextIndex * viewportWidth,
        { duration: SLIDE_MS, easing: SLIDE_EASING },
        (finished) => {
          if (finished) scheduleOnRN(finishTransition);
        },
      );
    }, autoPlayIntervalMs);

    return () => {
      clearInterval(interval);
      transitionInProgressRef.current = false;
      cancelAnimation(trackTranslateX);
      cancelAnimation(carouselOpacity);
      trackTranslateX.value = -pageIndexRef.current * viewportWidth;
      carouselOpacity.value = 1;
    };
  }, [
    autoPlay,
    autoPlayIntervalMs,
    carouselOpacity,
    disabled,
    finishTransition,
    items.length,
    trackTranslateX,
    viewportWidth,
  ]);

  const carouselGesture = useMemo(() => {
    const maximumIndex = Math.max(items.length - 1, 0);
    const minimumX = -maximumIndex * viewportWidth;

    const settleAt = (nextIndex: number) => {
      "worklet";
      trackTranslateX.value = withTiming(-nextIndex * viewportWidth, {
        duration: SLIDE_MS,
        easing: SLIDE_EASING,
      });
    };

    return Gesture.Pan()
      .enabled(!disabled && items.length > 1)
      .activeOffsetX([-12, 12])
      .failOffsetY([-12, 12])
      .onStart(() => {
        cancelAnimation(trackTranslateX);
        cancelAnimation(carouselOpacity);
        carouselOpacity.value = 1;
        gestureStartX.value = trackTranslateX.value;
        scheduleOnRN(beginManualInteraction);
      })
      .onUpdate((event) => {
        trackTranslateX.value = Math.max(
          minimumX,
          Math.min(0, gestureStartX.value + event.translationX),
        );
      })
      .onEnd((event) => {
        const startIndex = Math.round(-gestureStartX.value / viewportWidth);
        const crossedDistance =
          Math.abs(event.translationX) >= viewportWidth * SWIPE_THRESHOLD;
        const flung = Math.abs(event.velocityX) >= FLING_VELOCITY;
        const direction = event.translationX < 0 ? 1 : -1;
        const nextIndex = Math.max(
          0,
          Math.min(
            maximumIndex,
            crossedDistance || flung
              ? startIndex + direction
              : Math.round(-trackTranslateX.value / viewportWidth),
          ),
        );

        settleAt(nextIndex);
      })
      .onFinalize((_event, succeeded) => {
        if (succeeded) return;

        const nearestIndex = Math.max(
          0,
          Math.min(
            maximumIndex,
            Math.round(-trackTranslateX.value / viewportWidth),
          ),
        );
        settleAt(nearestIndex);
      });
  }, [
    beginManualInteraction,
    carouselOpacity,
    disabled,
    gestureStartX,
    items.length,
    trackTranslateX,
    viewportWidth,
  ]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const measuredWidth = event.nativeEvent.layout.width;

      if (measuredWidth > 0 && Math.abs(measuredWidth - viewportWidth) > 0.5) {
        setViewportWidth(measuredWidth);
      }
    },
    [viewportWidth],
  );

  const resolvedAccessibilityLabel = accessibilityLabel?.(
    pageIndex,
    items.length,
  );

  return (
    <View
      style={[styles.container, height == null ? null : { height }, style]}
      onLayout={handleLayout}
    >
      <GestureDetector gesture={carouselGesture}>
        <Animated.View
          style={[styles.container, opacityAnimatedStyle]}
          accessibilityLabel={resolvedAccessibilityLabel}
        >
          <Animated.View
            style={[
              styles.track,
              { width: viewportWidth * items.length },
              trackAnimatedStyle,
            ]}
          >
            {items.map((item, index) => (
              <View
                key={keyExtractor(item, index)}
                style={[styles.page, { width: viewportWidth }, pageStyle]}
              >
                {renderItem(item, index)}
              </View>
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {showDots && items.length > 1 ? (
        <View style={styles.dots} accessibilityElementsHidden>
          {visibleDotIndexes.map((index, visibleIndex) => {
            const firstVisibleIndex = visibleDotIndexes[0];
            const lastVisibleIndex =
              visibleDotIndexes[visibleDotIndexes.length - 1];
            const isWindowEdge =
              (visibleIndex === 0 && firstVisibleIndex > 0) ||
              (visibleIndex === visibleDotIndexes.length - 1 &&
                lastVisibleIndex < items.length - 1);

            return (
              <Animated.View
                key={index}
                entering={DOT_ENTERING_TRANSITION}
                exiting={DOT_EXITING_TRANSITION}
                layout={DOT_LAYOUT_TRANSITION}
                style={[
                  styles.dot,
                  isWindowEdge && styles.edgeDot,
                  index === pageIndex && styles.activeDot,
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const WidgetCarousel = memo(
  WidgetCarouselComponent,
) as typeof WidgetCarouselComponent;

export default WidgetCarousel;
