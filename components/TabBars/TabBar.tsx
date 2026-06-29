import { Colors, Fonts } from "constants/styles";
import React, { useCallback, useEffect, useRef } from "react";
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
}: TabBarProps<T>) {
  // Animated values
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  // Measurements
  const textMeasurements = useRef<{ width: number }[]>([]);
  const pressableMeasurements = useRef<{ x: number; width: number }[]>([]);
  const initialized = useRef(false);

  // Smooth spring animation preset
  const animateUnderline = useCallback(
    (index: number) => {
      const textWidth = textMeasurements.current[index]?.width;
      const pressable = pressableMeasurements.current[index];

      if (!textWidth || !pressable) return;

      const x = pressable.x + (pressable.width - textWidth) / 2;

      Animated.parallel([
        Animated.spring(underlineX, {
          ...UNDERLINE_SPRING_CONFIG,
          toValue: x,
        }),
        Animated.spring(underlineWidth, {
          ...UNDERLINE_SPRING_CONFIG,
          toValue: textWidth,
        }),
      ]).start();
    },
    [underlineWidth, underlineX],
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

      // Set values instantly to prevent flicker
      const textWidth = textMeasurements.current[initialIndex].width;
      const pressable = pressableMeasurements.current[initialIndex];
      const x = pressable.x + (pressable.width - textWidth) / 2;

      underlineX.setValue(x);
      underlineWidth.setValue(textWidth);
    }
  };

  // Re-run animation on selected tab change
  useEffect(() => {
    if (!initialized.current) return;
    const index = tabs.indexOf(selected);
    animateUnderline(index);
  }, [animateUnderline, selected, tabs]);

  const defaultLabelStyle = (tab: T, isSelected: boolean): TextStyle => ({
    fontSize: tab.toLowerCase() === "home" ? 20 : 18,
    color: isSelected ? (isDark ? Colors.white : Colors.black) : Colors.midTone,
    fontFamily: Fonts.OSREGULAR,
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
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },
  tabPressable: {
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    borderRadius: 100,
    left: 0,
  },
});
