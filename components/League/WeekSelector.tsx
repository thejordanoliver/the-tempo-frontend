import { Colors, Fonts } from "@/constants/styles";
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
import WeekSelectorSkeleton from "../Skeletons/WeekSelectorSkeleton";

export type FootballWeekGroup = {
  key: string;
  label: string;
  season: {
    year: number | null;
    type: number | null;
    slug: string | null;
  };
  week: {
    number: number | null;
  };
  count: number;
  games?: unknown[];
};

type Props = {
  groups: FootballWeekGroup[];
  loading: boolean;
  selectedWeekIndex?: number;
  onSelectWeek: (index: number) => void;
  isDark: boolean;
  containerStyle?: ViewStyle;
  itemWidth?: number;
};

const DEFAULT_ITEM_WIDTH = 100;
const SIDE_PADDING = 12;
const ITEM_SPACING = 0;
const ITEM_HEIGHT = 32;

function getWeekLabel(group: FootballWeekGroup) {
  const label = group.label || "";
  const weekNumber = group.week?.number;

  if (label.includes("Preseason Week")) {
    return `Pre Week ${weekNumber}`;
  }

  if (label.includes("Hall of Fame")) {
    return "HOF Week";
  }

  if (label.includes("Conference")) {
    return "Conf Round";
  }

  if (label.includes("Divisional")) {
    return "Div Round";
  }

  if (label.includes("Wild Card")) {
    return "Wild Card";
  }

  if (label.includes("Super Bowl")) {
    return "Super Bowl";
  }

  if (weekNumber !== null && weekNumber !== undefined) {
    return label || `Week ${weekNumber}`;
  }

  return label || "Week";
}

export default function WeekSelector({
  groups,
  loading,
  selectedWeekIndex = 0,
  onSelectWeek,
  isDark,
  containerStyle,
  itemWidth = DEFAULT_ITEM_WIDTH,
}: Props) {
  const styles = WeekSelectorStyles(isDark, itemWidth);

  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorX = useRef(new Animated.Value(0)).current;

  const [containerWidth, setContainerWidth] = useState(0);

  const itemStep = itemWidth + ITEM_SPACING;

  const safeSelectedIndex = useMemo(() => {
    if (!groups.length) return 0;

    return Math.min(Math.max(selectedWeekIndex, 0), groups.length - 1);
  }, [groups.length, selectedWeekIndex]);

  const onLayoutContainer = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const computeScrollOffset = useCallback(
    (index: number) => {
      if (!containerWidth || !groups.length) return 0;

      const targetOffset =
        SIDE_PADDING + index * itemStep - containerWidth / 2 + itemWidth / 2;

      const totalWidth =
        SIDE_PADDING * 2 +
        groups.length * itemWidth +
        ITEM_SPACING * Math.max(groups.length - 1, 0);

      const maxOffset = Math.max(0, totalWidth - containerWidth);

      return Math.max(0, Math.min(targetOffset, maxOffset));
    },
    [containerWidth, groups.length, itemStep, itemWidth],
  );

  const handleSelectWeek = useCallback(
    (index: number) => {
      onSelectWeek(index);

      scrollViewRef.current?.scrollTo({
        x: computeScrollOffset(index),
        animated: true,
      });
    },
    [computeScrollOffset, onSelectWeek],
  );

  useEffect(() => {
    if (!groups.length) return;

    Animated.spring(indicatorX, {
      toValue: safeSelectedIndex * itemStep,
      useNativeDriver: true,
      tension: 90,
      friction: 12,
    }).start();
  }, [safeSelectedIndex, itemStep, groups.length, indicatorX]);

  useEffect(() => {
    if (!scrollViewRef.current || !containerWidth || !groups.length) return;

    scrollViewRef.current.scrollTo({
      x: computeScrollOffset(safeSelectedIndex),
      animated: true,
    });
  }, [safeSelectedIndex, containerWidth, groups.length, computeScrollOffset]);

  if (loading && !groups.length) {
    return <WeekSelectorSkeleton />;
  }

  if (!groups.length) {
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

        {groups.map((group, index) => {
          const isSelected = index === safeSelectedIndex;

          return (
            <TouchableOpacity
              key={group.key || `${group.season?.slug}-${group.week?.number}`}
              activeOpacity={0.75}
              onPress={() => handleSelectWeek(index)}
              style={styles.label}
            >
              <Text
                numberOfLines={1}
                style={isSelected ? styles.monthTextSelected : styles.monthText}
              >
                {getWeekLabel(group)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const WeekSelectorStyles = (isDark: boolean, itemWidth: number) =>
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
      padding: 4,
      borderRadius: 12,
      zIndex: 2,
    },
    monthText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    monthTextSelected: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 16,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
    },
  });

  