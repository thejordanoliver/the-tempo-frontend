import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

const SIDE_PADDING = 12;

export type SelectorSkeletonProps = {
  itemCount?: number;
  itemWidth?: number;
  itemHeight?: number;
  selectedIndex?: number;
};

export default function SelectorSkeleton({ itemCount = 10, itemWidth = 100, itemHeight = 32, selectedIndex = 0 }: SelectorSkeletonProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const safeItemCount = Math.max(0, itemCount);
  const selectedSkeletonIndex = safeItemCount === 0 ? 0 : Math.min(Math.max(selectedIndex, 0), safeItemCount - 1);
  const styles = getStyles({ isDark, itemWidth, itemHeight });

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false} snapToInterval={itemWidth} decelerationRate="fast" contentContainerStyle={styles.contentContainerStyle}>
        {safeItemCount > 0 && <View pointerEvents="none" style={[styles.slidingSelectedContainer, { left: SIDE_PADDING + selectedSkeletonIndex * itemWidth }]} />}
        {Array.from({ length: safeItemCount }).map((_, index) => (
          <View key={index} style={styles.label}>
            <Animated.View style={[styles.innerBar, { opacity: pulseAnim, width: index === selectedSkeletonIndex ? "72%" : "60%" }]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = ({ isDark, itemWidth, itemHeight }: { isDark: boolean; itemWidth: number; itemHeight: number }) => StyleSheet.create({
  wrapper: { marginVertical: 8 },
  contentContainerStyle: { position: "relative", paddingHorizontal: SIDE_PADDING, alignItems: "center" },
  slidingSelectedContainer: { position: "absolute", top: 0, width: itemWidth, height: itemHeight, borderRadius: 12, backgroundColor: isDark ? Colors.dark.itemBackground : Colors.light.itemBackground, borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? Colors.white : Colors.black },
  label: { width: itemWidth, height: itemHeight, justifyContent: "center", alignItems: "center", padding: 4, borderRadius: 12, zIndex: 2 },
  innerBar: { height: 13, borderRadius: 7, backgroundColor: isDark ? Colors.darkGray : Colors.lightGray },
});
