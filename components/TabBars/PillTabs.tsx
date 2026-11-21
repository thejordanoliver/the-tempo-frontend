// components/Tabs/PillTabs.tsx
import { useReducedMotion } from "hooks/useReducedMotion";
import { Colors, Fonts, MIN_TOUCH_TARGET } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  type ScrollViewInstance,
} from "react-native";
import Animated from "react-native-reanimated";

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
  disabled?: boolean;
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
  animationDuration = 260,
  scrollable,
  minTabWidth = 112,
  disabled = false,
}: Props<T>) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const reduceMotion = useReducedMotion();
  const styles = useMemo(() => pillTabsStyles(isDark), [isDark]);

  const scrollViewRef = useRef<ScrollViewInstance | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});

  const shouldScroll = scrollable ?? tabs.length > 3;

  const selectedTabLayout = tabLayouts[String(selectedValue)];
  const transition = {
    transitionDuration: reduceMotion ? 0 : animationDuration,
    transitionTimingFunction: "ease-in-out",
  } as const;

  useEffect(() => {
    if (!shouldScroll || !selectedTabLayout || containerWidth <= 0) return;

    const centeredX =
      selectedTabLayout.x - containerWidth / 2 + selectedTabLayout.width / 2;

    scrollViewRef.current?.scrollTo({
      x: Math.max(centeredX, 0),
      animated: !reduceMotion,
    });
  }, [containerWidth, selectedTabLayout, shouldScroll, reduceMotion]);

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
      style={[
        styles.seasonTabsPill,
        disabled && { opacity: 0.5 },
        containerStyle,
      ]}
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
        <View
          accessibilityRole="tablist"
          style={[styles.tabsTrack, !shouldScroll && styles.tabsTrackFull]}
        >
          {selectedTabLayout ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.tabContainerActive,
                {
                  width: selectedTabLayout.width,
                  transform: [{ translateX: selectedTabLayout.x }],
                  transitionProperty: ["transform", "width"],
                  ...transition,
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
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: active, disabled }}
                disabled={disabled}
                aria-selected={active}
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
                <Animated.Text
                  style={[
                    styles.tabLabel,
                    labelStyle,
                    active && styles.tabLabelActive,
                    active && activeLabelStyle,
                    { transitionProperty: "color", ...transition },
                  ]}
                >
                  {tab.label}
                </Animated.Text>
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
      marginTop: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark
        ? Colors.transparentDarkGray
        : Colors.transparentLightGray,
      borderRadius: 999,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },

    scrollContent: {
      flexGrow: 1,
    },

    scrollContentFull: {
      width: "100%",
    },

    tabsTrack: {
      position: "relative",
      flexGrow: 1,
      flexDirection: "row",
    },

    tabsTrackFull: {
      width: "100%",
    },

    tabContainer: {
      minHeight: MIN_TOUCH_TARGET,
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
      textAlign: "center",
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.white : Colors.black,
    },

    tabLabelActive: {
      color: isDark ? Colors.black : Colors.white,
    },

    pressed: {
      opacity: 0.75,
    },
  });
