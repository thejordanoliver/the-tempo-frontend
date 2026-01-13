import { useEffect, useRef } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MonthItem = {
  month: number; // 0–11
  year: number;
};

type Props = {
  months: MonthItem[];
  selectedDate: Date | null;
  onSelect: (month: number, year: number, index: number) => void;
  styles: {
    monthSelector: any;
    monthButton: any;
    monthButtonSelected: any;
    monthText: any;
    monthTextSelected: any;
  };
};

export default function MonthSelector({
  months,
  selectedDate,
  onSelect,
  styles,
}: Props) {
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
        m.year === selectedDate.getFullYear()
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
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
