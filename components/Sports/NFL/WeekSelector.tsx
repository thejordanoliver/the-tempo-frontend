// components/WeekSelector.tsx
import WeekSelectorSkeleton from "components/Skeletons/WeekSelectorSkeleton";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type NFLWeek = {
  label: string; // "Hall of Fame Weekend", "Pre Week 1", "Week 1"
  stage: string; // "Pre Season", "Regular Season", "Post Season"
};

type Props = {
  weeks: NFLWeek[];
  selectedWeekIndex?: number;
  onSelectWeek: (index: number) => void;
  monthTextStyle: any;
  monthTextSelectedStyle: any;
  loading?: boolean;
};

export default function WeekSelector({
  weeks,
  selectedWeekIndex = 0,
  onSelectWeek,
  monthTextStyle,
  monthTextSelectedStyle,
  loading,
}: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const itemWidth = 60; // width of each week button
  const spacing = 8; // space between buttons

  const indexToOffset = (
    index: number,
    itemWidth: number,
    spacing: number,
    containerWidth: number
  ) => {
    const centerOffset =
      index * (itemWidth + spacing) + itemWidth / 2 - containerWidth / 2;

    const contentWidth =
      weeks.length * itemWidth + (weeks.length - 1) * spacing;
    const maxOffset = Math.max(0, contentWidth - containerWidth);

    return Math.max(0, Math.min(centerOffset, maxOffset));
  };

  const onLayoutContainer = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // 🔥 Auto-scroll to closest week on mount
  useEffect(() => {
    if (scrollViewRef.current && containerWidth > 0 && weeks.length > 0) {
      const closestIndex = Math.min(
        Math.max(selectedWeekIndex, 0),
        weeks.length - 1
      );

      const targetX = indexToOffset(
        closestIndex,
        itemWidth,
        spacing,
        containerWidth
      );

      scrollViewRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [containerWidth, weeks, selectedWeekIndex]);

  if (loading) return <WeekSelectorSkeleton />;

  return (
    <View
      style={{ flexDirection: "row", marginVertical: 8 }}
      onLayout={onLayoutContainer}
    >
      <ScrollView
        horizontal
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {weeks.map((week, index) => {
          const isSelected = index === selectedWeekIndex;
          const weekLabel =
            week.label === "Hall of Fame Weekend" ? "HOF Weekend" : week.label;
          return (
            <TouchableOpacity
              key={`${week.stage}-${week.label}`}
              onPress={() => onSelectWeek(index)}
              style={{
                marginRight: spacing,
                paddingVertical: 6,
                paddingHorizontal: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={isSelected ? monthTextSelectedStyle : monthTextStyle}
              >
                {weekLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
