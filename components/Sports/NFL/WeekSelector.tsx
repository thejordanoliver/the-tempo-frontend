// components/WeekSelector.tsx
import WeekSelectorSkeleton from "components/Skeletons/WeekSelectorSkeleton";
import { Colors, Fonts } from "constants/Styles";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
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
  loading?: boolean;
  isDark: boolean;
};

const ITEM_WIDTH = 80;
const SPACING = 12;

const LABEL_OVERRIDES: Record<string, string> = {
  "Conference Championships": "Conf Champ",
  "Divisional Round": "Div Round",
  "Hall of Fame Weekend": "HOF Week",
  "Pre Season Week 1": "Pre Week 1",
  "Pre Season Week 2": "Pre Week 2",
  "Pre Season Week 3": "Pre Week 3",
};

export default function WeekSelector({
  weeks,
  selectedWeekIndex = 0,
  onSelectWeek,
  loading,
  isDark,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const styles = useMemo(() => WeekSelectorStyles(isDark), [isDark]);

  // Auto-scroll to selected week
  useEffect(() => {
    if (!scrollRef.current || containerWidth === 0 || weeks.length === 0)
      return;

    const targetX =
      selectedWeekIndex * (ITEM_WIDTH + SPACING) -
      containerWidth / 2 +
      ITEM_WIDTH / 2;

    scrollRef.current.scrollTo({ x: targetX, animated: true });
  }, [selectedWeekIndex, containerWidth, weeks]);

  if (loading) return <WeekSelectorSkeleton />;

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ marginVertical: 8 }}
    >
      <ScrollView
        horizontal
        ref={scrollRef}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {weeks.map((week, index) => {
          const isSelected = index === selectedWeekIndex;
          const label = LABEL_OVERRIDES[week.label] ?? week.label;

          return (
            <TouchableOpacity
              key={`${week.stage}-${week.label}`}
              onPress={() => onSelectWeek(index)}
              style={styles.label}
            >
              <Text
                style={isSelected ? styles.monthTextSelected : styles.monthText}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const WeekSelectorStyles = (isDark: boolean) =>
  StyleSheet.create({
    contentContainerStyle: {
      paddingHorizontal: SPACING,
      alignItems: "center",
    },
    monthText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    monthTextSelected: {
      fontSize: 16,
      textAlign: "center",
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    label: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
  });
