// components/DateNavigator.tsx
import { Colors, Fonts } from "constants/styles";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

dayjs.extend(utc);
dayjs.extend(timezone);
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

  return (
    <View style={styles.dateNavContainer}>
      <TouchableOpacity
        onPress={() => onChangeDate(-1)}
        style={styles.dateNavButton}
        activeOpacity={0.7}
      >
        <Image
          source={require("../assets/icons8/back.png")}
          style={{
            width: 20,
            height: 20,
            tintColor: isDark ? Colors.black : Colors.white,
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onOpenCalendar}
        style={styles.dateNavButton}
        activeOpacity={0.7}
      >
        <Text style={styles.dateNavText}>
          {dayjs(selectedDate).tz("America/New_York").format("MMM D")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChangeDate(1)}
        style={styles.dateNavButton}
        activeOpacity={0.7}
      >
        <Image
          source={require("../assets/icons8/forward.png")}
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
