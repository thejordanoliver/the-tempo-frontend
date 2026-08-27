import { Colors, Fonts } from "constants/styles";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

export default function MainScrollTabBar<T extends string>({
  tabs,
  isDark,
  selected,
  onTabPress,
  renderLabel,
  style,
  scrollProgress,
}: TabBarProps<T>) {
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  const textMeasurements = useRef<{ width: number }[]>([]);
  const pressableMeasurements = useRef<{ x: number; width: number }[]>([]);

  const isInitialized = useRef(false);
  const [isMeasured, setIsMeasured] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const getUnderlineMetrics = useCallback((index: number) => {
    const text = textMeasurements.current[index];
    const pressable = pressableMeasurements.current[index];

    if (!text || !pressable) {
      return null;
    }

    return {
      x: pressable.x + (pressable.width - text.width) / 2,
      width: text.width,
    };
  }, []);

  const scrollToActive = useCallback((index: number) => {
    const pressable = pressableMeasurements.current[index];

    if (!pressable) {
      return;
    }

    scrollRef.current?.scrollTo({
      x: Math.max(pressable.x - 50, 0),
      animated: true,
    });
  }, []);

  const setUnderlineProgress = useCallback(
    (progress: number) => {
      const maxIndex = tabs.length - 1;

      if (maxIndex < 0) {
        return;
      }

      const clampedProgress = Math.min(maxIndex, Math.max(0, progress));

      const startIndex = Math.floor(clampedProgress);
      const endIndex = Math.min(maxIndex, startIndex + 1);
      const amount = clampedProgress - startIndex;

      const start = getUnderlineMetrics(startIndex);
      const end = getUnderlineMetrics(endIndex);

      if (!start || !end) {
        return;
      }

      underlineX.setValue(start.x + (end.x - start.x) * amount);

      underlineWidth.setValue(start.width + (end.width - start.width) * amount);
    },
    [getUnderlineMetrics, tabs.length, underlineWidth, underlineX],
  );

  const initializeUnderline = useCallback(() => {
    const index = tabs.indexOf(selected);

    if (index < 0) {
      return;
    }

    const metrics = getUnderlineMetrics(index);

    if (!metrics) {
      return;
    }

    // Initial render should appear immediately,
    // not animate from width 0.
    underlineX.setValue(metrics.x);
    underlineWidth.setValue(metrics.width);

    isInitialized.current = true;
    setIsMeasured(true);

    scrollToActive(index);
  }, [
    getUnderlineMetrics,
    scrollToActive,
    selected,
    tabs,
    underlineWidth,
    underlineX,
  ]);

  const onTextLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;

    textMeasurements.current[index] = { width };

    initializeUnderline();
  };

  const onPressableLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;

    pressableMeasurements.current[index] = {
      x,
      width,
    };

    initializeUnderline();
  };

  // Important:
  // Try initialization again when selected/tabs change.
  // This fixes the missing underline on initial load.
  useEffect(() => {
    initializeUnderline();
  }, [initializeUnderline]);

  useEffect(() => {
    if (!isMeasured || scrollProgress) {
      return;
    }

    const index = tabs.indexOf(selected);

    if (index < 0) {
      return;
    }

    const metrics = getUnderlineMetrics(index);

    if (!metrics) {
      return;
    }

    if (!isInitialized.current) {
      initializeUnderline();
      return;
    }

    Animated.parallel([
      Animated.timing(underlineX, {
        toValue: metrics.x,
        duration: 250,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: false,
      }),

      Animated.timing(underlineWidth, {
        toValue: metrics.width,
        duration: 250,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: false,
      }),
    ]).start();

    scrollToActive(index);
  }, [
    getUnderlineMetrics,
    initializeUnderline,
    isMeasured,
    scrollProgress,
    scrollToActive,
    selected,
    tabs,
    underlineWidth,
    underlineX,
  ]);

  useEffect(() => {
    if (!isMeasured || !scrollProgress) {
      return;
    }

    const listenerId = scrollProgress.addListener(({ value }) => {
      setUnderlineProgress(value);
    });

    return () => {
      scrollProgress.removeListener(listenerId);
    };
  }, [isMeasured, scrollProgress, setUnderlineProgress]);
  useEffect(() => {
    if (!isMeasured) {
      return;
    }

    const index = tabs.indexOf(selected);

    if (index >= 0) {
      scrollToActive(index);
    }
  }, [isMeasured, scrollToActive, selected, tabs]);

  const defaultLabelStyle = (tab: T, isSelected: boolean): TextStyle => ({
    fontSize: tab.toLowerCase() === "home" ? 20 : 18,
    color: isSelected ? (isDark ? Colors.white : Colors.black) : Colors.midTone,
    fontFamily: Fonts.REGULAR,
  });

  return (
    <View style={style}>
      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.tabs}>
          {tabs.map((tab, index) => {
            const isSelected = selected === tab;

            return (
              <Pressable
                key={tab}
                onPress={() => onTabPress(tab)}
                onLayout={onPressableLayout(index)}
                style={styles.tabPressable}
              >
                <View onLayout={onTextLayout(index)}>
                  {renderLabel ? (
                    renderLabel(tab, isSelected)
                  ) : (
                    <Text style={defaultLabelStyle(tab, isSelected)}>
                      {tab.toUpperCase()}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.underline,
              {
                width: underlineWidth,
                transform: [
                  {
                    translateX: underlineX,
                  },
                ],
                backgroundColor: isDark ? Colors.white : Colors.black,
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
    position: "relative",
    minWidth: "100%",
  },

  tabPressable: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },

  underline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 2,
    borderRadius: 100,
  },
});
