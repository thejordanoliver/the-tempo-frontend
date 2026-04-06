import { Colors } from "constants/styles";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { fixedWidthTabBarStyles } from "styles/TabBarStyles/FixedWidthTabBarStyles";

export interface FixedWidthTabBarProps {
  tabs: readonly string[];
  selected: string;
  onTabPress: (tab: string) => void;
  renderLabel?: (
    tab: string,
    isSelected: boolean,
    defaultStyles: {
      tab: any;
      tabSelected: any;
    },
  ) => React.ReactNode;
  isDark: boolean;
}

export default function FixedWidthTabBar({
  tabs,
  selected,
  onTabPress,
  renderLabel,
  isDark,
}: FixedWidthTabBarProps) {
  const underlineX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const styles = fixedWidthTabBarStyles(isDark);

  // ✅ Memoized tabs (prevents unnecessary re-renders)
  const orderedTabs = useMemo(() => {
    return (tabs ?? []).filter(
      (t): t is string => typeof t === "string" && t.trim().length > 0,
    );
  }, [tabs]);

  const tabWidth = containerWidth / (orderedTabs.length || 1);

  // ✅ Smooth + safe animation
  useEffect(() => {
    if (!tabWidth) return;

    const index = orderedTabs.indexOf(selected);
    if (index >= 0) {
      Animated.timing(underlineX, {
        toValue: index * tabWidth,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selected, tabWidth, orderedTabs]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View onLayout={handleLayout} style={styles.tabContainer}>
      <View style={styles.tabs}>
        {orderedTabs.map((tab) => {
          const isSelected = selected === tab;

          return (
            <Pressable
              key={tab}
              onPress={() => onTabPress(tab)}
              style={[
                styles.tabPressable,
                { width: tabWidth }, // ✅ precise width (no % issues)
              ]}
            >
              {renderLabel ? (
                renderLabel(tab, isSelected, {
                  tab: styles.tab,
                  tabSelected: styles.tabSelected,
                })
              ) : (
                <Text style={[styles.tab, isSelected && styles.tabSelected]}>
                  {tab.toUpperCase()}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {containerWidth > 0 && orderedTabs.length > 0 && (
        <Animated.View
          style={[
            styles.underline,
            {
              width: tabWidth,
              backgroundColor: isDark ? Colors.white : Colors.black,
              transform: [{ translateX: underlineX }],
            },
          ]}
        />
      )}
    </View>
  );
}
