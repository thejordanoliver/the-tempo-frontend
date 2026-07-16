// components/Tabs/PillTabs.tsx
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useMemo, useRef, useState } from "react";
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

export type PillTabOption<T extends string = string> = {
  label: string;
  value: T;
};

type TabLayout = {
  x: number;
  width: number;
};

type Props<T extends string = string> = {
  tabs: readonly PillTabOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
  animationDuration?: number;
  scrollable?: boolean;
  minTabWidth?: number;
};

export default function PillTabs<T extends string = string>({
  tabs,
  selectedValue,
  onChange,
  containerStyle,
  contentContainerStyle,
  tabStyle,
  activeTabStyle,
  labelStyle,
  activeLabelStyle,
  animationDuration = 220,
  scrollable,
  minTabWidth = 112,
}: Props<T>) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => pillTabsStyles(isDark), [isDark]);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const hasPlacedIndicator = useRef(false);

  const [containerWidth, setContainerWidth] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});

  const shouldScroll = scrollable ?? tabs.length > 3;

  const selectedTabLayout = useMemo(() => {
    return tabLayouts[String(selectedValue)];
  }, [selectedValue, tabLayouts]);

  useEffect(() => {
    if (!selectedTabLayout) return;

    if (!hasPlacedIndicator.current) {
      translateX.setValue(selectedTabLayout.x);
      animatedWidth.setValue(selectedTabLayout.width);
      hasPlacedIndicator.current = true;
      return;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: selectedTabLayout.x,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(animatedWidth, {
        toValue: selectedTabLayout.width,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [selectedTabLayout, translateX, animatedWidth, animationDuration]);

  useEffect(() => {
    if (!shouldScroll || !selectedTabLayout || containerWidth <= 0) return;

    const centeredX =
      selectedTabLayout.x - containerWidth / 2 + selectedTabLayout.width / 2;

    scrollViewRef.current?.scrollTo({
      x: Math.max(centeredX, 0),
      animated: true,
    });
  }, [containerWidth, selectedTabLayout, shouldScroll]);

  const handleTabLayout = (value: T) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    const key = String(value);

    setTabLayouts((prev) => {
      const current = prev[key];

      if (current?.x === x && current?.width === width) {
        return prev;
      }

      return {
        ...prev,
        [key]: { x, width },
      };
    });
  };

  return (
    <View
      style={[styles.seasonTabsPill, containerStyle]}
      onLayout={(event) => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        bounces={false}
        scrollEnabled={shouldScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          !shouldScroll && styles.scrollContentFull,
          contentContainerStyle,
        ]}
      >
        <View style={[styles.tabsTrack, !shouldScroll && styles.tabsTrackFull]}>
          {selectedTabLayout ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.tabContainerActive,
                {
                  width: animatedWidth,
                  transform: [{ translateX }],
                },
                activeTabStyle,
              ]}
            />
          ) : null}

          {tabs.map((tab) => {
            const active = selectedValue === tab.value;

            return (
              <Pressable
                key={String(tab.value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onLayout={handleTabLayout(tab.value)}
                onPress={() => {
                  if (!active) {
                    onChange(tab.value);
                  }
                }}
                style={({ pressed }) => [
                  styles.tabContainer,
                  shouldScroll
                    ? [styles.scrollableTabContainer, { minWidth: minTabWidth }]
                    : styles.equalTabContainer,
                  pressed && styles.pressed,
                  tabStyle,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    labelStyle,
                    active && styles.tabLabelActive,
                    active && activeLabelStyle,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const pillTabsStyles = (isDark: boolean) =>
  StyleSheet.create({
    seasonTabsPill: {
      position: "relative",
      overflow: "hidden",
      marginTop: 4,
      marginBottom: 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    scrollContent: {
      flexGrow: 1,
    },

    scrollContentFull: {
      width: "100%",
    },

    tabsTrack: {
      position: "relative",
      flexDirection: "row",
      flexGrow: 1,
    },

    tabsTrackFull: {
      width: "100%",
    },

    tabContainer: {
      zIndex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: "transparent",
    },

    equalTabContainer: {
      flex: 1,
      minWidth: 0,
    },

    scrollableTabContainer: {
      flexShrink: 0,
    },

    tabContainerActive: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      borderRadius: 999,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    tabLabel: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    tabLabelActive: {
      color: isDark ? Colors.black : Colors.white,
    },

    pressed: {
      opacity: 0.75,
    },
  });
