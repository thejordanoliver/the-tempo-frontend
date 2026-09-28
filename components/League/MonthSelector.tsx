import { Colors, Fonts, activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ScheduleMonthKey,
  ScheduleMonthOption,
} from "types/schedule";
import {
  Animated,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MonthSelectorSkeleton from "../Skeletons/MonthSelectorSkeleton";
import {
  MONTH_SELECTOR_ITEM_HEIGHT,
  MONTH_SELECTOR_ITEM_SPACING,
  MONTH_SELECTOR_ITEM_WIDTH,
  MONTH_SELECTOR_SIDE_PADDING,
} from "./monthSelectorConstants";

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

  const itemStep = MONTH_SELECTOR_ITEM_WIDTH + MONTH_SELECTOR_ITEM_SPACING;

  const rawItemsWidth = useMemo(() => {
    return (
      months.length * MONTH_SELECTOR_ITEM_WIDTH +
      MONTH_SELECTOR_ITEM_SPACING * Math.max(0, months.length - 1)
    );
  }, [months.length]);

  const needsScroll =
    containerWidth > 0 &&
    rawItemsWidth + MONTH_SELECTOR_SIDE_PADDING * 2 > containerWidth;

  const horizontalPadding = needsScroll
    ? MONTH_SELECTOR_SIDE_PADDING
    : Math.max(
        (containerWidth - rawItemsWidth) / 2,
        MONTH_SELECTOR_SIDE_PADDING,
      );

  const contentWidth = horizontalPadding * 2 + rawItemsWidth;

  const styles = useMemo(
    () => monthSelectorStyles(isDark, horizontalPadding),
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
        MONTH_SELECTOR_ITEM_WIDTH / 2;

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
    <View style={styles.monthSelector} onLayout={onLayoutContainer}>
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

        {months.map(
          ({ key, label, count }, index) => {
            const isSelected = index === selectedIndex;
            const gameLabel = count === 1 ? "Game" : "Games";

            return (
              <TouchableOpacity
                key={key}
                activeOpacity={activeOpacity}
                onPress={() => handleSelectMonth(key)}
                style={styles.monthButton}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${label}, ${count} ${gameLabel}`}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={
                    isSelected ? styles.monthTextSelected : styles.monthText
                  }
                >
                  {label}
                </Text>

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={
                    isSelected
                      ? styles.gameCountTextSelected
                      : styles.gameCountText
                  }
                >
                  {count} {gameLabel}
                </Text>
              </TouchableOpacity>
            );
          },
        )}
      </ScrollView>
    </View>
  );
}

export const monthSelectorStyles = (
  isDark: boolean,
  horizontalPadding: number,
) =>
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
    slidingSelectedContainer: {
      position: "absolute",
      top: 0,
      left: horizontalPadding,
      width: MONTH_SELECTOR_ITEM_WIDTH,
      height: MONTH_SELECTOR_ITEM_HEIGHT,
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      overflow: "hidden",
    },
    monthButton: {
      zIndex: 2,
      alignItems: "center",
      justifyContent: "center",
      width: MONTH_SELECTOR_ITEM_WIDTH,
      height: MONTH_SELECTOR_ITEM_HEIGHT,
      padding: 4,
      borderRadius: 12,
    },
    monthText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 18,
      color: Colors.midTone,
      textAlign: "center",
    },
    monthTextSelected: {
      fontFamily: Fonts.BOLD,
      fontSize: 18,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    gameCountText: {
      marginTop: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: Colors.midTone,
      textAlign: "center",
    },
    gameCountTextSelected: {
      marginTop: 1,
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
  });
