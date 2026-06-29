import { Colors } from "constants/styles";
import React, { useEffect, useRef, useState } from "react";
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
  useColorScheme,
} from "react-native";

export interface FixedWidthTabBarProps<T extends string> {
  tabs: readonly T[];
  selected: T;
  onTabPress: (tab: T) => void;
  renderLabel?: (tab: T, isSelected: boolean) => React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  tabWidth?: number;
}

export default function GameLeadersTabBar<T extends string>({
  tabs,
  selected,
  onTabPress,
  renderLabel,
  tabWidth: fixedTabWidth,
  containerStyle,
}: FixedWidthTabBarProps<T>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const underlineX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const styles = gameLeadersTabBarStyles(isDark);

  const safeTabCount = tabs.length || 1;
  const tabWidth = fixedTabWidth ?? containerWidth / safeTabCount;
  const totalWidth = tabWidth * tabs.length;

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setContainerWidth(width);
  };

  useEffect(() => {
    const selectedIndex = tabs.indexOf(selected);
    const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;

    Animated.timing(underlineX, {
      toValue: safeIndex * tabWidth,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected, tabWidth, tabs, underlineX]);

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.tabs,
        { width: fixedTabWidth ? totalWidth : "100%" },
        containerStyle,
      ]}
    >
      {tabs.map((tab) => {
        const isSelected = selected === tab;

        return (
          <Pressable
            key={tab}
            onPress={() => onTabPress(tab)}
            style={[styles.tabPressable, { width: tabWidth }]}
          >
            {renderLabel ? (
              renderLabel(tab, isSelected)
            ) : (
              <Text style={defaultLabelStyle(isSelected, isDark)}>
                {tab.toUpperCase()}
              </Text>
            )}
          </Pressable>
        );
      })}

      <Animated.View
        style={[
          styles.underline,
          {
            width: tabWidth,
            transform: [{ translateX: underlineX }],
          },
        ]}
      />
    </View>
  );
}

const gameLeadersTabBarStyles = (isDark: boolean) => {
  return StyleSheet.create({
    tabs: {
      flexDirection: "row",
      position: "relative",
      marginBottom: 10,
      alignSelf: "center",
    },
    tabPressable: {
      alignItems: "center",
      paddingVertical: 10,
    },
    underline: {
      height: 2,
      backgroundColor: isDark ? Colors.white : Colors.black,
      position: "absolute",
      bottom: 0,
      left: 0,
      borderRadius: 50,
    },
  });
};

const defaultLabelStyle = (
  isSelected: boolean,
  isDark: boolean,
): StyleProp<TextStyle> => ({
  color: isSelected
    ? isDark
      ? Colors.white
      : Colors.black
    : isDark
      ? Colors.lightGray
      : Colors.darkGray,
  fontSize: 13,
  fontWeight: isSelected ? "700" : "500",
});