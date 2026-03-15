import WeekSelectorSkeleton from "components/Skeletons/WeekSelectorSkeleton";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MMAEvent } from "types/mma";

type Props = {
  events: MMAEvent[];
  selectedEventIndex?: number;
  onSelectEvent: (index: number) => void;
  textStyle: any;
  textSelectedStyle: any;
  loading?: boolean;
};

const ITEM_WIDTH = 140;
const SPACING = 12;

export default function EventSelector({
  events,
  selectedEventIndex = 0,
  onSelectEvent,
  textStyle,
  textSelectedStyle,
  loading,
}: Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const contentWidth =
    events.length * ITEM_WIDTH + (events.length - 1) * SPACING;

  const screenWidth = Dimensions.get("window").width;
  const needsScroll = contentWidth > screenWidth;

  const indexToOffset = (
    index: number,
    itemWidth: number,
    spacing: number,
    containerWidth: number,
  ) => {
    const centerOffset =
      index * (itemWidth + spacing) + itemWidth / 2 - containerWidth / 2;

    const maxOffset = Math.max(0, contentWidth - containerWidth);

    return Math.max(0, Math.min(centerOffset, maxOffset));
  };

  const onLayoutContainer = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // Auto-scroll to selected event
  useEffect(() => {
    if (scrollViewRef.current && containerWidth > 0 && events.length > 0) {
      const closestIndex = Math.min(
        Math.max(selectedEventIndex, 0),
        events.length - 1,
      );

      const targetX = indexToOffset(
        closestIndex,
        ITEM_WIDTH,
        SPACING,
        containerWidth,
      );

      scrollViewRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [containerWidth, events, selectedEventIndex]);

  if (loading) return <WeekSelectorSkeleton />;

  return (
    <View
      style={{ flexDirection: "row", marginVertical: 8 }}
      onLayout={onLayoutContainer}
    >
      <ScrollView
        horizontal
        ref={scrollViewRef}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          needsScroll
            ? {
                paddingHorizontal: SPACING / 2,
              }
            : {
                width: screenWidth,
                alignItems: "center",
                justifyContent: "space-around",
              }
        }
      >
        {events.map((event, index) => {
          const isSelected = index === selectedEventIndex;

          return (
            <TouchableOpacity
              key={event.slug}
              onPress={() => onSelectEvent(index)}
              style={{
                width: ITEM_WIDTH,
                marginRight: SPACING,
                paddingVertical: 6,
                paddingHorizontal: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={isSelected ? textSelectedStyle : textStyle} numberOfLines={1}>
                {event.slug}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
