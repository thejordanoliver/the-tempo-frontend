import { Colors } from "constants/styles";
import { EXPANDED_HEIGHT_THRESHOLD } from "constants/widgetLeaders";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import { BasketballGame } from "types/basketball";
import { FootballGame } from "types/football";
import { NHLGame } from "types/hockey";
import { Game } from "types/nba";
import BasketballGameWidget from "./GameCards/BasketballGameWidget";
import FootballGameWidget from "./GameCards/FootballGameWidget";
import NBAGameWidget from "./GameCards/NBAGameWidget";
import NHLGameWidget from "./GameCards/NHLGameWidget";

// Outside component — never changes
const ENABLE_AUTO_SLIDE = false;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type WidgetSlide =
  | { type: "NBA"; data: Game }
  | { type: "NFL"; data: FootballGame }
  | { type: "CFB"; data: FootballGame }
  | { type: "CBB"; data: BasketballGame }
  | { type: "WCBB"; data: BasketballGame }
  | { type: "WNBA"; data: BasketballGame }
  | { type: "NHL"; data: NHLGame };

type WidgetSliderProps = {
  games: WidgetSlide[];
  initialHeight?: number;
  initialWidth?: number;
  isDark: boolean;
};

export default function WidgetSlider({
  games,
  initialHeight = 100,
  initialWidth = 100,
  isDark,
}: WidgetSliderProps) {
  // Read once — these don't change during the component's lifetime
  const { width: screenWidth, height: screenHeight } = useMemo(
    () => Dimensions.get("window"),
    [],
  );
  const aspectRatio = initialWidth / initialHeight;

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const currentOffset = useRef(0);

  const [slideHeight, setSlideHeight] = useState(initialHeight);
  const [slideWidth, setSlideWidth] = useState(initialWidth);

  // Single source of truth for height — avoids stale state in callbacks
  const slideHeightRef = useRef(initialHeight);
  const slideWidthRef = useRef(initialWidth);

  // Keep a ref in sync with currentIndex so panResponder can read it without
  // being recreated (fixes the stale-closure bug on lockedIndex assignment)
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  const showPlayers = slideHeight >= 300;
  const isExpanded = slideHeight >= EXPANDED_HEIGHT_THRESHOLD;
  const isResizing = useRef(false);
  const lockedIndex = useRef(0);

  const setDimensions = useCallback((height: number, width: number) => {
    slideHeightRef.current = height;
    slideWidthRef.current = width;
    setSlideHeight(height);
    setSlideWidth(width);
  }, []);

  // Keep currentIndexRef in sync
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Layout animation only fires when expand/collapse threshold is crossed
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isExpanded]);

  // -----------------------------------------------------------------------
  // Slides — only recompute when inputs change, not on every height tick
  // -----------------------------------------------------------------------
  const slides = useMemo<WidgetSlide[]>(() => {
    return games.filter((game) => "data" in game) as WidgetSlide[];
  }, [games]);

  // -----------------------------------------------------------------------
  // Auto-slide
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!ENABLE_AUTO_SLIDE || slides.length <= 1 || !flatListRef.current)
      return;

    const interval = setInterval(() => {
      const nextIndex = currentIndexRef.current + 1;
      const from = currentOffset.current;
      // Use ref so the animation always uses the current height
      const to =
        nextIndex < slides.length ? nextIndex * slideHeightRef.current : 0;

      let start: number | null = null;
      const duration = 600;

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = progress * progress;
        flatListRef.current?.scrollToOffset({
          offset: from + (to - from) * eased,
          animated: false,
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          currentOffset.current = to;
          setCurrentIndex(nextIndex >= slides.length ? 0 : nextIndex);
        }
      };

      requestAnimationFrame(animate);
    }, 15000);

    return () => clearInterval(interval);
  }, [slides.length]); // currentIndex removed — read from ref instead

  // -----------------------------------------------------------------------
  // Scroll handler — uses ref for height to avoid stale closure
  // -----------------------------------------------------------------------
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          if (isResizing.current) return;
          const offsetY = event.nativeEvent.contentOffset.y;
          currentOffset.current = offsetY;
          // Use ref — not stale even though this closure is created once
          const index = Math.round(offsetY / slideHeightRef.current);
          setCurrentIndex(index);
        },
      }),
    // scrollY is a stable ref value — safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // -----------------------------------------------------------------------
  // Snap helper
  // -----------------------------------------------------------------------
  const snapToCurrentSlide = useCallback(() => {
    if (!flatListRef.current) return;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: lockedIndex.current * slideHeightRef.current,
        animated: true,
      });
    });
  }, []);

  // -----------------------------------------------------------------------
  // PanResponder — reads all mutable state from refs, never recreated
  // -----------------------------------------------------------------------
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        isResizing.current = true;
        // Read from ref — fixes the stale-closure bug where this was always 0
        lockedIndex.current = currentIndexRef.current;
      },

      onPanResponderMove: (_, { dy }) => {
        const minH = initialHeight;
        const maxH = screenHeight;
        const minW = initialWidth;
        const maxW = screenWidth;

        let newH = slideHeightRef.current + dy;
        let newW = newH * aspectRatio;

        if (newW > maxW) {
          newW = maxW;
          newH = newW / aspectRatio;
        }
        if (newW < minW) {
          newW = minW;
          newH = newW / aspectRatio;
        }
        if (newH > maxH) {
          newH = maxH;
          newW = newH * aspectRatio;
        }
        if (newH < minH) {
          newH = minH;
          newW = newH * aspectRatio;
        } // was / aspectRatio

        slideHeightRef.current = newH;
        slideWidthRef.current = newW;
        setSlideHeight(newH);
        setSlideWidth(newW);
      },

      onPanResponderRelease: () => {
        isResizing.current = false;
        snapToCurrentSlide();
      },
      onPanResponderTerminate: () => {
        isResizing.current = false;
        snapToCurrentSlide();
      },
    }),
  ).current;

  // -----------------------------------------------------------------------
  // Progress bar
  // -----------------------------------------------------------------------
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Memoized so it isn't recreated on every render
  const progressHeight = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [0, Math.max((slides.length - 1) * slideHeight, 1)],
        outputRange: ["0%", "100%"],
        extrapolate: "clamp",
      }),
    [slides.length, slideHeight, scrollY],
  );

  const showProgress = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    Animated.timing(progressOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [progressOpacity]);

  const hideProgress = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      Animated.timing(progressOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, [progressOpacity]);

  const scaleX = useMemo(
    () =>
      progressOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.95],
      }),
    [progressOpacity],
  );

  // -----------------------------------------------------------------------
  // FlatList item layout — stable callback
  // -----------------------------------------------------------------------
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: slideHeight,
      offset: slideHeight * index,
      index,
    }),
    [slideHeight],
  );

  const keyExtractor = useCallback(
    (_: unknown, index: number) => String(index),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: WidgetSlide }) => {
      switch (item.type) {
        case "NBA":
          return (
            <View style={{ height: slideHeight }}>
              <NBAGameWidget
                game={item.data}
                height={slideHeight}
                width={slideWidth}
                showPlayers={showPlayers} // ← missing
                isDark={isDark}
              />
            </View>
          );
        case "NFL":
          return (
            <View style={{ height: slideHeight }}>
              <FootballGameWidget
                game={item.data}
                height={slideHeight}
                width={slideWidth}
                isDark={isDark}
                league="NFL"
              />
            </View>
          );
        case "CFB":
          return (
            <View style={{ height: slideHeight }}>
              <FootballGameWidget
                game={item.data}
                height={slideHeight}
                width={slideWidth}
                isDark={isDark}
                league="CFB"
              />
            </View>
          );
        case "CBB":
          return (
            <View style={{ height: slideHeight }}>
              <BasketballGameWidget
                game={item.data}
                height={slideHeight}
                width={slideWidth}
                isDark={isDark}
                league="CBB"
              />
            </View>
          );
        case "WCBB":
          return (
            <View style={{ height: slideHeight }}>
              <BasketballGameWidget
                game={item.data}
                height={slideHeight}
                width={slideWidth}
                isDark={isDark}
                league="WCBB"
              />
            </View>
          );
        case "WNBA":
          return (
            <View style={{ height: slideHeight }}>
              <BasketballGameWidget
                game={item.data}
                height={slideHeight}
                width={slideWidth}
                isDark={isDark}
                league="WNBA"
              />
            </View>
          );
        case "NHL":
          return (
            <View style={{ height: slideHeight }}>
              <NHLGameWidget
                game={item.data}
                height={slideHeight}
                width={slideWidth}
                isDark={isDark}
              />
            </View>
          );

        default:
          return <View style={{ height: slideHeight }} />;
      }
    },
    [slideHeight, slideWidth, showPlayers, isDark],
  );

  // -----------------------------------------------------------------------
  // Styles — memoized, not recreated every render
  // -----------------------------------------------------------------------
  const styles = useMemo(() => sliderStyles(isDark), [isDark]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <Animated.View
      style={{
        height: slideHeight,
        minWidth: "48%",
        maxWidth: "100%",
        transform: [{ scaleX }],
      }}
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={keyExtractor}
          pagingEnabled
          snapToInterval={slideHeight}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          onScrollBeginDrag={showProgress}
          onMomentumScrollBegin={showProgress}
          onMomentumScrollEnd={hideProgress}
          onScrollEndDrag={hideProgress}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={renderItem}
        />
        <View style={styles.resizeHandle} {...panResponder.panHandlers} />
      </View>

      <Animated.View
        style={[styles.progressContainer, { opacity: progressOpacity }]}
      >
        <Animated.View
          style={[styles.progressBar, { height: progressHeight }]}
        />
      </Animated.View>
    </Animated.View>
  );
}

// -----------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------
const sliderStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      borderRadius: 8,
      flexDirection: "row",
      borderColor: Colors.midTone,
      borderWidth: 1,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      position: "relative",
      overflow: "hidden",
      padding: 4,
    },
    progressContainer: {
      position: "absolute",
      right: -14,
      top: "25%",
      height: "50%",
      width: 4,
      borderRadius: 2,
      backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
      overflow: "hidden",
    },
    progressBar: {
      width: "100%",
      borderRadius: 2,
      backgroundColor: isDark ? Colors.dark.white : Colors.light.black,
    },
    resizeHandle: {
      width: 20,
      height: 20,
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: isDark ? Colors.dark.white : Colors.light.black,
      borderTopLeftRadius: 8,
      zIndex: 10,
    },
  });
