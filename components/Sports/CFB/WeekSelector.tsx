import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";

export type CFBWeek = {
  label: string;
  stage: string;
  weekNumber: number;
};

type Props = {
  weeks: CFBWeek[];
  selectedWeekIndex?: number; // optional
  onSelectWeek: (index: number) => void;
  monthTextStyle: TextStyle;
  monthTextSelectedStyle: TextStyle;
  containerStyle?: ViewStyle;
  itemSpacing?: number;
  itemPaddingHorizontal?: number;
};

export default function WeekSelector({
  weeks,
  selectedWeekIndex = 0,
  onSelectWeek,
  monthTextStyle,
  monthTextSelectedStyle,
  containerStyle,
  itemSpacing = 8,
  itemPaddingHorizontal = 8,
}: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemLayouts, setItemLayouts] = useState<number[]>(
    Array(weeks.length).fill(0)
  );

  // Handle container layout
  const onLayoutContainer = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // Handle individual item layout (for dynamic width)
  const onItemLayout = (index: number, width: number) => {
    setItemLayouts((prev) => {
      const updated = [...prev];
      updated[index] = width;
      return updated;
    });
  };

  // Compute scroll offset to fully show selected item
  const computeScrollOffset = (index: number) => {
    if (!containerWidth || itemLayouts.length !== weeks.length) return 0;

    const totalWidth =
      itemLayouts.reduce((sum, w) => sum + w, 0) + itemSpacing * (weeks.length - 1);

    // Sum widths of previous items + spacing
    const offsetBefore = itemLayouts
      .slice(0, index)
      .reduce((sum, w) => sum + w, 0);
    const spacingBefore = itemSpacing * index;

    const targetOffset = offsetBefore + spacingBefore + itemLayouts[index] / 2 - containerWidth / 2;

    // Clamp to scrollable area
    const maxOffset = Math.max(0, totalWidth - containerWidth);
    return Math.max(0, Math.min(targetOffset, maxOffset));
  };

  // Auto-scroll when selectedWeekIndex or layout changes
  useEffect(() => {
    if (
      scrollViewRef.current &&
      containerWidth > 0 &&
      itemLayouts.length === weeks.length
    ) {
      const targetX = computeScrollOffset(selectedWeekIndex);
      scrollViewRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [selectedWeekIndex, containerWidth, itemLayouts, weeks]);

  return (
    <View
      style={[{ flexDirection: "row", marginVertical: 8 }, containerStyle]}
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
              onLayout={(e) => onItemLayout(index, e.nativeEvent.layout.width)}
              style={{
                marginRight: index === weeks.length - 1 ? 0 : itemSpacing,
                paddingVertical: 6,
                paddingHorizontal: itemPaddingHorizontal,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={isSelected ? monthTextSelectedStyle : monthTextStyle}>
                {week.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
