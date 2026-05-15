// components/Skeletons/WeekSelectorSkeleton.tsx
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

const FOOTBALL_ITEM_WIDTH = 100;
const MMA_ITEM_WIDTH = 132;
const SPACING = 12;

type Props = {
  itemCount?: number;
  mode?: "football" | "mma";
};

export default function WeekSelectorSkeleton({
  itemCount = 10,
  mode = "football",
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const isMMA = mode === "mma";
  const itemWidth = isMMA ? MMA_ITEM_WIDTH : FOOTBALL_ITEM_WIDTH;

  const styles = getStyles(isDark, itemWidth, isMMA);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {Array.from({ length: itemCount }).map((_, i) => (
          <Animated.View
            key={i}
            style={[styles.item, { opacity: pulseAnim }]}
          >
            {/* Primary label bar */}
            <View style={styles.primaryBar} />
            {/* Secondary label bar — only for MMA */}
            {isMMA && <View style={styles.secondaryBar} />}
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean, itemWidth: number, isMMA: boolean) => {
  const barColor = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    wrapper: {
      marginVertical: 8,
    },
    contentContainerStyle: {
      paddingHorizontal: SPACING,
      alignItems: "center",
      gap: SPACING,
    },
    item: {
      width: itemWidth,
      paddingVertical: isMMA ? 8 : 6,
      paddingHorizontal: 10,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },
    primaryBar: {
      width: "70%",
      height: 14,
      borderRadius: 6,
      backgroundColor: barColor,
    },
    secondaryBar: {
      width: "55%",
      height: 10,
      borderRadius: 5,
      backgroundColor: barColor,
      opacity: 0.6,
    },
  });
};