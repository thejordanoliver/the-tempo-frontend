// components/DateNavigator.tsx
import { Colors, Fonts, MIN_TOUCH_TARGET } from "constants/styles";
import dayjs from "dayjs";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  selectedDate: Date;
  onChangeDate: (days: number) => void;
  onOpenCalendar: () => void;
  isDark: boolean;
};

export default function DateNavigator({
  selectedDate,
  onChangeDate,
  onOpenCalendar,
  isDark,
}: Props) {
  const styles = getStyles(isDark);
  // Use the same calendar day as the scores request and calendar selection.
  const date = dayjs(selectedDate);

  return (
    <View style={styles.dateNavContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Previous day"
        onPress={() => onChangeDate(-1)}
        style={styles.dateNavButton}
        activeOpacity={0.7}
      >
        <Image
          source={require("../assets/icons/back.png")}
          style={{
            width: 20,
            height: 20,
            tintColor: isDark ? Colors.black : Colors.white,
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={date.format("dddd, MMMM D, YYYY")}
        accessibilityHint="Opens the calendar to choose a date"
        onPress={onOpenCalendar}
        style={styles.dateNavButton}
        activeOpacity={0.7}
      >
        <Text style={styles.dateNavText}>
          {date.format("MMM D")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Next day"
        onPress={() => onChangeDate(1)}
        style={styles.dateNavButton}
        activeOpacity={0.7}
      >
        <Image
          source={require("../assets/icons/forward.png")}
          style={{
            width: 20,
            height: 20,
            tintColor: isDark ? Colors.black : Colors.white,
          }}
        />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    dateNavContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 12,
    },
    dateNavButton: {
      minWidth: MIN_TOUCH_TARGET,
      minHeight: MIN_TOUCH_TARGET,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
    dateNavText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 18,
      color: isDark ? Colors.black : Colors.white,
    },
  });
