import MonthSelectorSkeleton from "@/components/Skeletons/MonthSelectorSkeleton";
import {
  DATE_SELECTOR_ITEM_SPACING,
  DATE_SELECTOR_ITEM_WIDTH,
  DATE_SELECTOR_SIDE_PADDING,
} from "@/constants/dateSelectorConstants";
import { DateSelectorStyles } from "@/styles/LeagueStyles/DateSelectorStyles";
import { activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ScheduleMonthKey, ScheduleMonthOption } from "types/schedule";

type Props = {
  months: ScheduleMonthOption[];
  selected: ScheduleMonthKey | null;
  onSelect: (key: ScheduleMonthKey) => void;
  loading?: boolean;
};

export default function MonthSelector({
  months,
  selected,
  onSelect,
  loading = false,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const scrollRef = useRef<ScrollView>(null);
  const [indicatorX] = useState(() => new Animated.Value(0));

  const [containerWidth, setContainerWidth] = useState(0);

  const itemStep = DATE_SELECTOR_ITEM_WIDTH + DATE_SELECTOR_ITEM_SPACING;

  const rawItemsWidth = useMemo(() => {
    return (
      months.length * DATE_SELECTOR_ITEM_WIDTH +
      DATE_SELECTOR_ITEM_SPACING * Math.max(0, months.length - 1)
    );
  }, [months.length]);

  const needsScroll =
    containerWidth > 0 &&
    rawItemsWidth + DATE_SELECTOR_SIDE_PADDING * 2 > containerWidth;

  const horizontalPadding = needsScroll
    ? DATE_SELECTOR_SIDE_PADDING
    : Math.max(
        (containerWidth - rawItemsWidth) / 2,
        DATE_SELECTOR_SIDE_PADDING,
      );

  const contentWidth = horizontalPadding * 2 + rawItemsWidth;

  const styles = useMemo(
    () => DateSelectorStyles(isDark, { horizontalPadding }),
    [horizontalPadding, isDark],
  );

  const selectedIndex = useMemo(() => {
    if (!selected) return -1;
    return months.findIndex((item) => item.key === selected);
  }, [months, selected]);

  const onLayoutContainer = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const computeScrollOffset = useCallback(
    (index: number) => {
      if (!containerWidth || !months.length || !needsScroll) return 0;

      const targetOffset =
        horizontalPadding +
        index * itemStep -
        containerWidth / 2 +
        DATE_SELECTOR_ITEM_WIDTH / 2;

      const maxOffset = Math.max(0, contentWidth - containerWidth);

      return Math.max(0, Math.min(targetOffset, maxOffset));
    },
    [
      containerWidth,
      months.length,
      needsScroll,
      horizontalPadding,
      itemStep,
      contentWidth,
    ],
  );

  const handleSelectMonth = useCallback(
    (key: ScheduleMonthKey) => {
      onSelect(key);
    },
    [onSelect],
  );

  useEffect(() => {
    if (selectedIndex < 0) return;

    const animation = Animated.spring(indicatorX, {
      toValue: selectedIndex * itemStep,
      useNativeDriver: true,
      tension: 90,
      friction: 12,
    });

    animation.start();
    return () => animation.stop();
  }, [indicatorX, itemStep, selectedIndex]);

  useEffect(() => {
    if (!scrollRef.current || selectedIndex < 0 || !needsScroll) return;

    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: computeScrollOffset(selectedIndex),
        animated: true,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    needsScroll,
    selectedIndex,
    containerWidth,
    horizontalPadding,
    computeScrollOffset,
  ]);

  if (loading && !months.length) {
    return <MonthSelectorSkeleton />;
  }

  if (!months.length) {
    return null;
  }

  return (
    <View style={styles.wrapper} onLayout={onLayoutContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemStep}
        decelerationRate="fast"
        scrollEnabled={needsScroll}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {selectedIndex >= 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slidingSelectedContainer,
              {
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />
        )}

        {months.map(({ key, label, count }, index) => {
          const isSelected = index === selectedIndex;
          const gameLabel = count === 1 ? "Game" : "Games";

          return (
            <TouchableOpacity
              key={key}
              activeOpacity={activeOpacity}
              onPress={() => handleSelectMonth(key)}
              style={styles.item}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${label}, ${count} ${gameLabel}`}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={isSelected ? styles.selectedLabel : styles.label}
              >
                {label}
              </Text>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={isSelected ? styles.selectedDetail : styles.detail}
              >
                {count} {gameLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
