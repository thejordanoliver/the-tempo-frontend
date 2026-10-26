import {
  DATE_SELECTOR_ITEM_SPACING,
  DATE_SELECTOR_ITEM_WIDTH,
  DATE_SELECTOR_SIDE_PADDING,
} from "constants/dateSelectorConstants";
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
import { DateSelectorStyles } from "styles/LeagueStyles/DateSelectorStyles";

type Props = {
  itemCount?: number;
};

export default function MonthSelectorSkeleton({ itemCount = 5 }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const [pulseAnim] = useState(() => new Animated.Value(1));

  const [containerWidth, setContainerWidth] = useState(0);

  const itemStep = DATE_SELECTOR_ITEM_WIDTH + DATE_SELECTOR_ITEM_SPACING;

  const rawItemsWidth = useMemo(() => {
    return (
      itemCount * DATE_SELECTOR_ITEM_WIDTH +
      DATE_SELECTOR_ITEM_SPACING * Math.max(0, itemCount - 1)
    );
  }, [itemCount]);

  const needsScroll =
    containerWidth > 0 &&
    rawItemsWidth + DATE_SELECTOR_SIDE_PADDING * 2 > containerWidth;

  const horizontalPadding = needsScroll
    ? DATE_SELECTOR_SIDE_PADDING
    : Math.max(
        (containerWidth - rawItemsWidth) / 2,
        DATE_SELECTOR_SIDE_PADDING,
      );

  const styles = useMemo(
    () => DateSelectorStyles(isDark, { horizontalPadding }),
    [horizontalPadding, isDark],
  );

  const placeholderStyles = getPlaceholderStyles(isDark);

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
    <View style={styles.wrapper} onLayout={onLayoutContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemStep}
        decelerationRate="fast"
        scrollEnabled={needsScroll}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {Array.from({ length: itemCount }).map((_, index) => (
          <View key={index} style={styles.item}>
            <SkeletonBlock style={placeholderStyles.monthText} />
            <SkeletonBlock style={placeholderStyles.gameCountText} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getPlaceholderStyles = (isDark: boolean) =>
  StyleSheet.create({
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
