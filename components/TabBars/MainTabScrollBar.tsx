import { Colors, Fonts } from "constants/styles";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface TabBarProps<T extends string> {
  tabs: readonly T[];
  selected: T;
  onTabPress: (tab: T) => void;
  renderLabel?: (tab: T, isSelected: boolean) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isDark?: boolean;
  scrollProgress?: Animated.Value;
}

type TabMeasurement = {
  x: number;
  width: number;
};

type UnderlineMetrics = {
  x: number;
  width: number;
};

type MeasuredUnderlineLayout = {
  tabsKey: string;
  metrics: UnderlineMetrics[];
};

const ANIMATION_DURATION = 170;
const ANIMATION_EASING = Easing.out(Easing.cubic);

function getDefaultLabelStyle(
  tab: string,
  isSelected: boolean,
  isDark: boolean,
): TextStyle {
  return {
    color: isSelected ? (isDark ? Colors.white : Colors.black) : Colors.midTone,
    fontFamily: Fonts.REGULAR,
    fontSize: tab.toLowerCase() === "home" ? 20 : 18,
  };
}

export default function MainScrollTabBar<T extends string>({
  tabs,
  isDark = false,
  selected,
  onTabPress,
  renderLabel,
  style,
  scrollProgress,
}: TabBarProps<T>) {
  const styles = MainScrollTabBarStyles;
  const scrollRef = useRef<ScrollView>(null);
  const [underlineX] = useState(() => new Animated.Value(0));
  const [underlineWidth] = useState(() => new Animated.Value(0));
  const textWidths = useRef(new Map<T, number>());
  const tabMeasurements = useRef(new Map<T, TabMeasurement>());
  const isUnderlineInitialized = useRef(false);
  const previousTabsKey = useRef(tabs.join("\u001f"));
  const layoutFrame = useRef<number | null>(null);
  const viewportWidth = useRef(0);
  const lastScrollRequest = useRef("");
  const [measuredLayout, setMeasuredLayout] =
    useState<MeasuredUnderlineLayout | null>(null);

  const selectedIndex = tabs.indexOf(selected);
  const tabsKey = tabs.join("\u001f");

  const getUnderlineMetrics = useCallback((tab: T): UnderlineMetrics | null => {
    const textWidth = textWidths.current.get(tab);
    const tabMeasurement = tabMeasurements.current.get(tab);

    if (textWidth == null || !tabMeasurement) {
      return null;
    }

    return {
      x: tabMeasurement.x + (tabMeasurement.width - textWidth) / 2,
      width: textWidth,
    };
  }, []);

  const scrollToTab = useCallback((tab: T, animated: boolean) => {
    const measurement = tabMeasurements.current.get(tab);
    const visibleWidth = viewportWidth.current;

    if (!measurement || visibleWidth <= 0) {
      return;
    }

    const requestKey = [
      tab,
      measurement.x,
      measurement.width,
      visibleWidth,
    ].join(":");

    if (lastScrollRequest.current === requestKey) {
      return;
    }

    lastScrollRequest.current = requestKey;
    scrollRef.current?.scrollTo({
      x: Math.max(measurement.x + measurement.width / 2 - visibleWidth / 2, 0),
      animated,
    });
  }, []);

  const requestLayoutSync = useCallback(() => {
    if (layoutFrame.current != null) {
      return;
    }

    // A tab produces separate label and pressable layout events. Coalescing
    // them avoids re-rendering the whole bar once for every measurement.
    layoutFrame.current = requestAnimationFrame(() => {
      layoutFrame.current = null;
      const metrics = tabs.map(getUnderlineMetrics);

      if (metrics.some((measurement) => measurement == null)) {
        return;
      }

      const nextLayout = {
        tabsKey,
        metrics: metrics as UnderlineMetrics[],
      };

      setMeasuredLayout((currentLayout) => {
        const isUnchanged =
          currentLayout?.tabsKey === nextLayout.tabsKey &&
          currentLayout.metrics.every(
            (measurement, index) =>
              measurement.x === nextLayout.metrics[index]?.x &&
              measurement.width === nextLayout.metrics[index]?.width,
          );

        return isUnchanged ? currentLayout : nextLayout;
      });
    });
  }, [getUnderlineMetrics, tabs, tabsKey]);

  const handleViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextWidth = event.nativeEvent.layout.width;

      if (viewportWidth.current === nextWidth) {
        return;
      }

      viewportWidth.current = nextWidth;
      lastScrollRequest.current = "";
      scrollToTab(selected, false);
    },
    [scrollToTab, selected],
  );

  const handleTextLayout = useCallback(
    (tab: T, event: LayoutChangeEvent) => {
      const nextWidth = event.nativeEvent.layout.width;

      if (textWidths.current.get(tab) === nextWidth) {
        return;
      }

      textWidths.current.set(tab, nextWidth);
      requestLayoutSync();
    },
    [requestLayoutSync],
  );

  const handleTabLayout = useCallback(
    (tab: T, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      const currentMeasurement = tabMeasurements.current.get(tab);

      if (currentMeasurement?.x === x && currentMeasurement.width === width) {
        return;
      }

      tabMeasurements.current.set(tab, { x, width });
      requestLayoutSync();
    },
    [requestLayoutSync],
  );

  useEffect(
    () => () => {
      if (layoutFrame.current != null) {
        cancelAnimationFrame(layoutFrame.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (previousTabsKey.current === tabsKey) {
      return;
    }

    previousTabsKey.current = tabsKey;
    const activeTabs = new Set<T>(tabs);

    for (const tab of textWidths.current.keys()) {
      if (!activeTabs.has(tab)) {
        textWidths.current.delete(tab);
      }
    }

    for (const tab of tabMeasurements.current.keys()) {
      if (!activeTabs.has(tab)) {
        tabMeasurements.current.delete(tab);
      }
    }

    isUnderlineInitialized.current = false;
    lastScrollRequest.current = "";
  }, [selectedIndex, tabs, tabsKey]);

  useEffect(() => {
    if (selectedIndex < 0) {
      return;
    }

    if (scrollProgress) {
      const metrics = getUnderlineMetrics(selected);

      if (!metrics) {
        return;
      }

      const wasInitialized = isUnderlineInitialized.current;
      underlineX.setValue(metrics.x);
      underlineWidth.setValue(metrics.width);
      isUnderlineInitialized.current = true;
      scrollToTab(selected, wasInitialized);
      return;
    }

    const metrics = getUnderlineMetrics(selected);

    if (!metrics) {
      return;
    }

    underlineX.stopAnimation();
    underlineWidth.stopAnimation();

    if (!isUnderlineInitialized.current) {
      underlineX.setValue(metrics.x);
      underlineWidth.setValue(metrics.width);
      isUnderlineInitialized.current = true;
      scrollToTab(selected, false);
      return;
    }

    Animated.parallel([
      Animated.timing(underlineX, {
        toValue: metrics.x,
        duration: ANIMATION_DURATION,
        easing: ANIMATION_EASING,
        useNativeDriver: false,
      }),
      Animated.timing(underlineWidth, {
        toValue: metrics.width,
        duration: ANIMATION_DURATION,
        easing: ANIMATION_EASING,
        useNativeDriver: false,
      }),
    ]).start();

    scrollToTab(selected, true);

    return () => {
      underlineX.stopAnimation();
      underlineWidth.stopAnimation();
    };
  }, [
    getUnderlineMetrics,
    measuredLayout,
    scrollProgress,
    scrollToTab,
    selected,
    selectedIndex,
    underlineWidth,
    underlineX,
  ]);

  const scrollProgressUnderlineStyle = useMemo(() => {
    if (!scrollProgress || tabs.length === 0) {
      return null;
    }

    if (!measuredLayout || measuredLayout.tabsKey !== tabsKey) {
      return null;
    }

    const measuredMetrics = measuredLayout.metrics;

    if (measuredMetrics.length === 1) {
      return {
        width: measuredMetrics[0].width,
        transform: [{ translateX: measuredMetrics[0].x }],
      };
    }

    const inputRange = measuredMetrics.map((_, index) => index);

    return {
      width: scrollProgress.interpolate({
        inputRange,
        outputRange: measuredMetrics.map(({ width }) => width),
        extrapolate: "clamp",
      }),
      transform: [
        {
          translateX: scrollProgress.interpolate({
            inputRange,
            outputRange: measuredMetrics.map(({ x }) => x),
            extrapolate: "clamp",
          }),
        },
      ],
    };
  }, [measuredLayout, scrollProgress, tabs.length, tabsKey]);

  const underlineColor = isDark ? Colors.white : Colors.black;
  const tabItems = useMemo(
    () =>
      tabs.map((tab) => {
        const isSelected = selected === tab;

        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Switch to ${tab} tab`}
            hitSlop={6}
            onPress={() => onTabPress(tab)}
            onLayout={(event) => handleTabLayout(tab, event)}
            style={styles.tabPressable}
          >
            <View onLayout={(event) => handleTextLayout(tab, event)}>
              {renderLabel ? (
                renderLabel(tab, isSelected)
              ) : (
                <Text style={getDefaultLabelStyle(tab, isSelected, isDark)}>
                  {tab.toUpperCase()}
                </Text>
              )}
            </View>
          </Pressable>
        );
      }),
    [
      styles,
      handleTabLayout,
      handleTextLayout,
      isDark,
      onTabPress,
      renderLabel,
      selected,
      tabs,
    ],
  );

  return (
    <View style={style}>
      <ScrollView
        ref={scrollRef}
        horizontal
        bounces={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        directionalLockEnabled
        onLayout={handleViewportLayout}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.tabs}>
          {tabItems}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.underline,
              scrollProgressUnderlineStyle ?? {
                width: underlineWidth,
                transform: [{ translateX: underlineX }],
              },
              {
                backgroundColor: underlineColor,
              },
            ]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export const MainScrollTabBarStyles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    marginBottom: 10,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    minWidth: "100%",
    position: "relative",
  },
  tabPressable: {
    alignItems: "center",
    paddingBottom: 4,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  underline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 2,
    borderRadius: 100,
  },
});
