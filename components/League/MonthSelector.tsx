import { Colors, Fonts, activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MonthSelectorSkeleton from "../Skeletons/MonthSelectorSkeleton";

type MonthItem = {
  key?: string;
  month: number;
  year: number;
  label?: string;
  count?: number;
};

type Props = {
  months: MonthItem[];
  selectedDate: Date | null;
  onSelect: (month: number, year: number, index: number) => void;
  loading?: boolean;
  gameCountByMonth: Map<string, number>;
};

const ITEM_WIDTH = 70;
const ITEM_HEIGHT = 44;
const SIDE_PADDING = 12;
const ITEM_SPACING = 0;

export default function MonthSelector({
  months,
  selectedDate,
  onSelect,
  loading = false,
  gameCountByMonth,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const scrollRef = useRef<ScrollView>(null);
  const indicatorX = useRef(new Animated.Value(0)).current;

  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get("window").width,
  );

  const itemStep = ITEM_WIDTH + ITEM_SPACING;

  const rawItemsWidth = useMemo(() => {
    return (
      months.length * ITEM_WIDTH + ITEM_SPACING * Math.max(0, months.length - 1)
    );
  }, [months.length]);

  const needsScroll = rawItemsWidth + SIDE_PADDING * 2 > containerWidth;

  const horizontalPadding = needsScroll
    ? SIDE_PADDING
    : Math.max((containerWidth - rawItemsWidth) / 2, SIDE_PADDING);

  const contentWidth = horizontalPadding * 2 + rawItemsWidth;

  const styles = monthSelectorStyles(isDark, horizontalPadding);

  const selectedIndex = useMemo(() => {
    if (!selectedDate || !months.length) return 0;

    const index = months.findIndex(
      (item) =>
        item.month === selectedDate.getMonth() &&
        item.year === selectedDate.getFullYear(),
    );

    return index === -1 ? 0 : index;
  }, [months, selectedDate]);

  const safeSelectedIndex = useMemo(() => {
    if (!months.length) return 0;
    return Math.min(Math.max(selectedIndex, 0), months.length - 1);
  }, [months.length, selectedIndex]);

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
        ITEM_WIDTH / 2;

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
    (month: number, year: number, index: number) => {
      onSelect(month, year, index);

      scrollRef.current?.scrollTo({
        x: computeScrollOffset(index),
        animated: true,
      });
    },
    [computeScrollOffset, onSelect],
  );

  useEffect(() => {
    if (!months.length) return;

    Animated.spring(indicatorX, {
      toValue: safeSelectedIndex * itemStep,
      useNativeDriver: true,
      tension: 90,
      friction: 12,
    }).start();
  }, [indicatorX, itemStep, months.length, safeSelectedIndex]);

  useEffect(() => {
    if (!scrollRef.current || !months.length || !needsScroll) return;

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: computeScrollOffset(safeSelectedIndex),
        animated: true,
      });
    });
  }, [
    months.length,
    needsScroll,
    safeSelectedIndex,
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
        contentContainerStyle={styles.contentContainerStyle}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slidingSelectedContainer,
            {
              transform: [{ translateX: indicatorX }],
            },
          ]}
        />

        {months.map(
          ({ key: monthKey, month, year, count: monthCount }, index) => {
            const isSelected = index === safeSelectedIndex;

            const key =
              monthKey ?? `${year}-${String(month + 1).padStart(2, "0")}`;

            const count = monthCount ?? gameCountByMonth.get(key) ?? 0;

            const label = new Date(year, month, 1).toLocaleString("en-US", {
              month: "short",
            });

            return (
              <TouchableOpacity
                key={key}
                activeOpacity={activeOpacity}
                onPress={() => handleSelectMonth(month, year, index)}
                style={styles.monthButton}
              >
                <Text
                  numberOfLines={1}
                  style={
                    isSelected ? styles.monthTextSelected : styles.monthText
                  }
                >
                  {label}
                </Text>

                <Text
                  numberOfLines={1}
                  style={
                    isSelected
                      ? styles.gameCountTextSelected
                      : styles.gameCountText
                  }
                >
                  {count} Games
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
      paddingHorizontal: horizontalPadding,
      alignItems: "center",
    },
    slidingSelectedContainer: {
      position: "absolute",
      left: horizontalPadding,
      top: 0,
      width: ITEM_WIDTH,
      height: ITEM_HEIGHT,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    monthButton: {
      width: ITEM_WIDTH,
      height: ITEM_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
      padding: 4,
      borderRadius: 12,
      zIndex: 2,
    },
    monthText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 18,
      color: Colors.midTone,
      textAlign: "center",
    },
    monthTextSelected: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    gameCountText: {
      marginTop: 1,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 11,
      color: Colors.midTone,
      textAlign: "center",
    },
    gameCountTextSelected: {
      marginTop: 1,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 11,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
  });
