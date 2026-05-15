// components/League/WeekSelector.tsx
import WeekSelectorSkeleton from "components/Skeletons/WeekSelectorSkeleton";
import { Colors, Fonts } from "constants/styles";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type FootballCalendarItem = {
  label: string;
  stage: string;
  alternateLabel?: string;
  detail?: string;
  weekNumber?: number;
  startDate?: string;
  endDate?: string;
};

export type MMACalendarItem = {
  label: string;
  stage?: string;
  eventNumber?: number;
  startDate?: string;
  endDate?: string;
  eventRef?: string | null;
  eventId?: string | null;
};

type SharedProps = {
  loading?: boolean;
  isDark: boolean;
};

type FootballProps = SharedProps & {
  mode?: "football";
  weeks: FootballCalendarItem[];
  selectedWeekIndex?: number;
  onSelectWeek: (index: number) => void;

  events?: never;
  selectedEventIndex?: never;
  onSelectEvent?: never;
};

type MMAProps = SharedProps & {
  mode?: "mma";
  events: MMACalendarItem[];
  selectedEventIndex?: number;
  onSelectEvent: (index: number) => void;

  weeks?: never;
  selectedWeekIndex?: never;
  onSelectWeek?: never;
};

type Props = FootballProps | MMAProps;

const FOOTBALL_ITEM_WIDTH = 100;
const MMA_ITEM_WIDTH = 132;
const SPACING = 12;

const LABEL_OVERRIDES: Record<string, string> = {
  "Conference Championship": "Conf Champ",
  "Divisional Round": "Div Round",
  "Hall of Fame Weekend": "HOF Week",
  "Preseason Week 1": "Pre Week 1",
  "Preseason Week 2": "Pre Week 2",
  "Preseason Week 3": "Pre Week 3",
};

const isMMAProps = (props: Props): props is MMAProps => {
  return Array.isArray((props as MMAProps).events);
};

const formatDateLabel = (date?: string) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const getMMAPrimaryLabel = (event: MMACalendarItem, index: number) => {
  const label = event.label?.trim();

  if (!label) {
    return `Event ${event.eventNumber ?? index + 1}`;
  }

  const freedomMatch = label.match(/^UFC\s+Freedom\s+\d+/i);
  if (freedomMatch) {
    return freedomMatch[0].replace(/^UFC\s+/i, "");
  }

  const numberedUFCMatch = label.match(/^UFC\s+\d+/i);
  if (numberedUFCMatch) {
    return numberedUFCMatch[0].toUpperCase();
  }

  if (/^UFC\s+Fight Night/i.test(label)) {
    return `Fight Night ${event.eventNumber ?? index + 1}`;
  }

  return label.split(":")[0].replace(/^UFC\s+/i, "");
};

const getMMASecondaryLabel = (event: MMACalendarItem) => {
  const matchup = event.label?.split(":")?.[1]?.trim();

  if (matchup) {
    return matchup;
  }

  return formatDateLabel(event.startDate);
};

const getFootballLabel = (week: FootballCalendarItem) => {
  return LABEL_OVERRIDES[week.label] ?? week.alternateLabel ?? week.label;
};

export default function WeekSelector(props: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const isMMA = isMMAProps(props);

  const itemWidth = isMMA ? MMA_ITEM_WIDTH : FOOTBALL_ITEM_WIDTH;
  const snapInterval = itemWidth + SPACING;

  const selectedIndex = isMMA
    ? props.selectedEventIndex ?? 0
    : props.selectedWeekIndex ?? 0;

  const itemCount = isMMA ? props.events.length : props.weeks.length;

  const styles = useMemo(
    () => WeekSelectorStyles(props.isDark, itemWidth, isMMA),
    [props.isDark, itemWidth, isMMA],
  );

  useEffect(() => {
    if (!scrollRef.current || containerWidth === 0 || itemCount === 0) {
      return;
    }

    const targetX =
      selectedIndex * snapInterval - containerWidth / 2 + itemWidth / 2;

    scrollRef.current.scrollTo({
      x: Math.max(0, targetX),
      animated: true,
    });
  }, [selectedIndex, containerWidth, itemCount, itemWidth, snapInterval]);

  if (props.loading) return <WeekSelectorSkeleton />;

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={styles.wrapper}
    >
      <ScrollView
        horizontal
        ref={scrollRef}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {isMMA
          ? props.events.map((event, index) => {
              const isSelected = index === selectedIndex;
              const primaryLabel = getMMAPrimaryLabel(event, index);
              const secondaryLabel = getMMASecondaryLabel(event);

              return (
                <TouchableOpacity
                  key={`${event.eventId ?? event.label}-${index}`}
                  onPress={() => props.onSelectEvent(index)}
                  activeOpacity={0.75}
                  style={[styles.label, isSelected && styles.labelSelected]}
                >
                  <Text
                    style={
                      isSelected ? styles.monthTextSelected : styles.monthText
                    }
                    numberOfLines={1}
                  >
                    {primaryLabel}
                  </Text>

                  {secondaryLabel ? (
                    <Text
                      style={
                        isSelected
                          ? styles.detailTextSelected
                          : styles.detailText
                      }
                      numberOfLines={1}
                    >
                      {secondaryLabel}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })
          : props.weeks.map((week, index) => {
              const isSelected = index === selectedIndex;
              const primaryLabel = getFootballLabel(week);

              return (
                <TouchableOpacity
                  key={`${week.stage}-${week.label}-${index}`}
                  onPress={() => props.onSelectWeek(index)}
                  activeOpacity={0.75}
                  style={[styles.label, isSelected && styles.labelSelected]}
                >
                  <Text
                    style={
                      isSelected ? styles.monthTextSelected : styles.monthText
                    }
                    numberOfLines={1}
                  >
                    {primaryLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
      </ScrollView>
    </View>
  );
}

const WeekSelectorStyles = (
  isDark: boolean,
  itemWidth: number,
  isMMA: boolean,
) =>
  StyleSheet.create({
    wrapper: {
      marginVertical: 8,
    },
    contentContainerStyle: {
      paddingHorizontal: SPACING,
      alignItems: "center",
      gap: SPACING,
    },
    label: {
      width: itemWidth,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: isMMA ? 8 : 6,
      paddingHorizontal: 10,
      borderRadius: 14,
    },
    labelSelected: {
      backgroundColor: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.06)",
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
    detailText: {
      marginTop: 2,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      textAlign: "center",
      color: isDark ? Colors.lightGray : Colors.darkGray,
      opacity: 0.75,
    },
    detailTextSelected: {
      marginTop: 2,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 12,
      textAlign: "center",
      color: isDark ? Colors.white : Colors.black,
      opacity: 0.9,
    },
  });