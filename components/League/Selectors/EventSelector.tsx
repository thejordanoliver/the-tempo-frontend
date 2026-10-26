import { activeOpacity } from "@/constants/styles";
import { DateSelectorStyles } from "@/styles/LeagueStyles/DateSelectorStyles";
import WeekSelectorSkeleton from "components/Skeletons/WeekSelectorSkeleton";
import {
  DATE_SELECTOR_ITEM_SPACING,
  DATE_SELECTOR_SIDE_PADDING,
} from "constants/dateSelectorConstants";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type UFCCalendarEvent = {
  label: string;
  startDate: string;
  endDate?: string | null;
  event?: {
    $ref?: string;
  };
};

type Props = {
  events: UFCCalendarEvent[];
  selectedEventIndex?: number;
  onSelectEvent: (index: number) => void;
  isDark: boolean;
  loading?: boolean;
  containerStyle?: ViewStyle;
  itemWidth?: number;
};

const DEFAULT_ITEM_WIDTH = 140;

export function getUFCEventId(event: UFCCalendarEvent | null | undefined) {
  const ref = event?.event?.$ref;
  return ref?.match(/\/events\/([^?]+)/)?.[1] ?? null;
}

export function getUFCEventKey(event: UFCCalendarEvent) {
  return getUFCEventId(event) ?? `${event.label}-${event.startDate}`;
}

export function getDefaultUFCEventIndex(events: UFCCalendarEvent[]) {
  if (!events.length) return 0;

  const now = Date.now();

  const currentIndex = events.findIndex((event) => {
    const start = new Date(event.startDate).getTime();
    const end = new Date(event.endDate ?? event.startDate).getTime();

    return (
      Number.isFinite(start) &&
      Number.isFinite(end) &&
      start <= now &&
      now <= end
    );
  });

  if (currentIndex >= 0) return currentIndex;

  const upcomingIndex = events.findIndex((event) => {
    const start = new Date(event.startDate).getTime();
    return Number.isFinite(start) && start >= now;
  });

  return upcomingIndex >= 0 ? upcomingIndex : events.length - 1;
}

function getEventLabel(event: UFCCalendarEvent) {
  const label = event.label || "";

  if (label.includes(":")) {
    const [shortLabel] = label.split(":");
    return shortLabel.trim();
  }

  if (label.includes("Fight Night")) {
    return "Fight Night";
  }

  return label || "Event";
}

export default function EventSelector({
  events,
  selectedEventIndex = 0,
  onSelectEvent,
  isDark,
  loading = false,
  containerStyle,
  itemWidth = DEFAULT_ITEM_WIDTH,
}: Props) {
  const styles = DateSelectorStyles(isDark, { itemWidth });

  const scrollViewRef = useRef<ScrollView>(null);
  const [indicatorX] = useState(() => new Animated.Value(0));

  const [containerWidth, setContainerWidth] = useState(0);

  const itemStep = itemWidth + DATE_SELECTOR_ITEM_SPACING;

  const safeSelectedIndex = useMemo(() => {
    if (!events.length) return 0;

    return Math.min(Math.max(selectedEventIndex, 0), events.length - 1);
  }, [events.length, selectedEventIndex]);

  const onLayoutContainer = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const computeScrollOffset = useCallback(
    (index: number) => {
      if (!containerWidth || !events.length) return 0;

      const targetOffset =
        DATE_SELECTOR_SIDE_PADDING +
        index * itemStep -
        containerWidth / 2 +
        itemWidth / 2;

      const totalWidth =
        DATE_SELECTOR_SIDE_PADDING * 2 +
        events.length * itemWidth +
        DATE_SELECTOR_ITEM_SPACING * Math.max(events.length - 1, 0);

      const maxOffset = Math.max(0, totalWidth - containerWidth);

      return Math.max(0, Math.min(targetOffset, maxOffset));
    },
    [containerWidth, events.length, itemStep, itemWidth],
  );

  const handleSelectEvent = useCallback(
    (index: number) => {
      onSelectEvent(index);

      scrollViewRef.current?.scrollTo({
        x: computeScrollOffset(index),
        animated: true,
      });
    },
    [computeScrollOffset, onSelectEvent],
  );

  useEffect(() => {
    if (!events.length) return;

    Animated.spring(indicatorX, {
      toValue: safeSelectedIndex * itemStep,
      useNativeDriver: true,
      tension: 90,
      friction: 12,
    }).start();
  }, [safeSelectedIndex, itemStep, events.length, indicatorX]);

  useEffect(() => {
    if (!scrollViewRef.current || !containerWidth || !events.length) return;

    scrollViewRef.current.scrollTo({
      x: computeScrollOffset(safeSelectedIndex),
      animated: true,
    });
  }, [safeSelectedIndex, containerWidth, events.length, computeScrollOffset]);

  if (loading && !events.length) {
    return <WeekSelectorSkeleton itemWidth={itemWidth} />;
  }

  if (!events.length) {
    return null;
  }

  return (
    <View style={[styles.wrapper, containerStyle]} onLayout={onLayoutContainer}>
      <ScrollView
        ref={scrollViewRef}
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

        {events.map((event, index) => {
          const isSelected = index === safeSelectedIndex;

          return (
            <TouchableOpacity
              key={getUFCEventKey(event)}
              activeOpacity={activeOpacity}
              onPress={() => handleSelectEvent(index)}
              style={styles.item}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={isSelected ? styles.selectedLabel : styles.label}
              >
                {getEventLabel(event)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
