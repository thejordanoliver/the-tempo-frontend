// components/DateNavigator.tsx
import {
  activeOpacity,
  Colors,
  Fonts,
  MIN_TOUCH_TARGET,
} from "constants/styles";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
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
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  // Use the same calendar day as the scores request and calendar selection.
  const timestamp = selectedDate.getTime();
  const { label, accessibilityLabel } = useMemo(() => {
    const date = dayjs(timestamp);
    return {
      label: date.format("MMM D"),
      accessibilityLabel: date.format("dddd, MMMM D, YYYY"),
    };
  }, [timestamp]);
  const previousDay = useCallback(() => onChangeDate(-1), [onChangeDate]);
  const nextDay = useCallback(() => onChangeDate(1), [onChangeDate]);

  return (
    <View style={styles.dateNavContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Previous day"
        onPress={previousDay}
        style={styles.dateNavButton}
        activeOpacity={activeOpacity}
      >
        <Image
          source={require("../assets/icons/back.png")}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Opens the calendar to choose a date"
        onPress={onOpenCalendar}
        style={styles.dateNavButton}
        activeOpacity={activeOpacity}
      >
        <Text style={styles.dateNavText}>{label}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Next day"
        onPress={nextDay}
        style={styles.dateNavButton}
        activeOpacity={activeOpacity}
      >
        <Image
          source={require("../assets/icons/forward.png")}
          style={styles.arrowIcon}
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
    arrowIcon: {
      width: 20,
      height: 20,
      tintColor: isDark ? Colors.black : Colors.white,
    },
  });
