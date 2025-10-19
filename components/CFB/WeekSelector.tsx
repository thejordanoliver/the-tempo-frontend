import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type CFBWeek = {
  label: string;
  stage: string;
  weekNumber: number;
};

type Props = {
  weeks: CFBWeek[];
  selectedWeekIndex?: number; // make optional
  onSelectWeek: (index: number) => void;
  monthTextStyle: any;
  monthTextSelectedStyle: any;
};

export default function WeekSelector({
  weeks,
  selectedWeekIndex = 0,
  onSelectWeek,
  monthTextStyle,
  monthTextSelectedStyle,
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
  const totalWidth = weeks.length * (itemWidth + spacing) - spacing; // total content width
  const centerOffset =
    index * (itemWidth + spacing) + itemWidth / 2 - containerWidth / 2;

  // if the content is smaller than container, don't scroll
  if (totalWidth <= containerWidth) return 0;

  // allow last item to align to the end
  const maxOffset = totalWidth - containerWidth;
  return Math.max(0, Math.min(centerOffset, maxOffset));
};

  const onLayoutContainer = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // Auto-scroll whenever the container width or selectedWeekIndex changes
  useEffect(() => {
    if (scrollViewRef.current && containerWidth > 0 && weeks.length > 0) {
      const clampedIndex = Math.min(
        Math.max(selectedWeekIndex, 0),
        weeks.length - 1
      );

      const targetX = indexToOffset(
        clampedIndex,
        itemWidth,
        spacing,
        containerWidth
      );

      scrollViewRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [containerWidth, selectedWeekIndex, weeks]);

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
          return (
            <TouchableOpacity
              key={week.label}
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
                {week.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
