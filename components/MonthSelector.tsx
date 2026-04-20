import { Colors, Fonts } from "constants/styles";
import { useEffect, useRef } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MonthSelectorSkeleton from "./Skeletons/MonthSelectorSkeleton";
import { usePreferences } from "contexts/PreferencesContext";

type MonthItem = {
  month: number; // 0–11
  year: number;
};

type Props = {
  months: MonthItem[];
  selectedDate: Date | null;
  onSelect: (month: number, year: number, index: number) => void;
  loading: boolean;
  gameCountByMonth: Map<string, number>;
};

export default function MonthSelector({
  months,
  selectedDate,
  onSelect,
  loading,
  gameCountByMonth,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = monthSelectorStyles(isDark);
  const scrollRef = useRef<ScrollView>(null);

  const ITEM_WIDTH = 70;
  const SPACING = 12;
  const screenWidth = Dimensions.get("window").width;

  const contentWidth =
    months.length * ITEM_WIDTH + (months.length - 1) * SPACING;

  const needsScroll = contentWidth > screenWidth;

  // Center selected month on mount / change
  useEffect(() => {
    if (!selectedDate || months.length === 0 || !needsScroll) return;

    const index = months.findIndex(
      (m) =>
        m.month === selectedDate.getMonth() &&
        m.year === selectedDate.getFullYear(),
    );

    if (index === -1 || !scrollRef.current) return;

    const scrollToX =
      index * (ITEM_WIDTH + SPACING) - screenWidth / 2 + ITEM_WIDTH / 2;

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: Math.max(0, scrollToX),
        animated: true,
      });
    });
  }, [selectedDate, months, needsScroll]);

  if (loading) return <MonthSelectorSkeleton />;

  return (
    <View style={styles.monthSelector}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={
          needsScroll
            ? {
                paddingHorizontal: SPACING / 2,
              }
            : {
                width: screenWidth, // 🔥 THIS IS THE KEY
                alignItems: "center", // center items horizontally
                justifyContent: "space-around",
              }
        }
      >
        {months.map(({ month, year }, index) => {
          const isSelected =
            selectedDate?.getMonth() === month &&
            selectedDate?.getFullYear() === year;
          const key = `${year}-${month}`;
          const count = gameCountByMonth.get(key) ?? 0;

          const label = new Date(year, month).toLocaleString("en-US", {
            month: "short",
          });

          return (
            <TouchableOpacity
              key={`${month}-${year}`}
              onPress={() => onSelect(month, year, index)}
              style={[
                styles.monthButton,
                {
                  width: ITEM_WIDTH,
                  marginHorizontal: needsScroll ? SPACING / 2 : SPACING / 2,
                },
                isSelected && styles.monthButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.monthText,
                  isSelected && styles.monthTextSelected,
                ]}
              >
                {label}
              </Text>
              <Text
                style={[
                  styles.gameCountText,
                  isSelected && styles.gameCountTextSelected,
                ]}
              >
                {count} Games
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const monthSelectorStyles = (isDark: boolean) =>
  StyleSheet.create({
    monthSelector: {
      flexDirection: "row",
    },
    monthButton: {
      marginBottom: 8,
      textAlign: "center",
    },
    monthButtonSelected: {
      backgroundColor: "transparent",
    },
    monthText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 20,
      color: Colors.midTone,
      textAlign: "center",
    },
    gameCountText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: Colors.midTone,
      textAlign: "center",
    },
    monthTextSelected: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    gameCountTextSelected: {
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
  });
