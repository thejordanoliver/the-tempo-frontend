import { Colors, Fonts } from "constants/styles";
import React, { useEffect, useRef } from "react";
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
}

export default function MainScrollTabBar<T extends string>({
  tabs,
  isDark,
  selected,
  onTabPress,
  renderLabel,
  style,
}: TabBarProps<T>) {
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const textMeasurements = useRef<{ width: number }[]>([]);
  const pressableMeasurements = useRef<{ x: number; width: number }[]>([]);
  const isInitialized = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const onTextLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    textMeasurements.current[index] = { width };
    maybeInitializeUnderline();
  };

  const onPressableLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    pressableMeasurements.current[index] = { x, width };
    maybeInitializeUnderline();
  };

  const maybeInitializeUnderline = () => {
    const index = tabs.indexOf(selected);
    if (index === -1) return;

    const text = textMeasurements.current[index];
    const pressable = pressableMeasurements.current[index];

    if (!text || !pressable || isInitialized.current) return;

    const initialX = calculateUnderlineX(index);
    underlineX.setValue(initialX);
    underlineWidth.setValue(text.width);

    isInitialized.current = true;
    scrollToActive(index);
  };

  const calculateUnderlineX = (index: number) => {
    const text = textMeasurements.current[index];
    const pressable = pressableMeasurements.current[index];

    if (!text || !pressable) {
      return 0; // safe fallback
    }

    return pressable.x + (pressable.width - text.width) / 2;
  };

  const scrollToActive = (index: number) => {
    const pressable = pressableMeasurements.current[index];
    if (!pressable) return;

    scrollRef.current?.scrollTo({
      x: Math.max(pressable.x - 50, 0),
      animated: true,
    });
  };

  useEffect(() => {
    const index = tabs.indexOf(selected);
    const textMeasurement = textMeasurements.current[index];
    const pressableMeasurement = pressableMeasurements.current[index];

    if (textMeasurement && pressableMeasurement) {
      const x = calculateUnderlineX(index);

      Animated.parallel([
        Animated.timing(underlineX, {
          toValue: x,
          duration: 250,
          easing: Easing.bezier(0.25, 1, 0.5, 1),
          useNativeDriver: false,
        }),
        Animated.timing(underlineWidth, {
          toValue: textMeasurement.width,
          duration: 250,
          easing: Easing.bezier(0.25, 1, 0.5, 1),
          useNativeDriver: false,
        }),
      ]).start();

      scrollToActive(index);
    }
  }, [selected, tabs, underlineWidth, underlineX]);

  const defaultLabelStyle = (tab: T, isSelected: boolean): TextStyle => ({
    fontSize: tab.toLowerCase() === "home" ? 20 : 18,
    color: isSelected ? (isDark ? Colors.white : Colors.black) : Colors.midTone,
    fontFamily: Fonts.OSREGULAR,
  });

  const underlineStyle: ViewStyle = {
    width: underlineWidth,
    transform: [{ translateX: underlineX }],
    height: 2,
    borderRadius: 100,
    backgroundColor: isDark
      ? Colors.white
      : isDark
        ? Colors.white
        : Colors.black,
    position: "absolute",
    bottom: 0,
    left: 0,
  };

  return (
    <View style={style}>
      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={[styles.tabs]}>
          {tabs.map((tab, i) => {
            const isSelected = selected === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => onTabPress(tab)}
                onLayout={onPressableLayout(i)}
                style={styles.tabPressable}
              >
                <View onLayout={onTextLayout(i)}>
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
          <Animated.View style={underlineStyle} />
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
    minWidth: "100%", // ⭐ MAKES CENTERING WORK
  },

  tabPressable: {
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 16,
    alignItems: "center",
  },
});
