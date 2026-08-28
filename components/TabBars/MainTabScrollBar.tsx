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

const ANIMATION_DURATION = 250;
const ANIMATION_EASING = Easing.bezier(0.25, 1, 0.5, 1);

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
  const scrollRef = useRef<ScrollView>(null);
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const textWidths = useRef(new Map<T, number>());
  const tabMeasurements = useRef(new Map<T, TabMeasurement>());
  const isUnderlineInitialized = useRef(false);
  const lastScrollProgress = useRef(tabs.indexOf(selected));
  const previousTabsKey = useRef(tabs.join("\u001f"));
  const [layoutRevision, setLayoutRevision] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

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

  const setUnderlineAtProgress = useCallback(
    (progress: number): boolean => {
      if (!tabs.length) {
        return false;
      }

      const clampedProgress = Math.max(0, Math.min(tabs.length - 1, progress));
      const startIndex = Math.floor(clampedProgress);
      const endIndex = Math.min(startIndex + 1, tabs.length - 1);
      const startMetrics = getUnderlineMetrics(tabs[startIndex]);
      const endMetrics = getUnderlineMetrics(tabs[endIndex]);

      if (!startMetrics || !endMetrics) {
        return false;
      }

      const amount = clampedProgress - startIndex;

      underlineX.setValue(
        startMetrics.x + (endMetrics.x - startMetrics.x) * amount,
      );
      underlineWidth.setValue(
        startMetrics.width + (endMetrics.width - startMetrics.width) * amount,
      );

      isUnderlineInitialized.current = true;
      return true;
    },
    [getUnderlineMetrics, tabs, underlineWidth, underlineX],
  );

  const scrollToTab = useCallback(
    (tab: T, animated: boolean) => {
      const measurement = tabMeasurements.current.get(tab);

      if (!measurement || viewportWidth <= 0) {
        return;
      }

      scrollRef.current?.scrollTo({
        x: Math.max(
          measurement.x + measurement.width / 2 - viewportWidth / 2,
          0,
        ),
        animated,
      });
    },
    [viewportWidth],
  );

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setViewportWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  }, []);

  const handleTextLayout = useCallback((tab: T, event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    if (textWidths.current.get(tab) === nextWidth) {
      return;
    }

    textWidths.current.set(tab, nextWidth);
    setLayoutRevision((revision) => revision + 1);
  }, []);

  const handleTabLayout = useCallback((tab: T, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    const currentMeasurement = tabMeasurements.current.get(tab);

    if (currentMeasurement?.x === x && currentMeasurement.width === width) {
      return;
    }

    tabMeasurements.current.set(tab, { x, width });
    setLayoutRevision((revision) => revision + 1);
  }, []);

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
    lastScrollProgress.current = selectedIndex;
  }, [selectedIndex, tabs, tabsKey]);

  useEffect(() => {
    if (selectedIndex < 0) {
      return;
    }

    if (scrollProgress) {
      const wasInitialized = isUnderlineInitialized.current;
      setUnderlineAtProgress(lastScrollProgress.current);
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
    layoutRevision,
    scrollProgress,
    scrollToTab,
    selected,
    selectedIndex,
    setUnderlineAtProgress,
    underlineWidth,
    underlineX,
    viewportWidth,
  ]);

  useEffect(() => {
    if (!scrollProgress) {
      return;
    }

    const listenerId = scrollProgress.addListener(({ value }) => {
      lastScrollProgress.current = value;
      setUnderlineAtProgress(value);
    });

    return () => {
      scrollProgress.removeListener(listenerId);
    };
  }, [scrollProgress, setUnderlineAtProgress]);

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
        onLayout={handleViewportLayout}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.tabs}>
          {tabItems}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.underline,
              {
                width: underlineWidth,
                backgroundColor: underlineColor,
                transform: [{ translateX: underlineX }],
              },
            ]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
