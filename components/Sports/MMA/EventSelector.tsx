import { Colors, Fonts } from "@/constants/styles";
import WeekSelectorSkeleton from "components/Skeletons/WeekSelectorSkeleton";
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
  StyleSheet,
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
const SIDE_PADDING = 12;
const ITEM_SPACING = 0;
const ITEM_HEIGHT = 32;

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
  const styles = EventSelectorStyles(isDark, itemWidth);

  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorX = useRef(new Animated.Value(0)).current;

  const [containerWidth, setContainerWidth] = useState(0);

  const itemStep = itemWidth + ITEM_SPACING;

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
        SIDE_PADDING + index * itemStep - containerWidth / 2 + itemWidth / 2;

      const totalWidth =
        SIDE_PADDING * 2 +
        events.length * itemWidth +
        ITEM_SPACING * Math.max(events.length - 1, 0);

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
    return <WeekSelectorSkeleton />;
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
              style={styles.label}
            >
              <Text
                numberOfLines={1}
                style={isSelected ? styles.eventTextSelected : styles.eventText}
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

const EventSelectorStyles = (isDark: boolean, itemWidth: number) =>
  StyleSheet.create({
    wrapper: {
      marginVertical: 8,
    },
    contentContainerStyle: {
      position: "relative",
      paddingHorizontal: SIDE_PADDING,
      alignItems: "center",
    },
    slidingSelectedContainer: {
      position: "absolute",
      left: SIDE_PADDING,
      top: 0,
      width: itemWidth,
      height: ITEM_HEIGHT,
      borderRadius: 12,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    label: {
      width: itemWidth,
      height: ITEM_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 8,
      borderRadius: 12,
      zIndex: 2,
    },
    eventText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    eventTextSelected: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
  });
