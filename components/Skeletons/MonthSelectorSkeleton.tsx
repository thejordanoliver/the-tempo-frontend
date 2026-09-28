import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  MONTH_SELECTOR_ITEM_HEIGHT,
  MONTH_SELECTOR_ITEM_SPACING,
  MONTH_SELECTOR_ITEM_WIDTH,
  MONTH_SELECTOR_SIDE_PADDING,
} from "../League/monthSelectorConstants";

type Props = {
  itemCount?: number;
};

export default function MonthSelectorSkeleton({ itemCount = 5 }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const [pulseAnim] = useState(() => new Animated.Value(1));

  const [containerWidth, setContainerWidth] = useState(0);

  const itemStep = MONTH_SELECTOR_ITEM_WIDTH + MONTH_SELECTOR_ITEM_SPACING;

  const rawItemsWidth = useMemo(() => {
    return (
      itemCount * MONTH_SELECTOR_ITEM_WIDTH +
      MONTH_SELECTOR_ITEM_SPACING * Math.max(0, itemCount - 1)
    );
  }, [itemCount]);

  const needsScroll =
    containerWidth > 0 &&
    rawItemsWidth + MONTH_SELECTOR_SIDE_PADDING * 2 > containerWidth;

  const horizontalPadding = needsScroll
    ? MONTH_SELECTOR_SIDE_PADDING
    : Math.max(
        (containerWidth - rawItemsWidth) / 2,
        MONTH_SELECTOR_SIDE_PADDING,
      );

  const styles = useMemo(
    () => getStyles(isDark, horizontalPadding),
    [horizontalPadding, isDark],
  );

  const onLayoutContainer = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    const animation = Animated.loop(
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
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  const SkeletonBlock = ({ style }: { style: object }) => (
    <Animated.View style={[style, { opacity: pulseAnim }]} />
  );

  return (
    <View style={styles.monthSelector} onLayout={onLayoutContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemStep}
        decelerationRate="fast"
        scrollEnabled={needsScroll}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {Array.from({ length: itemCount }).map((_, index) => (
          <View key={index} style={styles.monthButton}>
            <SkeletonBlock style={styles.monthText} />
            <SkeletonBlock style={styles.gameCountText} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean, horizontalPadding: number) =>
  StyleSheet.create({
    monthSelector: {
      flexDirection: "row",
      marginVertical: 8,
    },
    contentContainerStyle: {
      position: "relative",
      alignItems: "center",
      paddingHorizontal: horizontalPadding,
    },
    monthButton: {
      alignItems: "center",
      justifyContent: "center",
      width: MONTH_SELECTOR_ITEM_WIDTH,
      height: MONTH_SELECTOR_ITEM_HEIGHT,
      padding: 4,
      borderRadius: 12,
    },
    monthText: {
      width: 38,
      height: 17,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    gameCountText: {
      width: 52,
      height: 10,
      marginTop: 4,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
  });
