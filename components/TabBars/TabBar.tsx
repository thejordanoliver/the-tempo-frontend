import { Colors, Fonts } from "constants/styles";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
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
  isDark: boolean;
  scrollProgress?: Animated.Value;
}

const UNDERLINE_SPRING_CONFIG = {
  stiffness: 220,
  damping: 24,
  mass: 0.6,
  useNativeDriver: false,
};

export default function TabBar<T extends string>({
  tabs,
  selected,
  onTabPress,
  renderLabel,
  style,
  isDark,
  scrollProgress,
}: TabBarProps<T>) {
  // Animated values
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  // Measurements
  const textMeasurements = useRef<{ width: number }[]>([]);
  const pressableMeasurements = useRef<{ x: number; width: number }[]>([]);
  const initialized = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const getUnderlineMetrics = useCallback((index: number) => {
    const textWidth = textMeasurements.current[index]?.width;
    const pressable = pressableMeasurements.current[index];

    if (!textWidth || !pressable) {
      return null;
    }

    return {
      x: pressable.x + (pressable.width - textWidth) / 2,
      width: textWidth,
    };
  }, []);

  const setUnderlineProgress = useCallback(
    (progress: number) => {
      const maxIndex = tabs.length - 1;
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

  // Smooth spring animation preset
  const animateUnderline = useCallback(
    (index: number) => {
      const metrics = getUnderlineMetrics(index);

      if (!metrics) return;

      Animated.parallel([
        Animated.spring(underlineX, {
          ...UNDERLINE_SPRING_CONFIG,
          toValue: metrics.x,
        }),
        Animated.spring(underlineWidth, {
          ...UNDERLINE_SPRING_CONFIG,
          toValue: metrics.width,
        }),
      ]).start();
    },
    [getUnderlineMetrics, underlineWidth, underlineX],
  );

  const onTextLayout = (index: number) => (event: LayoutChangeEvent) => {
    textMeasurements.current[index] = {
      width: event.nativeEvent.layout.width,
    };
    checkInitialization();
  };

  const onPressableLayout = (index: number) => (event: LayoutChangeEvent) => {
    pressableMeasurements.current[index] = {
      x: event.nativeEvent.layout.x,
      width: event.nativeEvent.layout.width,
    };
    checkInitialization();
  };

  const checkInitialization = () => {
    if (initialized.current) return;

    if (
      textMeasurements.current.length === tabs.length &&
      pressableMeasurements.current.length === tabs.length &&
      textMeasurements.current.every(Boolean) &&
      pressableMeasurements.current.every(Boolean)
    ) {
      initialized.current = true;
      const initialIndex = tabs.indexOf(selected);
      setUnderlineProgress(initialIndex);
      setIsInitialized(true);
    }
  };

  // Re-run animation on selected tab change
  useEffect(() => {
    if (!isInitialized || scrollProgress) return;
    const index = tabs.indexOf(selected);
    animateUnderline(index);
  }, [animateUnderline, isInitialized, scrollProgress, selected, tabs]);

  useEffect(() => {
    if (!isInitialized || !scrollProgress) return;

    const listenerId = scrollProgress.addListener(({ value }) => {
      setUnderlineProgress(value);
    });

    return () => {
      scrollProgress.removeListener(listenerId);
    };
  }, [isInitialized, scrollProgress, setUnderlineProgress]);

  const defaultLabelStyle = (tab: T, isSelected: boolean): TextStyle => ({
    fontSize: tab.toLowerCase() === "home" ? 20 : 18,
    color: isSelected ? (isDark ? Colors.white : Colors.black) : Colors.midTone,
    fontFamily: Fonts.REGULAR,
  });

  return (
    <View style={[styles.tabs, style]}>
      {tabs.map((tab, index) => {
        const isSelected = selected === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onTabPress(tab)}
            onLayout={onPressableLayout(index)}
            style={styles.tabPressable}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Switch to ${tab} tab`}
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

      {/* Underline */}
      <Animated.View
        style={[
          styles.underline,
          {
            transform: [{ translateX: underlineX }],
            width: underlineWidth,
            backgroundColor: isDark ? Colors.white : Colors.black,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
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
